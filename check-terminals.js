const axios = require('axios');

const apiLogin = '95d5ce46963b47418e5b07543ec77fb4';
const baseUrl = 'https://api-ru.iiko.services';
const organizationId = '6fd820ff-65a0-40d6-8309-83d6425aaf2e';

async function run() {
  try {
    console.log('Getting token...');
    const tokenRes = await axios.post(`${baseUrl}/api/1/access_token`, { apiLogin });
    const token = tokenRes.data.token;
    console.log('Token received.');

    console.log('Fetching terminal groups...');
    const termRes = await axios.post(`${baseUrl}/api/1/terminal_groups`, {
      organizationIds: [organizationId]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const groups = termRes.data.terminalGroups || [];
    console.log('Found terminal groups:', groups.length);
    
    groups.forEach(g => {
        g.items.forEach(t => {
             console.log(`Group Name: ${t.name}, ID: ${t.id}`);
        });
    });

  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
  }
}

run();
