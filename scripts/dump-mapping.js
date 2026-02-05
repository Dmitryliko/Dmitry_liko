const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'mapping.js');
const mapping = require(mappingPath);

const lines = mapping.map(m => {
  return `[${m.city}] ${m.tildaName} | ${m.iikoProductId} | ${m.type || 'Product'}`;
});

fs.writeFileSync(path.join(__dirname, 'current_mapping_dump.txt'), lines.join('\n'));
console.log(`Dumped ${lines.length} mapping entries.`);
