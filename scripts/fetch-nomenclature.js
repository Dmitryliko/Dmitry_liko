const axios = require('axios');
const fs = require('fs');
const path = require('path');
const citiesConfig = require('../lib/cities-config');

async function fetchNomenclature() {
  const mskConfig = citiesConfig.cities.msk;
  if (!mskConfig || !mskConfig.apiLogin || !mskConfig.organizationId) {
    console.error('Missing Moscow configuration');
    return;
  }

  console.log('Authenticating...');
  try {
    const tokenRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: mskConfig.apiLogin
    });
    const token = tokenRes.data.token;
    console.log('Token received.');

    console.log('Fetching nomenclature...');
    const nomenclatureRes = await axios.post(
      'https://api-ru.iiko.services/api/1/nomenclature',
      { organizationId: mskConfig.organizationId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const products = nomenclatureRes.data.products;
    const groups = nomenclatureRes.data.groups;
    const revision = nomenclatureRes.data.revision;

    console.log(`Received ${products.length} products, ${groups.length} groups.`);

    const output = {
      revision,
      groups,
      products,
      productCategories: nomenclatureRes.data.productCategories,
      sizes: nomenclatureRes.data.sizes,
      sizePrices: nomenclatureRes.data.sizePrices
    };

    // Save full response to inspect groups
    const fullOutputPath = path.join(__dirname, '..', 'nomenclature-full.json');
    fs.writeFileSync(fullOutputPath, JSON.stringify(output, null, 2));
    console.log(`Saved full nomenclature to ${fullOutputPath}`);

    // Save products only to nomenclature-new.json (for compatibility)
    const outputPath = path.join(__dirname, '..', 'nomenclature-new.json');
    fs.writeFileSync(outputPath, JSON.stringify(output.products, null, 2));
    console.log(`Saved products to ${outputPath}`);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

fetchNomenclature();
