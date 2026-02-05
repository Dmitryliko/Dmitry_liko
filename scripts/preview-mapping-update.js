const fs = require('fs');
const path = require('path');

const menuPath = path.join(__dirname, '..', 'меню.txt');
const mappingPath = path.join(__dirname, '..', 'lib', 'mapping.js');

const menuRaw = fs.readFileSync(menuPath, 'utf8');
const menuData = JSON.parse(menuRaw);

let menuProducts = [];
if (menuData.itemCategories) {
  menuData.itemCategories.forEach(c => {
    if (c.items) menuProducts.push(...c.items);
  });
}

const currentMapping = require(mappingPath);

// Items from screenshots to prioritize
const targets = [
  'Морс', 
  'Лимонад', 
  'Торт', 
  'Набор', 
  'Чизкейк', 
  'Десерт'
];

const toAdd = [];
const updates = [];

menuProducts.forEach(p => {
  const matchesTarget = targets.some(t => p.name.includes(t));
  if (!matchesTarget) return;

  const existing = currentMapping.find(m => 
    m.iikoProductId === p.itemId || 
    m.tildaSku === p.sku ||
    m.tildaName === p.name
  );

  if (existing) {
    if (existing.tildaSku !== p.sku) {
      updates.push({ name: p.name, oldSku: existing.tildaSku, newSku: p.sku });
      existing.tildaSku = p.sku; // Update in memory
    }
  } else {
    toAdd.push({
      city: 'msk',
      tildaName: p.name,
      iikoProductId: p.itemId,
      tildaSku: p.sku
    });
  }
});

console.log('Updates:', updates.length);
console.log('To Add:', toAdd.length);
console.log(JSON.stringify(toAdd, null, 2));

// Generate new file content
const newMapping = [...currentMapping, ...toAdd];
fs.writeFileSync(mappingPath, 'module.exports = ' + JSON.stringify(newMapping, null, 2) + ';');
console.log('Mapping file updated successfully.');
