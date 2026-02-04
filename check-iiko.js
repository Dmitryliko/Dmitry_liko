const axios = require('axios');
const citiesConfig = require('./api/cities-config');

async function checkCity(cityName, config) {
  if (!config.apiLogin) {
    console.log(`[${cityName}] Skipped: No apiLogin`);
    return;
  }

  console.log(`\nChecking ${cityName}...`);
  try {
    // 1. Get Token
    const tokenRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: config.apiLogin
    });
    const token = tokenRes.data.token;
    console.log(`[${cityName}] Auth Success. Token received.`);

    // 2. Get Organizations
    const orgRes = await axios.post(
      'https://api-ru.iiko.services/api/1/organizations',
      { returnAdditionalInfo: true, includeDisabled: false },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const orgs = orgRes.data.organizations || [];
    console.log(`[${cityName}] Found ${orgs.length} organizations.`);

    for (const org of orgs) {
      console.log(`  Org: ${org.name} (ID: ${org.id})`);
      
      // 3. Get Terminal Groups
      const termRes = await axios.post(
        'https://api-ru.iiko.services/api/1/terminal_groups',
        { organizationIds: [org.id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const groups = termRes.data.terminalGroups || [];
      const groupsInOrg = groups.filter(g => g.organizationId === org.id);
      
      if (groupsInOrg.length === 0) {
        console.log(`    No terminal groups found.`);
      } else {
        groupsInOrg.forEach(g => {
            console.log('    Raw Group:', JSON.stringify(g, null, 2));
            const items = g.items || [];
            console.log(`    Terminal Group: ${g.name} (ID: ${g.id})`);
            // Check if matches config
            if (config.terminalGroupId === g.id) {
                console.log(`    ✅ MATCHES config.terminalGroupId`);
            }
        });
      }
    }

  } catch (err) {
    console.error(`[${cityName}] Error:`, err.response ? err.response.data : err.message);
  }
}

async function run() {
  const mskConfig = citiesConfig.cities.msk;
  await checkCity('msk', mskConfig);
}

run();
