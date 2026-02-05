const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'lib/mapping.js');
const rawContent = fs.readFileSync(mappingPath, 'utf8');

// Strip module.exports to parse JSON
const jsonContent = rawContent.replace('module.exports =', '').replace(/;$/, '').trim();
let mapping = [];
try {
    mapping = eval(jsonContent);
} catch (e) {
    console.log('JSON parse failed, trying eval');
    mapping = eval(jsonContent);
}

if (!Array.isArray(mapping)) {
    console.error('Mapping is not an array');
    process.exit(1);
}

const QUICHE_SMALL_ID = "b4dd8e9b-832a-4ab9-8ddc-7f3a388d9ac8";
const QUICHE_LARGE_ID = "7c23e0c5-ef2e-4a16-8653-15918a7807d7";
const OSSETIAN_SMALL_ID = "142e6e38-e23f-4410-ab26-e5727839952a";
const OSSETIAN_LARGE_ID = "2dcef2ee-a9fc-45db-93eb-398707dec71a";

const updates = [
    // Sweet Quiches/Pies - Split 1500
    { sku: "17150", type: "Quiche", split: 1500 },
    { sku: "17032", type: "Quiche", split: 1500 },
    { sku: "17031", type: "Quiche", split: 1500 },
    { sku: "18163", type: "Quiche", split: 1500 },
    
    // Savory Quiches - Split 1700
    { sku: "17151", type: "Quiche", split: 1700 },
    { sku: "18161", type: "Quiche", split: 1700 },
    { sku: "18162", type: "Quiche", split: 1700 },
    { sku: "17033", type: "Quiche", split: 1700 },
    { sku: "17034", type: "Quiche", split: 1700 },

    // Ossetian Pies - Split 1000
    { sku: "17152", type: "Ossetian", split: 1000 },
    { sku: "17035", type: "Ossetian", split: 1000 },
    { sku: "17036", type: "Ossetian", split: 1000 },
];

let modifiedCount = 0;
const newMapping = [];

mapping.forEach(entry => {
    const update = updates.find(u => u.sku === entry.tildaSku);
    
    // If it's a target SKU and has NO price constraints, split it
    if (update && entry.minPrice === undefined && entry.maxPrice === undefined) {
        console.log(`Splitting ${entry.tildaName} (SKU: ${entry.tildaSku})`);
        
        const smallId = update.type === 'Quiche' ? QUICHE_SMALL_ID : OSSETIAN_SMALL_ID;
        const largeId = update.type === 'Quiche' ? QUICHE_LARGE_ID : OSSETIAN_LARGE_ID;
        
        const smallEntry = {
            ...entry,
            sizeId: smallId,
            maxPrice: update.split,
            comment: `Small size (<${update.split})`
        };
        
        const largeEntry = {
            ...entry,
            sizeId: largeId,
            minPrice: update.split,
            comment: `Large size (>=${update.split})`
        };
        
        newMapping.push(smallEntry, largeEntry);
        modifiedCount++;
    } else {
        // Keep existing entry
        newMapping.push(entry);
    }
});

if (modifiedCount > 0) {
    const newContent = `module.exports = ${JSON.stringify(newMapping, null, 2)};`;
    fs.writeFileSync(mappingPath, newContent, 'utf8');
    console.log(`Successfully split ${modifiedCount} entries in mapping.js`);
} else {
    console.log('No changes needed.');
}
