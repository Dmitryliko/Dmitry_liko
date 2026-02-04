const axios = require('axios');
const fs = require('fs');
const citiesConfig = require('./api/cities-config');

async function inspectOtherProducts() {
  const city = citiesConfig.cities.msk;
  if (!city || !city.apiLogin) {
    console.error('No API login for MSK');
    return;
  }
  
  const baseUrl = 'https://api-ru.iiko.services';
  const organizationId = city.organizationId;

  try {
    const tokenRes = await axios.post(`${baseUrl}/api/1/access_token`, {
      apiLogin: city.apiLogin
    });
    const token = tokenRes.data.token;
    console.log('Got token');

    const res = await axios.post(
      `${baseUrl}/api/1/nomenclature`,
      { organizationId, startRevision: 0 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = res.data;
    fs.writeFileSync('nomenclature.json', JSON.stringify(data, null, 2));
    console.log('Full nomenclature saved to nomenclature.json');

    const products = data.products || [];
    const groups = data.groups || [];
    
    console.log(`Total products: ${products.length}`);
    console.log(`Total groups: ${groups.length}`);

    const searchTerms = ['шотландский', 'чешский', 'пирог', 'киш', '18355'];
    
    const matches = products.filter(p => {
        const name = p.name.toLowerCase();
        const code = p.code ? String(p.code) : '';
        const sku = p.sku ? String(p.sku) : '';
        const article = p.article ? String(p.article) : '';
        
        return searchTerms.some(term => 
          name.includes(term) || code.includes(term) || sku.includes(term) || article.includes(term)
        );
    });

    console.log('--- Matches ---');
    matches.forEach(p => {
        console.log(`ID: ${p.id} | Name: ${p.name} | Type: ${p.type} | Code: ${p.code} | SKU: ${p.sku}`);
    });
    console.log('----------------');

  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
        console.error('Response data:', err.response.data);
    }
  }
}

inspectOtherProducts();
