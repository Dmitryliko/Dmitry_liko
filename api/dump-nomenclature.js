const fs = require('fs');
const path = require('path');

const nomenclaturePath = path.join(__dirname, '../nomenclature-full.json');
let products = [];

try {
  const data = JSON.parse(fs.readFileSync(nomenclaturePath, 'utf8'));
  
  function traverse(groups) {
    for (const g of groups) {
      if (g.products && g.products.length) {
        products.push(...g.products.map(p => ({
          name: p.name,
          id: p.id,
          sku: p.code,
          group: g.name
        })));
      }
      if (g.groups) traverse(g.groups); // Recursive groups check
    }
  }

  // Also check top-level products if any (though usually in groups)
  if (data.products) {
     products.push(...data.products.map(p => ({
        name: p.name,
        id: p.id,
        sku: p.code,
        group: 'Root'
      })));
  }
  
  // The structure in nomenclature-full.json seems to have 'groups' at root
  if (data.groups) {
      // Helper to find products in groups recursively
      // Based on previous reads, products are inside groups? 
      // Actually nomenclature-full.json usually has a flat structure or nested groups.
      // Let's assume standard iiko export structure.
      
      // We need to traverse properly.
      const processGroup = (group) => {
          if (group.products) {
              products.push(...group.products.map(p => ({
                  name: p.name,
                  id: p.id,
                  sku: p.code,
                  group: group.name
              })));
          }
          if (group.childGroups) { // Some formats use childGroups
              group.childGroups.forEach(processGroup);
          }
          // The file read previously showed "groups" array.
          // Let's assume products might be fetched separately or embedded.
          // Wait, the previous `grep` showed products are inside `nomenclature-full.json`.
          // But looking at the file structure from `read` output:
          // It has "groups": [ ... ]. 
          // It doesn't explicitly show "products" array inside groups in the first 500 lines.
          // But I grep-ed "Лионский" and it was there.
          // Let's try to find where products are.
      };
      
      // Actually, let's just walk the whole object tree for "product" like objects
      // Or just look for "sku"/"code" and "name" and "id" fields.
      // Simpler: Just parse the whole file and find all objects with "productCategoryId" or "type": "Dish" / "Goods".
  }
  
} catch (e) {
  console.log('Error reading nomenclature:', e.message);
}

// Alternative robust extraction:
const fileContent = fs.readFileSync(nomenclaturePath, 'utf8');
const allData = JSON.parse(fileContent);

const foundProducts = [];
const seenIds = new Set();

function findProducts(obj, groupName = 'Unknown') {
    if (!obj || typeof obj !== 'object') return;
    
    // Check if it's a product
    if (obj.id && obj.name && (obj.code || obj.price || obj.productCategoryId)) {
        if (!seenIds.has(obj.id)) {
            seenIds.add(obj.id);
            foundProducts.push({
                name: obj.name,
                id: obj.id,
                sku: obj.code || 'N/A',
                group: groupName
            });
        }
    }
    
    // Traverse children
    for (const key in obj) {
        if (key === 'parentGroup') continue; // avoid cycles if any
        if (typeof obj[key] === 'object') {
            const newGroup = (obj.name && !obj.code) ? obj.name : groupName;
            findProducts(obj[key], newGroup);
        }
    }
}

// Better approach for iiko structure:
// Usually it's { groups: [], products: [] } OR groups with nested products.
// Let's check both.

if (allData.products) {
    allData.products.forEach(p => {
        foundProducts.push({
            name: p.name,
            id: p.id,
            sku: p.code || 'N/A',
            group: p.parentGroup || 'Root' // parentGroup is usually an ID
        });
    });
} else {
    // Fallback: traverse everything
    findProducts(allData);
}

const lines = foundProducts.map(p => `${p.name} | ${p.sku} | ${p.id} | ${p.group}`);
fs.writeFileSync(path.join(__dirname, 'current_nomenclature_dump.txt'), lines.join('\n'));
console.log(`Dumped ${foundProducts.length} nomenclature products.`);
