const fs = require('fs');
const path = require('path');

// 1. Load mapping.js
const mappingPath = path.join(__dirname, 'lib/mapping.js');
let mappingContent;
try {
  mappingContent = fs.readFileSync(mappingPath, 'utf8');
} catch (e) {
  console.error("Error reading mapping.js", e);
  process.exit(1);
}

// Extract mappings using a simple regex/eval approach or by requiring the file if possible.
// Since it's a JS file with module.exports, we might be able to require it directly if dependencies allow.
// But it might depend on other things. Let's try to extract the array via regex for safety.
// The file ends with `module.exports = mapping;` and defines `const mapping = [...]`.
// We will try to extract the JSON-like array content.
const start = mappingContent.indexOf('const mapping = [');
const end = mappingContent.lastIndexOf('];');

if (start === -1 || end === -1) {
  console.error("Could not parse mapping array from file");
  process.exit(1);
}

const arrayString = mappingContent.substring(start + 16, end + 1); // "const mapping = " is 16 chars
let mappings;
try {
    // We need to evaluate this string because it's JS code, not pure JSON (might have comments, loose keys)
    // However, for safety and simplicity, let's try to `eval` it in a sandbox or just use `require` if we can.
    // Let's try `require` first, assuming it doesn't have complex external deps.
    mappings = require('./lib/mapping.js');
} catch (e) {
    console.log("Require failed (" + e.message + "), trying manual parse...");
    // If require fails (e.g. missing deps), we fall back to regex extraction of objects
    // This is brittle, so let's hope require works or use a smarter regex loop.
    process.exit(1);
}

// 2. Load меню2.txt (iiko menu)
const menuPath = path.join(__dirname, 'меню2.txt');
let menuData;
try {
  menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
} catch (e) {
  console.error("Error reading меню2.txt", e);
  process.exit(1);
}

// Flatten iiko items
const iikoItems = new Map(); // ID -> Item
if (menuData.itemCategories) {
  menuData.itemCategories.forEach(cat => {
    if (cat.items) {
      cat.items.forEach(item => {
        iikoItems.set(item.itemId, { ...item, group: cat.name });
        // Also map sizeIds if present
        if (item.itemSizes) {
            item.itemSizes.forEach(size => {
                iikoItems.set(size.sizeId, { 
                    ...item, 
                    isSize: true, 
                    sizeName: size.sizeName, 
                    price: size.prices?.[0]?.price || 0,
                    parentId: item.itemId 
                });
            });
        }
      });
    }
  });
}

console.log(`Loaded ${mappings.length} mappings from Tilda configuration.`);
console.log(`Loaded ${iikoItems.size} unique IDs (items + sizes) from iiko menu.`);

const missingInIiko = [];
const zeroPriceInIiko = [];

mappings.forEach(m => {
    // We care about iikoProductId, productSizeId, sizeId
    // Some mappings use 'iikoProductId' for the main item.
    // Some use 'sizeId' or 'productSizeId' for specific sizes.
    
    const idToCheck = m.iikoProductId; // Primary ID
    const name = m.tildaName;
    
    if (!idToCheck) return; // Skip if no ID (maybe just logic)

    const iikoItem = iikoItems.get(idToCheck);

    if (!iikoItem) {
        missingInIiko.push({
            tildaName: name,
            id: idToCheck,
            reason: "ID not found in iiko menu"
        });
    } else {
        // Check for 0 price if it's not a modifier/size with explicit price logic
        // If it's a main item mapping
        
        // Note: In new menu structure, price is inside 'itemSizes' or 'prices'.
        // Our flattened map for sizes has 'price'. For main items, we check 'itemSizes'.
        
        let price = 0;
        if (iikoItem.isSize) {
            price = iikoItem.price;
        } else if (iikoItem.itemSizes && iikoItem.itemSizes.length > 0) {
             // Check if ALL sizes are 0 or just the one we mapped?
             // If we mapped the product ID, usually we expect at least one size to be sellable.
             // We'll check if the *default* size or *any* size has price > 0.
             const hasPrice = iikoItem.itemSizes.some(s => s.prices?.[0]?.price > 0);
             price = hasPrice ? 999 : 0; // Logic flag
        } else if (iikoItem.prices && iikoItem.prices.length > 0) {
             price = iikoItem.prices[0].price;
        }

        if (price === 0 && !m.comment?.toLowerCase().includes('gift') && !m.comment?.toLowerCase().includes('подарок')) {
             zeroPriceInIiko.push({
                tildaName: name,
                id: idToCheck,
                iikoName: iikoItem.name,
                group: iikoItem.group
             });
        }
    }
});

console.log("\n=== ITEMS IN TILDA (MAPPING) BUT MISSING IN IIKO ===");
if (missingInIiko.length === 0) console.log("None. All mapped IDs exist in iiko.");
else {
    missingInIiko.forEach(item => {
        console.log(`[MISSING] ${item.tildaName} (ID: ${item.id})`);
    });
}

console.log("\n=== ITEMS IN TILDA MAPPED TO 0-PRICE IIKO ITEMS (Potential Issues) ===");
if (zeroPriceInIiko.length === 0) console.log("None.");
else {
    zeroPriceInIiko.forEach(item => {
        console.log(`[ZERO PRICE] ${item.tildaName} -> ${item.iikoName} (Group: ${item.group})`);
    });
}
