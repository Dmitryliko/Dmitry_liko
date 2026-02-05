const axios = require('axios');
const fs = require('fs');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const ORG_ID = "6fd820ff-65a0-40d6-8309-83d6425aaf2e";
const BASE_URL = "https://api-ru.iiko.services";

async function fetchData() {
    try {
        console.log('Authenticating...');
        const authRes = await axios.post(`${BASE_URL}/api/1/access_token`, {
            apiLogin: API_LOGIN
        });
        const token = authRes.data.token;
        console.log('Token received:', token.slice(0, 10) + '...');

        // Fetch Nomenclature
        console.log('Fetching Nomenclature...');
        const nomRes = await axios.post(`${BASE_URL}/api/1/nomenclature`, {
            organizationId: ORG_ID
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fs.writeFileSync('nomenclature-fresh.json', JSON.stringify(nomRes.data, null, 2));
        console.log('Saved nomenclature-fresh.json');

        // Fetch External Menu
        console.log('Fetching External Menu (ID: 62778)...');
        const menuRes = await axios.post(`${BASE_URL}/api/2/menu/by_id`, {
            organizationIds: [ORG_ID],
            externalMenuId: "62778",
            priceCategoryId: "00000000-0000-0000-0000-000000000000"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fs.writeFileSync('menu-fresh.json', JSON.stringify(menuRes.data, null, 2));
        console.log('Saved menu-fresh.json');

        // Analyze for Gulliver/Odyssey
        const nomStr = JSON.stringify(nomRes.data);
        const menuStr = JSON.stringify(menuRes.data);

        const keywords = ['Гулливер', 'Одиссея', 'Gulliver', 'Odyssey', '70291db1-a0fc-49df-a625-762c919cbf99'];
        
        console.log('\n--- Analysis ---');
        for (const kw of keywords) {
            console.log(`Searching for "${kw}":`);
            const inNom = nomStr.indexOf(kw) !== -1;
            const inMenu = menuStr.indexOf(kw) !== -1;
            console.log(`  In Nomenclature: ${inNom}`);
            console.log(`  In Menu: ${inMenu}`);
            
            if (inNom) {
                // Find context in Nomenclature
                const idx = nomStr.indexOf(kw);
                const start = Math.max(0, idx - 100);
                const end = Math.min(nomStr.length, idx + 200);
                console.log(`  Context (Nom): ...${nomStr.substring(start, end).replace(/\n/g, ' ')}...`);
            }
             if (inMenu) {
                // Find context in Menu
                const idx = menuStr.indexOf(kw);
                const start = Math.max(0, idx - 100);
                const end = Math.min(menuStr.length, idx + 200);
                console.log(`  Context (Menu): ...${menuStr.substring(start, end).replace(/\n/g, ' ')}...`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

fetchData();
