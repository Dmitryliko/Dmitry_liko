const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'api', 'mapping.js');
const mapping = require(mappingPath);

console.log(`Initial entries: ${mapping.length}`);

const uniqueMap = new Map();
const duplicates = [];

mapping.forEach((item, index) => {
    // Normalize tildaName: trim and internal spaces (just in case, but trim is most important)
    const normalizedName = item.tildaName ? String(item.tildaName).trim() : '';
    
    // Key is just the normalized name for now, assuming city is always 'msk' or we want unique names per city
    // The user context implies 'msk'. Let's include city in key just to be safe.
    const key = `${item.city || 'msk'}|${normalizedName}`;

    if (uniqueMap.has(key)) {
        const existing = uniqueMap.get(key);
        
        // Preference logic:
        // 1. Prefer item with 'Compound' type
        // 2. Prefer item with more keys (more detailed configuration)
        // 3. Prefer the later one (overwrite)
        
        let keepExisting = false;
        
        if (existing.type === 'Compound' && item.type !== 'Compound') {
            keepExisting = true;
        } else if (existing.type !== 'Compound' && item.type === 'Compound') {
            keepExisting = false;
        } else {
            // Both are Compound or neither.
            // Check specific fields if both are Compound
             if (existing.type === 'Compound' && item.type === 'Compound') {
                 // Check if one has modifierSchemaId and the other doesn't
                 if (existing.modifierSchemaId && !item.modifierSchemaId) keepExisting = true;
                 else if (!existing.modifierSchemaId && item.modifierSchemaId) keepExisting = false;
                 else keepExisting = false; // Overwrite with new
             } else {
                 keepExisting = false; // Overwrite with new
             }
        }
        
        if (keepExisting) {
            duplicates.push(item);
        } else {
            duplicates.push(existing);
            // Update the map with the new item, but ensure we normalize the name in the stored item too if we want clean data?
            // Actually, let's keep the name as is from the preferred item, but maybe trim it?
            // Let's trim the name in the saved item to be clean.
            item.tildaName = item.tildaName.trim();
            uniqueMap.set(key, item);
        }
    } else {
        // First time seeing this key
        item.tildaName = item.tildaName.trim();
        uniqueMap.set(key, item);
    }
});

const deduped = Array.from(uniqueMap.values());

console.log(`Duplicates removed: ${duplicates.length}`);
console.log(`Final entries: ${deduped.length}`);

// Sort by tildaName for easier reading
deduped.sort((a, b) => a.tildaName.localeCompare(b.tildaName));

const content = `module.exports = ${JSON.stringify(deduped, null, 2)};\n`;
fs.writeFileSync(mappingPath, content, 'utf8');
console.log('Mapping file updated.');
