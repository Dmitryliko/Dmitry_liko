const axios = require('axios');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const BASE_URL = "https://api-ru.iiko.services";
// The Organization ID we found earlier
const ORG_ID = "6fd820ff-65a0-40d6-8309-83d6425aaf2e";

async function fetchTerminals() {
    try {
        console.log('Authenticating...');
        const authRes = await axios.post(`${BASE_URL}/api/1/access_token`, {
            apiLogin: API_LOGIN
        });
        const token = authRes.data.token;
        console.log('Token received');

        console.log('Fetching Terminal Groups...');
        const termRes = await axios.post(`${BASE_URL}/api/1/terminal_groups`, {
            organizationIds: [ORG_ID]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Terminal Groups found:', termRes.data.terminalGroups.length);
        console.log(JSON.stringify(termRes.data.terminalGroups, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.log(JSON.stringify(error.response.data, null, 2));
    }
}

fetchTerminals();
