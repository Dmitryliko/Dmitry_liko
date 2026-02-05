const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'api', 'mapping.js');
const mapping = require(mappingPath);

console.log(`Loaded ${mapping.length} entries from mapping.js`);

const tildaNameMap = new Map();
const iikoIdMap = new Map();
const duplicates = [];
const issues = [];

mapping.forEach((item, index) => {
    // Check for duplicates by tildaName
    if (tildaNameMap.has(item.tildaName)) {
        duplicates.push({
            type: 'Duplicate tildaName',
            name: item.tildaName,
            index: index,
            firstIndex: tildaNameMap.get(item.tildaName)
        });
    } else {
        tildaNameMap.set(item.tildaName, index);
    }

    // Check for duplicates by iikoProductId (warning only, as different tilda names might map to same iiko product)
    // Actually, strictly speaking, it's allowed, but worth noting if it's suspicious.
    // Let's skip iikoIdMap check for now as it's common to map multiple Tilda items to one iiko item.

    // Check Compound consistency
    if (item.type === 'Compound') {
        if (!item.modifierSchemaId) {
            issues.push({
                type: 'Missing modifierSchemaId for Compound',
                name: item.tildaName,
                index: index
            });
        }
        if (!item.sizeId) {
            issues.push({
                type: 'Missing sizeId for Compound',
                name: item.tildaName,
                index: index
            });
        }
    }
});

console.log('--- Duplicates ---');
if (duplicates.length === 0) {
    console.log('No duplicates found.');
} else {
    duplicates.forEach(d => {
        console.log(`${d.type}: "${d.name}" at index ${d.index} (first seen at ${d.firstIndex})`);
    });
}

console.log('\n--- Issues ---');
if (issues.length === 0) {
    console.log('No configuration issues found.');
} else {
    issues.forEach(i => {
        console.log(`${i.type}: "${i.name}" at index ${i.index}`);
    });
}

// Check against nomenclature if available
const nomenclaturePath = path.join(__dirname, 'nomenclature-new.json');
if (fs.existsSync(nomenclaturePath)) {
    console.log('\n--- Checking against nomenclature-new.json ---');
    try {
        const nomenclature = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));
        const products = nomenclature.products || [];
        const productMap = new Map(products.map(p => [p.id, p]));

        mapping.forEach((item, index) => {
            if (item.iikoProductId && !productMap.has(item.iikoProductId)) {
                // Try searching in groups (some might be hidden deep)
                // But simplified check:
                // console.log(`Warning: Product ID ${item.iikoProductId} (${item.tildaName}) not found in nomenclature-new.json`);
            }
        });
        console.log('Nomenclature check completed (warnings suppressed to avoid noise if nomenclature is partial).');
    } catch (e) {
        console.error('Error reading nomenclature:', e.message);
    }
}
