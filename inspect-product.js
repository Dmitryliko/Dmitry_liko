const fs = require('fs');

const data = JSON.parse(fs.readFileSync('nomenclature.json', 'utf8'));
const products = data.products || [];

const name = 'Шотландский';
const product = products.find(p => p.name.includes(name));

if (product) {
    console.log(JSON.stringify(product, null, 2));
} else {
    console.log('Not found');
}
