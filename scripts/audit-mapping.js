const fs = require('fs');
const path = require('path');
const mapping = require('../lib/mapping');

const nomPath = path.join(__dirname, '..', 'nomenclature-full.json');
const menuPath = path.join(__dirname, '..', 'меню.txt');

if (!fs.existsSync(nomPath)) {
  console.error('Error: nomenclature-full.json not found. Run "node scripts/fetch-nomenclature.js" first.');
  process.exit(1);
}

const nomenclature = JSON.parse(fs.readFileSync(nomPath, 'utf8'));
const products = nomenclature.products || [];

// Create a map for faster lookup
const productMap = new Map();
products.forEach(p => productMap.set(p.id, { ...p, source: 'API' }));

// Also load from menu.txt if it exists
if (fs.existsSync(menuPath)) {
  try {
    const menuContent = fs.readFileSync(menuPath, 'utf8');
     const menuData = JSON.parse(menuContent);
     
     let menuProducts = [];
     
     if (menuData.itemCategories && Array.isArray(menuData.itemCategories)) {
       menuData.itemCategories.forEach(cat => {
         if (cat.items && Array.isArray(cat.items)) {
           menuProducts = menuProducts.concat(cat.items);
         }
       });
     } else if (Array.isArray(menuData)) {
       menuProducts = menuData;
     } else if (menuData.products) {
       menuProducts = menuData.products;
     }
     
     if (menuProducts.length > 0) {
       console.log(`Loaded ${menuProducts.length} products from menu.txt (External Menu).`);
       menuProducts.forEach(p => {
         // Prefer API data if collision, or track as 'External'
         if (!productMap.has(p.itemId)) {
             productMap.set(p.itemId, { ...p, id: p.itemId, source: 'External' });
         }
      });
    }
  } catch (e) {
    console.warn('⚠️ Could not parse menu.txt:', e.message);
  }
}

console.log(`Total unique products tracked: ${productMap.size}`);
console.log(`Checking ${mapping.length} mapping entries...`);

const errors = [];
const warnings = [];
const valid = [];

mapping.forEach((entry) => {
  const { tildaName, iikoProductId, type } = entry;

  if (!iikoProductId) {
    errors.push(`❌ [MISSING ID] "${tildaName}" has no iikoProductId.`);
    return;
  }

  const product = productMap.get(iikoProductId);

  if (!product) {
    errors.push(`❌ [INVALID ID] "${tildaName}" points to ID ${iikoProductId} which DOES NOT EXIST in iiko (checked API and External Menu).`);
    return;
  }

  if (product.source === 'API' && product.isDeleted) {
    warnings.push(`⚠️ [DELETED] "${tildaName}" maps to a DELETED product in iiko (${product.name}).`);
  }
  
  if (product.source === 'External') {
     // Valid, but good to know it's not in the main API
     // valid.push({ tildaName, iikoName: product.name, note: 'External Menu' });
  }

  // Check for name mismatches (just as a warning)
  // Normalizing names to ignore case/spaces for comparison
  const normTilda = tildaName.toLowerCase().replace(/\s+/g, '');
  const prodName = product.name || product.productName || ''; // Handle different field names
  const normIiko = prodName.toLowerCase().replace(/\s+/g, '');
  
  // Very rough check - only warn if completely different (length diff > 50% or no substring match)
  if (!normTilda.includes(normIiko) && !normIiko.includes(normTilda)) {
     // warnings.push(`ℹ️ [NAME MISMATCH] Tilda: "${tildaName}" <-> iiko: "${product.name}"`);
  }

  valid.push({ tildaName, iikoName: prodName, source: product.source });
});

console.log('\n--- REPORT ---');

if (errors.length === 0) {
  console.log('✅ No critical errors found.');
} else {
  console.log(`❌ Found ${errors.length} critical errors:`);
  errors.forEach(e => console.log(e));
}

if (warnings.length > 0) {
  console.log(`\n⚠️ Found ${warnings.length} warnings:`);
  warnings.forEach(w => console.log(w));
}

console.log(`\n✅ ${valid.length} mapped items are valid.`);
