const fs = require('fs');
const path = require('path');

const nomenclaturePath = path.join(__dirname, '..', 'nomenclature-new.json');
const products = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));

console.log('--- Analyzing "Киш" items ---');

const matches = products.filter(p => 
  p.name.toLowerCase().includes('киш')
);

matches.forEach(p => {
  console.log(`Name: ${p.name}`);
  console.log(`ID: ${p.id}`);
  console.log(`Description: ${p.description}`);
  console.log('---');
});
