const fs = require('fs');
const path = require('path');

const nomenclaturePath = path.join(__dirname, '..', 'nomenclature-full.json');
const outputPath = path.join(__dirname, '..', 'iiko_menu_dump.txt');

try {
  const data = fs.readFileSync(nomenclaturePath, 'utf8');
  const nomenclature = JSON.parse(data);

  const groupsMap = new Map();
  if (nomenclature.groups) {
    nomenclature.groups.forEach(g => {
      groupsMap.set(g.id, g.name);
    });
  }

  const lines = [];
  lines.push('--- MENU DUMP FROM IIKO API ---');
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push('Format: [Group Name] Product Name | Price | ID | Type');
  lines.push('---------------------------------------------------');

  if (nomenclature.products) {
    // Sort by group name then product name
    const products = nomenclature.products.sort((a, b) => {
      const groupA = groupsMap.get(a.parentGroup) || groupsMap.get(a.groupId) || 'Unknown Group';
      const groupB = groupsMap.get(b.parentGroup) || groupsMap.get(b.groupId) || 'Unknown Group';
      if (groupA !== groupB) return groupA.localeCompare(groupB);
      return a.name.localeCompare(b.name);
    });

    products.forEach(p => {
      const groupName = groupsMap.get(p.parentGroup) || groupsMap.get(p.groupId) || 'Unknown Group';
      const price = p.sizePrices && p.sizePrices.length > 0 
        ? p.sizePrices.map(sp => sp.price.currentPrice).join('/') 
        : (p.price || 0);
      
      lines.push(`[${groupName}] ${p.name} | Price: ${price} | ID: ${p.id} | Type: ${p.type}`);
      
      // Also list modifiers if any
      if (p.modifiers && p.modifiers.length > 0) {
          // lines.push(`   Warning: Has ${p.modifiers.length} modifiers (not listed here)`);
      }
    });
  } else {
    lines.push('No products found in nomenclature-full.json');
  }

  fs.writeFileSync(outputPath, lines.join('\n'));
  console.log(`Menu dumped to ${outputPath}`);
  console.log(`Total products: ${nomenclature.products ? nomenclature.products.length : 0}`);

} catch (err) {
  console.error('Error dumping menu:', err);
}
