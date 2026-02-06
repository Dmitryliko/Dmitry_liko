const fs = require('fs');
const path = require('path');

// Read the new menu file
const menuPath = path.join(__dirname, 'меню2.txt');
let menuData;
try {
  menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
} catch (e) {
  console.error('Error reading меню2.txt:', e.message);
  process.exit(1);
}

// Flatten items from all categories
const allItems = [];
if (menuData.itemCategories) {
  menuData.itemCategories.forEach(cat => {
    if (cat.items) {
      cat.items.forEach(item => {
        item.groupName = cat.name;
        allItems.push(item);
      });
    }
  });
}

console.log(`Loaded ${allItems.length} items from меню2.txt`);

// Read existing mapping
const mappingPath = path.join(__dirname, 'lib/mapping.js');
const mappingContent = fs.readFileSync(mappingPath, 'utf8');

// Extract current mappings (simple regex extraction)
// This is a rough extraction to find IDs currently in use
const idRegex = /"(?:iikoProductId|productSizeId|sizeId)":\s*"([a-f0-9-]+)"/g;
const mappedIds = new Set();
let match;
while ((match = idRegex.exec(mappingContent)) !== null) {
  mappedIds.add(match[1]);
}

console.log(`Found ${mappedIds.size} unique IDs in mapping.js`);

// 1. Check for "Славянский"
const slavyansky = allItems.filter(i => i.name.toLowerCase().includes('славянский'));
if (slavyansky.length > 0) {
  console.log('\n--- Found "Славянский" items in Menu ---');
  slavyansky.forEach(item => {
    console.log(`Name: ${item.name}`);
    console.log(`ID: ${item.itemId}`);
    console.log(`Group: ${item.groupName}`);
    if (item.itemSizes && item.itemSizes.length > 0) {
      item.itemSizes.forEach(size => {
         console.log(`  Size: ${size.sizeName} | Price: ${size.prices[0]?.price} | SizeID: ${size.sizeId}`);
      });
    }
    console.log('---');
  });
} else {
  console.log('\n--- "Славянский" NOT found in Menu ---');
}


// 2. Check for Cheesecakes (Чизкейк)
const cheesecakes = allItems.filter(i => i.name.toLowerCase().includes('чизкейк'));
console.log(`\n--- Found ${cheesecakes.length} Cheesecakes in Menu ---`);
cheesecakes.forEach(item => {
    console.log(`Name: ${item.name}`);
    console.log(`ID: ${item.itemId}`);
    if (item.itemSizes && item.itemSizes.length > 0) {
      item.itemSizes.forEach(size => {
         console.log(`  Size: ${size.sizeName} | Price: ${size.prices[0]?.price} | SizeID: ${size.sizeId}`);
      });
    }
});

// 3. Find 0-price mappings in mapping.js that have sellable versions in new menu
// We need to parse mapping.js more robustly or just check known bad IDs against new menu
// For now, let's just list items in menu that are priced 0 vs priced > 0
console.log('\n--- Zero Price Check in Menu ---');
const zeroPriceItems = allItems.filter(i => {
    if (i.itemSizes && i.itemSizes.length > 0) {
        return i.itemSizes.some(s => s.prices[0]?.price === 0);
    }
    return false; // Assume complex items might be checked differently
});
console.log(`Found ${zeroPriceItems.length} items with 0 price in menu.`);
