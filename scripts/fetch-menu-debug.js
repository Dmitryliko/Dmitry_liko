const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const ORG_ID = "6fd820ff-65a0-40d6-8309-83d6425aaf2e";
const BASE_URL = "https://api-ru.iiko.services";

async function fetchMenu() {
    try {
        console.log('Authenticating...');
        const authRes = await axios.post(`${BASE_URL}/api/1/access_token`, {
            apiLogin: API_LOGIN
        });
        const token = authRes.data.token;
        console.log('Token received');

        console.log('Fetching Menu 62778 with Price Category...');
        const menuRes = await axios.post(`${BASE_URL}/api/2/menu/by_id`, {
            organizationIds: [ORG_ID],
            externalMenuId: "62778",
            priceCategoryId: "00000000-0000-0000-0000-000000000000"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const outputPath = path.join(__dirname, '../menu-debug.json');
        fs.writeFileSync(outputPath, JSON.stringify(menuRes.data, null, 2));
        console.log(`Menu saved to ${outputPath}`);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.log(error.response.data);
    }
}

fetchMenu();
