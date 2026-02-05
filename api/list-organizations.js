const axios = require('axios');
const citiesConfig = require('./cities-config');

async function listOrganizations() {
  const mskConfig = citiesConfig.cities.msk;
  if (!mskConfig || !mskConfig.apiLogin) {
    console.error('Missing API login in configuration');
    return;
  }

  console.log('Authenticating...');
  try {
    const tokenRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: mskConfig.apiLogin
    });
    const token = tokenRes.data.token;
    console.log('Token received.');

    console.log('Fetching organizations...');
    const orgRes = await axios.get(
      'https://api-ru.iiko.services/api/1/organizations',
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const orgs = orgRes.data.organizations;
    console.log(`Received ${orgs.length} organizations:`);
    orgs.forEach(org => {
      console.log(`- Name: ${org.name}, ID: ${org.id}`);
    });

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

listOrganizations();
