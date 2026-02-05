const fs = require('fs');
const path = require('path');

const files = [
  'nomenclature-new.json',
  'nomenclature-full.json'
];

const searchTerms = ['18355', 'Чешский', 'чешский', 'Czech'];

function recursiveSearch(obj, path = '') {
  if (!obj) return;
  
  if (typeof obj === 'string' || typeof obj === 'number') {
    const strVal = String(obj);
    for (const term of searchTerms) {
      if (strVal.includes(term)) {
        console.log(`[MATCH] Found "${term}" at ${path} = ${strVal}`);
        // If it's a product object (heuristic), try to print the name
        if (path.includes('name') || path.includes('code') || path.includes('sku')) {
             // Try to find parent object context if possible (not easy in recursion without passing parent)
        }
      }
    }
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => recursiveSearch(item, `${path}[${index}]`));
    return;
  }

  if (typeof obj === 'object') {
    for (const key in obj) {
      recursiveSearch(obj[key], `${path}.${key}`);
    }
  }
}

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`\n--- Scanning ${file} ---`);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      recursiveSearch(data);
    } catch (e) {
      console.error(`Error parsing ${file}: ${e.message}`);
    }
  } else {
    console.log(`File ${file} not found.`);
  }
});
