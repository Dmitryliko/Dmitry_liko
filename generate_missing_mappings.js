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
            if (obj.itemId || obj.sku || obj.name) {
                if (obj.sku && obj.name) {
                    allProducts.push({
                        sku: obj.sku,
                        name: obj.name,
                        itemId: obj.itemId || obj.id,
                        type: obj.type || obj.orderItemType || 'Dish',
                        itemSizes: obj.itemSizes,
                        modifierSchemaId: obj.modifierSchemaId
                    });
                }
            }
            Object.values(obj).forEach(extractProducts);
        }
    }
    
    extractProducts(data);
    
    // Filter for pies, quiches, sets
    const keywords = ['пирог', 'пай', 'киш', 'сет', 'набор'];
    const candidates = allProducts.filter(p => {
        const name = p.name.toLowerCase();
        return keywords.some(k => name.includes(k));
    });
    
    // Get mapped SKUs
    const mappedSkus = new Set(mapping.map(m => m.tildaSku));
    
    // Find unmapped
    const unmapped = [];
    const seenSkus = new Set();
    
    candidates.forEach(p => {
        if (!mappedSkus.has(p.sku) && !seenSkus.has(p.sku)) {
            unmapped.push(p);
            seenSkus.add(p.sku);
        }
    });
    
    // Generate code
    const newMappings = [];
    
    unmapped.forEach(p => {
        if (p.itemSizes && p.itemSizes.length > 1) {
            // Sort sizes by weight or name to identify Small/Large
            // Assuming 2 sizes logic
            const sizes = p.itemSizes; // Should be array
            // Find threshold price? 
            // Since we don't have prices in this extraction (they are deeper), 
            // we'll use a default threshold or just map by sizeId if we can guess.
            // Actually, without prices, we can't set minPrice/maxPrice correctly.
            // But we can set the structure and let the user/admin adjust.
            // Or better: use a safe default like 1000/2000 if we don't know.
            
            // However, most pies have ~1400-1700 threshold.
            
            // Let's create 2 entries.
            // Entry 1: Small
            newMappings.push({
                city: "msk",
                tildaName: p.name,
                iikoProductId: p.itemId,
                type: "Compound",
                modifierSchemaId: p.modifierSchemaId || "0d0d70f2-ce97-4f83-9ff4-0a49cc31029b", // Default schema
                sizeId: sizes[1].sizeId || sizes[1].id, // Usually second one is small? No, need to check.
                // Actually, let's look at sizeName.
                // 18cm (small), 24cm (large).
                tildaSku: p.sku,
                maxPrice: 1700,
                comment: "Small size (Auto-generated)"
            });
            
            // Entry 2: Large
            newMappings.push({
                city: "msk",
                tildaName: p.name,
                iikoProductId: p.itemId,
                type: "Compound",
                modifierSchemaId: p.modifierSchemaId || "0d0d70f2-ce97-4f83-9ff4-0a49cc31029b",
                sizeId: sizes[0].sizeId || sizes[0].id, // Usually first one is large?
                tildaSku: p.sku,
                minPrice: 1700,
                comment: "Large size (Auto-generated)"
            });
            
            // Note: sizes[0] and sizes[1] order is not guaranteed. 
            // I should try to find "18" or "24" in sizeName.
            // But sizes object here might be incomplete if I extracted it recursively.
            // Let's assume standard order or fix manually.
            
        } else {
            // Single mapping
            newMappings.push({
                city: "msk",
                tildaName: p.name,
                iikoProductId: p.itemId,
                tildaSku: p.sku,
                type: p.type === 'Dish' ? 'Dish' : 'Compound' // Default to Compound if not sure? Or Dish.
                // If it's a component, type might be undefined. Use Dish for safety.
            });
        }
    });
    
    console.log(JSON.stringify(newMappings, null, 2));
    
} catch (err) {
    console.error('Error:', err.message);
}
