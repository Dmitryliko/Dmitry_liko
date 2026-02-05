const fs = require('fs');
const menu = require('./menu-fresh.json');

console.log('--- Multi-size Products Analysis ---');

function scan(items) {
    items.forEach(item => {
        if (item.itemSizes && item.itemSizes.length > 1) {
            console.log(`\nProduct: ${item.name} (SKU: ${item.sku})`);
            item.itemSizes.forEach(size => {
                const priceObj = size.prices ? size.prices[0] : null;
                const price = priceObj ? priceObj.price : 'N/A';
                console.log(`  - Size: ${size.sizeName} (${size.sizeCode}) | Price: ${price} | SizeId: ${size.sizeId}`);
            });
        }
        
        // Recursive scan for categories
        if (item.items) {
            scan(item.items);
        }
    });
}

if (menu.itemCategories) {
    menu.itemCategories.forEach(cat => {
        if (cat.items) scan(cat.items);
    });
}
