const axios = require('axios');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const BASE_URL = "https://api-ru.iiko.services";
const ORG_ID = "6fd820ff-65a0-40d6-8309-83d6425aaf2e";
const PHONE = "+79045501567"; // From screenshot

async function run() {
    try {
        const tokenRes = await axios.post(`${BASE_URL}/api/1/access_token`, { apiLogin: API_LOGIN });
        const token = tokenRes.data.token;
        console.log("Token obtained.");

        const now = Date.now();
        const format = (d) => d.toISOString().replace('T', ' ').replace('Z', '');
        
        const from = format(new Date(now - 2 * 24 * 60 * 60 * 1000));
        const to = format(new Date(now + 24 * 60 * 60 * 1000));

        console.log(`Searching orders for ${PHONE} from ${from} to ${to}...`);

        const res = await axios.post(`${BASE_URL}/api/1/deliveries/by_delivery_date_and_phone`, 
            {
                organizationIds: [ORG_ID],
                deliveryDateFrom: from,
                deliveryDateTo: to,
                phone: PHONE
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const groups = res.data.ordersByOrganizations || [];
        let found = false;

        for (const g of groups) {
            console.log(`Organization: ${g.organizationId}`);
            for (const o of g.orders) {
                found = true;
                console.log(`\n[Order Found]`);
                console.log(JSON.stringify(o, null, 2));
            }
        }

        if (!found) {
            console.log("No orders found for this phone number.");
        }

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

run();
