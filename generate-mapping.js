const fs = require('fs');
const path = require('path');

// Read nomenclature.json
const nomenclaturePath = path.join(__dirname, 'nomenclature.json');
if (!fs.existsSync(nomenclaturePath)) {
  console.error('nomenclature.json not found');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));

// Extract products
const products = [];

// Helper to check if item is a product (not modifier, service, etc.)
function isProduct(item) {
  // We want dishes and goods
  return (item.type === 'Dish' || item.type === 'Goods') && 
         !item.isDeleted && 
         item.orderItemType !== 'Modifier'; 
}

// Find standard size ID if possible (from existing mappings)
const STANDARD_SIZE_ID = '7c23e0c5-ef2e-4a16-8653-15918a7807d7';

data.products.forEach(item => {
  if (!isProduct(item)) return;

  const mapping = {
    city: 'msk',
    tildaName: item.name, // Assuming Tilda name matches iiko name
    iikoProductId: item.id
  };

  // Handle Compound items
  if (item.orderItemType === 'Compound') {
    mapping.type = 'Compound';
    
    // Find modifier schema (usually "Размер")
    if (item.modifierSchemaId) {
      mapping.modifierSchemaId = item.modifierSchemaId;
    }

    // Find a valid sizeId
    // Prefer STANDARD_SIZE_ID if available in sizePrices
    if (item.sizePrices && item.sizePrices.length > 0) {
      const hasStandard = item.sizePrices.find(sp => sp.sizeId === STANDARD_SIZE_ID);
      if (hasStandard) {
        mapping.sizeId = STANDARD_SIZE_ID;
      } else {
        // Fallback to the first available size
        mapping.sizeId = item.sizePrices[0].sizeId;
      }
    }
  }

  products.push(mapping);
});

// Generate file content
const fileContent = `module.exports = ${JSON.stringify(products, null, 2)};`;

// Write to api/mapping.js
const mappingPath = path.join(__dirname, 'api', 'mapping.js');
fs.writeFileSync(mappingPath, fileContent);

console.log(`Generated mapping with ${products.length} products.`);
