const fs = require('fs');
const path = require('path');

const nomenclaturePath = path.join(__dirname, '..', 'nomenclature-new.json');
const products = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));

const targetGroupId = '1d3d3a86-0a03-4423-93f8-75d3984d22f8';

console.log(`Listing products in group ${targetGroupId}...`);

const matches = products.filter(p => p.groupId === targetGroupId);

matches.forEach(p => {
  console.log(`Name: ${p.name}`);
  console.log(`ID: ${p.id}`);
  console.log(`Price: ${p.sizePrices && p.sizePrices[0] ? p.sizePrices[0].price.currentPrice : 'N/A'}`);
  console.log('---');
});
