const axios = require('axios');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const ORG_ID = "6fd820ff-65a0-40d6-8309-83d6425aaf2e";
const BASE_URL = "https://api-ru.iiko.services";

async function listExternalMenus() {
    try {
        console.log('Authenticating...');
        const authRes = await axios.post(`${BASE_URL}/api/1/access_token`, {
            apiLogin: API_LOGIN
        });
        const token = authRes.data.token;
        console.log('Token received');

        console.log('Fetching External Menus list (v2)...');
        // Try v2 endpoint
        // Usually /api/2/menu/by_id gets a specific one. 
        // Is there a list endpoint? Often POST /api/2/menu with just organizationId?
        // Or maybe POST /api/2/menu is the list?
        // Let's try POST /api/2/menu/by_id with just organizationIds and NO externalMenuId? 
        // No, that usually requires externalMenuId if it's "by_id".
        
        // Let's try to find valid endpoints via 404/400 messages or just guess.
        // Common: POST /api/2/menu
        
        try {
             const listRes = await axios.post(`${BASE_URL}/api/2/menu`, {
                organizationIds: [ORG_ID]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('External Menus found (v2):', JSON.stringify(listRes.data, null, 2));
        } catch (e) {
             console.log('v2/menu failed:', e.message);
             if(e.response) console.log(e.response.data);
             
             // Try fetching the known menu 62778 to see if it works
             console.log('Trying to fetch known menu 62778...');
             const menuRes = await axios.post(`${BASE_URL}/api/2/menu/by_id`, {
                organizationIds: [ORG_ID],
                externalMenuId: "62778"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Menu 62778 fetched successfully. Items count:', menuRes.data.itemCategories ? menuRes.data.itemCategories.length : 0);
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

listExternalMenus();
