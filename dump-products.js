const fs = require('fs');

const data = JSON.parse(fs.readFileSync('nomenclature.json', 'utf8'));
const products = data.products || [];

const lines = products.map(p => `${p.name} | ${p.id} | ${p.parentGroup}`);
fs.writeFileSync('products_dump.txt', lines.join('\n'));
console.log(`Dumped ${lines.length} products to products_dump.txt`);
