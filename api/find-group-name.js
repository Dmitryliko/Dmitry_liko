const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../nomenclature-full.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const groupId = '1d3d3a86-0a03-4423-93f8-75d3984d22f8';
const group = data.groups.find(g => g.id === groupId);

if (group) {
  console.log(`Group Found: ${group.name}`);
  console.log(`Parent Group: ${group.parentGroup}`);
} else {
  console.log('Group not found');
}
