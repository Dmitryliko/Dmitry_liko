const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'api', 'mapping.js');
const mapping = require(mappingPath);

const modifierSchemaId = "0d0d70f2-ce97-4f83-9ff4-0a49cc31029b";
const sizeId = "7c23e0c5-ef2e-4a16-8653-15918a7807d7";

let updatedCount = 0;

const newMapping = mapping.map(item => {
    // Check if it's a Quiche (Киш) or Pie (Пирог) that needs Compound structure
    // We strictly look for "Киш" here as requested
    if (item.tildaName && item.tildaName.includes('Киш')) {
        if (item.type !== 'Compound') {
            console.log(`Updating ${item.tildaName} to Compound`);
            item.type = 'Compound';
            item.modifierSchemaId = modifierSchemaId;
            item.sizeId = sizeId;
            updatedCount++;
        } else if (!item.modifierSchemaId || !item.sizeId) {
            console.log(`Fixing missing Compound fields for ${item.tildaName}`);
            item.modifierSchemaId = modifierSchemaId;
            item.sizeId = sizeId;
            updatedCount++;
        }
    }
    return item;
});

if (updatedCount > 0) {
    const fileContent = `module.exports = ${JSON.stringify(newMapping, null, 2)};`;
    fs.writeFileSync(mappingPath, fileContent, 'utf8');
    console.log(`Updated ${updatedCount} entries in mapping.js`);
} else {
    console.log('No Quiche entries needed updates.');
}
