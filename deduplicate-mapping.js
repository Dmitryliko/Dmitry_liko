const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'api', 'mapping.js');
const mapping = require(mappingPath);

console.log(`Original count: ${mapping.length}`);

const uniqueMap = new Map();

mapping.forEach(item => {
    const key = item.tildaName;
    if (uniqueMap.has(key)) {
        const existing = uniqueMap.get(key);
        
        // Preference logic:
        // 1. Prefer Compound over non-Compound
        if (item.type === 'Compound' && !existing.type) {
            uniqueMap.set(key, item);
        } else if (!item.type && existing.type === 'Compound') {
            // Keep existing
        } else {
            // If both are same type (both Compound or both not), prefer the one appearing later (overwrite)
            // or maybe check if one has more keys?
            // For now, let's just overwrite to keep the latest version which usually contains fixes
            uniqueMap.set(key, item);
        }
    } else {
        uniqueMap.set(key, item);
    }
});

const deduped = Array.from(uniqueMap.values());

console.log(`Deduplicated count: ${deduped.length}`);

const content = `module.exports = ${JSON.stringify(deduped, null, 2)};\n`;

fs.writeFileSync(mappingPath, content, 'utf8');
console.log('Successfully wrote deduplicated mapping.js');
