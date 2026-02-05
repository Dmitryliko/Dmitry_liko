
const axios = require('axios');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const ORG_ID = "6fd820ff-65a0-40d6-8309-83d6425aaf2e";
const ORDER_ID = "74684d3f-2242-4fa4-addf-f30af42920e2";

async function run() {
  try {
    console.log('1. Authenticating...');
    const authRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: API_LOGIN
    });
    const token = authRes.data.token;
    console.log('   Token received.');

    console.log('\n2. Fetching Nomenclature...');
    const menuRes = await axios.post('https://api-ru.iiko.services/api/1/nomenclature', {
      organizationId: ORG_ID
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const products = menuRes.data.products;
     const sizes = menuRes.data.sizes;
     const groups = menuRes.data.groups;
     
     const idToName = {};
     products.forEach(p => idToName[p.id] = p.name);
     groups.forEach(g => idToName[g.id] = g.name);
     sizes.forEach(s => idToName[s.id] = s.name);

     console.log(`   Fetched ${products.length} products, ${sizes.length} sizes.`);
 
   // Inspect ALL Mexican Pies
   const mexicanMatches = products.filter(p => p.name.toLowerCase().includes('мексиканский'));
   console.log(`\n   Found ${mexicanMatches.length} Mexican matches:`);
   mexicanMatches.forEach(p => {
       console.log(`   - [${p.id}] ${p.name} (Type: ${p.type}, Scale: ${p.sizeScaleId})`);
   });

   // Inspect Amsterdam
   const amsMatches = products.filter(p => p.name.toLowerCase().includes('амстердамский'));
   console.log(`\n   Found ${amsMatches.length} Amsterdam matches:`);
   amsMatches.forEach(p => {
       console.log(`   - [${p.id}] ${p.name} (Type: ${p.type}, Scale: ${p.sizeScaleId})`);
   });

   // Inspect Laurent
   const laurentMatches = products.filter(p => p.name.toLowerCase().includes('лоранский'));
   console.log(`\n   Found ${laurentMatches.length} Laurent matches:`);
   laurentMatches.forEach(p => {
       console.log(`   - [${p.id}] ${p.name} (Type: ${p.type}, Scale: ${p.sizeScaleId})`);
   });

   // Find products with Size Group Modifier
   const sizeSchemaId = "0d0d70f2-ce97-4f83-9ff4-0a49cc31029b";
   const productsWithSize = products.filter(p => 
       p.groupModifiers && p.groupModifiers.some(gm => gm.id === sizeSchemaId)
   );
   console.log(`\n   Found ${productsWithSize.length} products with Size Schema (${sizeSchemaId}):`);
   productsWithSize.forEach(p => {
       console.log(`   - [${p.id}] ${p.name}`);
   });

   // Search for Cheshskiy specifically
   const cheshMatches = products.filter(p => p.name.toLowerCase().includes('чешский'));
   console.log(`\n   Found ${cheshMatches.length} Cheshskiy matches:`);
   cheshMatches.forEach(p => {
       console.log(`   - [${p.id}] ${p.name} (Type: ${p.type}, Scale: ${p.sizeScaleId})`);
   });

    /*
    console.log('\n3. Checking Order Status...');
    const orderRes = await axios.post('https://api-ru.iiko.services/api/1/deliveries/by_id', {
      organizationId: ORG_ID,
      orderIds: [ORDER_ID]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    ...
    */


  } catch (e) {
    console.error('Error:', e.response ? e.response.data : e.message);
  }
}

run();
