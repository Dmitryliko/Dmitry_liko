const axios = require('axios');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const BASE_URL = "https://api-ru.iiko.services";

async function fetchOrgs() {
    try {
        console.log('Authenticating...');
        const authRes = await axios.post(`${BASE_URL}/api/1/access_token`, {
            apiLogin: API_LOGIN
        });
        const token = authRes.data.token;
        console.log('Token received');

        console.log('Fetching Organizations...');
        const orgRes = await axios.post(`${BASE_URL}/api/1/organizations`, {
            returnAdditionalInfo: true,
            includeDisabled: true
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Organizations found:', orgRes.data.organizations.length);
        orgRes.data.organizations.forEach(org => {
            console.log(`${org.name} | ID: ${org.id}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.log(error.response.data);
    }
}

fetchOrgs();
