const fs = require('fs');
const path = require('path');

const nomenclaturePath = '/Users/annavolkova/Desktop/интеграция тильда айко/Номенклатура.txt';
const mappingPath = '/Users/annavolkova/Desktop/интеграция тильда айко/api/mapping.js';

function normalizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

try {
  // 1. Read and parse Nomenclature
  console.log('Reading Nomenclature...');
  const nomenclatureRaw = fs.readFileSync(nomenclaturePath, 'utf8');
  const nomenclature = JSON.parse(nomenclatureRaw);

  const idToSku = new Map();

  if (nomenclature.products && Array.isArray(nomenclature.products)) {
    nomenclature.products.forEach(p => {
      if (p.id && p.code) {
        idToSku.set(p.id, normalizeString(p.code));
      }
    });
  }
  
  // Also check groups if they have products? No, usually products list is flat or in groups.
  // The file structure showed "products": [...] at the root level in the second read snippet.
  // But wait, the first read snippet showed "groups": [...].
  // Let's assume standard iiko structure where products might be inside groups OR in a flat list.
  // The snippet showed "products" key at root.
  
  console.log(`Found ${idToSku.size} products with SKUs in Nomenclature.`);

  // 2. Read Mapping
  console.log('Reading Mapping...');
  let mapping = require(mappingPath);
  if (!Array.isArray(mapping)) {
    throw new Error('Mapping is not an array');
  }

  let updatedCount = 0;

  // 3. Update Mapping
  const newMapping = mapping.map(item => {
    if (item.iikoProductId) {
      const sku = idToSku.get(item.iikoProductId);
      if (sku) {
        // Only add if not present or different
        if (item.tildaSku !== sku) {
            item.tildaSku = sku;
            updatedCount++;
        }
      }
    }
    return item;
  });

  console.log(`Updated ${updatedCount} entries with SKU.`);

  // 4. Write Mapping
  const newContent = `module.exports = ${JSON.stringify(newMapping, null, 2)};\n`;
  fs.writeFileSync(mappingPath, newContent, 'utf8');
  console.log('Mapping file saved.');

} catch (err) {
  console.error('Error:', err);
}
