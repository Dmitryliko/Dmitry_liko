const fs = require('fs');

const data = fs.readFileSync('nomenclature-new.json', 'utf8');
const products = JSON.parse(data);

console.log(`Total products: ${products.length}`);

const lines = products.map(p => {
  const prices = p.sizePrices ? p.sizePrices.map(sp => sp.price.currentPrice).join('/') : 'N/A';
  return `${p.name} | ${prices} | ${p.id}`;
});

fs.writeFileSync('all_products_list.txt', lines.join('\n'));
console.log('Written to all_products_list.txt');
