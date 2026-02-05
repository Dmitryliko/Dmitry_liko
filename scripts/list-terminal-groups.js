const axios = require('axios');
const citiesConfig = require('./cities-config');

async function listTerminalGroups() {
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

    console.log('Fetching terminal groups...');
    const res = await axios.post(
      'https://api-ru.iiko.services/api/1/terminal_groups',
      { organizationIds: [mskConfig.organizationId] },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const groups = res.data.terminalGroups;
    console.log(`Received ${groups.length} terminal groups.`);
    
    groups.forEach(g => {
        console.log(`--- Group ---`);
        console.log(`ID: ${g.id}`);
        console.log(`Name: ${g.name}`);
        console.log(`Organization ID: ${g.organizationId}`);
        if (g.items) {
            g.items.forEach(i => {
                console.log(`  - Terminal: ${i.name} (ID: ${i.id})`);
            });
        }
    });

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

listTerminalGroups();
