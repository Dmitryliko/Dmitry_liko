const axios = require('axios');

const apiLogin = '95d5ce46963b47418e5b07543ec77fb4';
const baseUrl = 'https://api-ru.iiko.services';

async function run() {
  try {
    console.log('Getting token...');
    const tokenRes = await axios.post(`${baseUrl}/api/1/access_token`, { apiLogin });
    const token = tokenRes.data.token;
    console.log('Token received.');

    console.log('Fetching organizations...');
    const orgsRes = await axios.get(`${baseUrl}/api/1/organizations`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orgs = orgsRes.data.organizations || [];
    console.log('Found organizations:', orgs.length);
    
    orgs.forEach(org => {
      console.log(`Name: ${org.name}, ID: ${org.id}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
  }
}

run();
