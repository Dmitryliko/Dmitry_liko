const fs = require('fs');
const path = require('path');

const nomenclaturePath = path.join(__dirname, '..', 'nomenclature-new.json');
const fullNomenclaturePath = path.join(__dirname, '..', 'nomenclature-full.json');

let products = [];
let groups = [];

try {
  products = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));
} catch (e) {
  console.log('Could not read nomenclature-new.json');
}

try {
  const fullData = JSON.parse(fs.readFileSync(fullNomenclaturePath, 'utf8'));
  if (fullData.groups) groups = fullData.groups;
} catch (e) {
  console.log('Could not read nomenclature-full.json for groups');
}

console.log(`Loaded ${products.length} products and ${groups.length} groups.`);

// 1. Search by SKU 18355
console.log('\n--- Searching by SKU 18355 ---');
const skuMatch = products.find(p => p.sku === '18355' || p.code === '18355');
if (skuMatch) {
    console.log('FOUND BY SKU!');
    console.log(JSON.stringify(skuMatch, null, 2));
} else {
    console.log('Not found by SKU 18355');
}

// 2. Search for Group "Песочные сытные пироги"
console.log('\n--- Searching for Group "Песочные сытные пироги" ---');
const groupMatch = groups.find(g => g.name && g.name.toLowerCase().includes('песочные сытные'));
if (groupMatch) {
    console.log(`Found Group: ${groupMatch.name} (ID: ${groupMatch.id})`);
    
    // Find products in this group
    const productsInGroup = products.filter(p => p.parentGroup === groupMatch.id || p.groupId === groupMatch.id);
    console.log(`Products in this group (${productsInGroup.length}):`);
    productsInGroup.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
} else {
    console.log('Group "Песочные сытные пироги" NOT found in groups list.');
}

// 3. Search for "утка" in name or description
console.log('\n--- Searching for "утка" (duck) ---');
const duckMatches = products.filter(p => 
    (p.name && p.name.toLowerCase().includes('утка')) || 
    (p.description && p.description.toLowerCase().includes('утка'))
);
duckMatches.forEach(p => {
    console.log(`Name: ${p.name}`);
    console.log(`ID: ${p.id}`);
    console.log(`Description: ${p.description}`);
    console.log('---');
});
