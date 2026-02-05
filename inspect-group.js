const fs = require('fs');

const data = fs.readFileSync('nomenclature-new.json', 'utf8');
const products = JSON.parse(data);

const groupID = '320f6f14-b95a-4219-aae6-74118b35491a';

const groupProducts = products.filter(p => p.parentGroup === groupID);

console.log(`Found ${groupProducts.length} products in group ${groupID}:`);
groupProducts.forEach(p => {
  console.log(`- ${p.name} (ID: ${p.id}, Price: ${p.sizePrices && p.sizePrices[1] ? p.sizePrices[1].price.currentPrice : 'N/A'})`);
});
