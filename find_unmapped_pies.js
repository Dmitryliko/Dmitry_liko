const fs = require('fs');
const mapping = require('./lib/mapping.js');

try {
    const rawData = fs.readFileSync('меню2.txt', 'utf8');
    const data = JSON.parse(rawData);
    
    // Extract all products recursively
    const allProducts = [];
    
    function extractProducts(obj) {
        if (!obj) return;
        
        if (Array.isArray(obj)) {
            obj.forEach(extractProducts);
            return;
        }
        
        if (typeof obj === 'object') {
            // Check if it's a product
            if (obj.itemId || obj.sku || obj.name) {
                // If it has sku and name, it's a candidate
                if (obj.sku && obj.name) {
                    allProducts.push({
                        sku: obj.sku,
                        name: obj.name,
                        itemId: obj.itemId || obj.id, // Sometimes id is itemId
                        type: obj.type || obj.orderItemType,
                        itemSizes: obj.itemSizes
                    });
                }
            }
            
            // Recurse into properties
            Object.values(obj).forEach(extractProducts);
        }
    }
    
    extractProducts(data);
    
    // Filter for pies, quiches, sets
    const keywords = ['пирог', 'пай', 'киш', 'сет', 'набор'];
    const pies = allProducts.filter(p => {
        const name = p.name.toLowerCase();
        return keywords.some(k => name.includes(k));
    });
    
    // Get mapped SKUs
    const mappedSkus = new Set(mapping.map(m => m.tildaSku));
    
    // Find unmapped pies
    const unmappedPies = pies.filter(p => !mappedSkus.has(p.sku));
    
    // Deduplicate by SKU
    const uniqueUnmapped = [];
    const seenSkus = new Set();
    unmappedPies.forEach(p => {
        if (!seenSkus.has(p.sku)) {
            uniqueUnmapped.push(p);
            seenSkus.add(p.sku);
        }
    });
    
    console.log(`Found ${uniqueUnmapped.length} unmapped pies:`);
    uniqueUnmapped.forEach(p => {
        console.log(`- ${p.sku}: ${p.name} (Type: ${p.type}, Sizes: ${p.itemSizes ? p.itemSizes.length : 0})`);
    });
    
} catch (err) {
    console.error('Error:', err.message);
}
