const axios = require('axios');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4"; // From lib/cities-config.js
const BASE_URL = "https://api-ru.iiko.services";

async function run() {
    console.log(`Authenticating with login: ${API_LOGIN.slice(0, 4)}...`);
    
    try {
        // 1. Get Token
        const tokenRes = await axios.post(`${BASE_URL}/api/1/access_token`, { apiLogin: API_LOGIN });
        const token = tokenRes.data.token;
        console.log("Token received.");

        // 2. Get Organizations
        console.log("\nFetching Organizations...");
        const orgRes = await axios.get(`${BASE_URL}/api/1/organizations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const orgs = orgRes.data.organizations || [];
        console.log(`Found ${orgs.length} organizations:`);
        
        for (const org of orgs) {
            console.log(`- [${org.id}] ${org.name} (Country: ${org.country}, City: ${org.restaurantAddress?.city})`);
            
            // 3. Get Terminal Groups for this Org
            console.log(`  Fetching Terminal Groups for org ${org.id}...`);
            try {
                const termRes = await axios.post(`${BASE_URL}/api/1/terminal_groups`, 
                    { organizationIds: [org.id] },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                const groups = termRes.data.terminalGroups || [];
                const groupsForOrg = groups.find(g => g.organizationId === org.id)?.items || [];
                
                if (groupsForOrg.length === 0) {
                    console.log("  No terminal groups found.");
                } else {
                    groupsForOrg.forEach(g => {
                        console.log(`  -> Group [${g.id}] Name: "${g.name}" Address: "${g.address}"`);
                    });
                }
            } catch (e) {
                console.log(`  Error fetching terminals: ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

run();
