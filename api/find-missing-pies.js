const fs = require('fs');
const path = require('path');

const nomenclaturePath = path.join(__dirname, '..', 'nomenclature-new.json');
const products = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));

const searchTerms = [
  'Киш',
  'Чизкейк',
  'Пражский',
  'Карельский',
  'Онеж',
  'Чеш',
  'Лимон'
];

console.log(`Searching ${products.length} products...`);

searchTerms.forEach(term => {
  console.log(`\n--- Searching for "${term}" ---`);
  const matches = products.filter(p => 
    p.name.toLowerCase().includes(term.toLowerCase())
  );
  
  if (matches.length === 0) {
      console.log('No matches found.');
  } else {
      matches.forEach(p => {
        console.log(`Name: ${p.name}`);
        console.log(`ID: ${p.id}`);
        console.log(`Type: ${p.type}`);
        console.log(`Price: ${p.sizePrices && p.sizePrices[0] ? p.sizePrices[0].price.currentPrice : 'N/A'}`);
        console.log('---');
      });
  }
});
