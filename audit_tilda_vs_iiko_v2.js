const fs = require('fs');
const path = require('path');

// Load mapping.js (using the temp file we created which is definitely a module)
// Actually, lib/mapping.js IS already a module ("module.exports = [...]").
// My previous attempt failed likely due to syntax error or relative path issue in require.
// Let's try absolute path require.
const mappingPath = path.join(__dirname, 'lib/mapping.js');
let mappings;
try {
  mappings = require(mappingPath);
} catch (e) {
  console.error("Require failed:", e);
  process.exit(1);
}

// Load меню2.txt (iiko menu)
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

const missingInIiko = [];
const zeroPriceInIiko = [];

mappings.forEach(m => {
    const idToCheck = m.iikoProductId; // Primary ID
    const name = m.tildaName;
    
    if (!idToCheck) return; 

    const iikoItem = iikoItems.get(idToCheck);

    if (!iikoItem) {
        missingInIiko.push({
            tildaName: name,
            id: idToCheck
        });
    } else {
        let price = 0;
        if (iikoItem.isSize) {
            price = iikoItem.price;
        } else if (iikoItem.itemSizes && iikoItem.itemSizes.length > 0) {
             const hasPrice = iikoItem.itemSizes.some(s => s.prices?.[0]?.price > 0);
             price = hasPrice ? 999 : 0; 
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
if (missingInIiko.length === 0) console.log("None.");
else {
    const unique = [...new Set(missingInIiko.map(i => `${i.tildaName} (${i.id})`))];
    unique.forEach(u => console.log(`[MISSING] ${u}`));
}

console.log("\n=== ITEMS IN TILDA MAPPED TO 0-PRICE IIKO ITEMS ===");
if (zeroPriceInIiko.length === 0) console.log("None.");
else {
    const unique = [...new Set(zeroPriceInIiko.map(i => `${i.tildaName} -> ${i.iikoName} (${i.group})`))];
    unique.forEach(u => console.log(`[ZERO PRICE] ${u}`));
}
