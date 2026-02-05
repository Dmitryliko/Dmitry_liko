const axios = require('axios');

const API_LOGIN = "95d5ce46963b47418e5b07543ec77fb4";
const ORG_ID = "6fd820ff-65a0-40d6-8309-83d6425aaf2e";
const BASE_URL = "https://api-ru.iiko.services";

async function checkOrders() {
    try {
        console.log('Authenticating...');
        const authRes = await axios.post(`${BASE_URL}/api/1/access_token`, {
            apiLogin: API_LOGIN
        });
        const token = authRes.data.token;
        console.log('Token received.');

        const now = Date.now();
        const from = new Date(now - 24 * 60 * 60 * 1000); // Last 24 hours
        const to = new Date(now + 1 * 60 * 60 * 1000);

        const deliveryDateFrom = from.toISOString().replace('T', ' ').replace('Z', '');
        const deliveryDateTo = to.toISOString().replace('T', ' ').replace('Z', '');

        console.log(`Checking orders for phone +79045501567 from ${deliveryDateFrom} to ${deliveryDateTo}...`);

        const res = await axios.post(
            `${BASE_URL}/api/1/deliveries/by_delivery_date_and_phone`,
            {
                phone: "+79045501567", // Search exactly as user provided
                deliveryDateFrom,
                deliveryDateTo,
                organizationIds: [ORG_ID],
                rowsCount: 50
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        const groups = (res.data && res.data.ordersByOrganizations) || [];
        let found = false;

        for (const g of groups) {
            const orders = (g && g.orders) || [];
            if (orders.length > 0) {
                console.log(`\nFound ${orders.length} orders for this phone in organization ${g.organizationId}:`);
                orders.forEach(o => {
                    console.log(`\nOrder ID: ${o.id}`);
                    console.log(`External Number: ${o.externalNumber}`);
                    console.log(`Full Object: ${JSON.stringify(o, null, 2)}`); 
                    console.log(`Status: ${o.status || o.order?.status}`);
                    console.log(`Created: ${o.creationDate || o.date || (o.whenCreated ? o.whenCreated : 'N/A')}`);
                    console.log(`Delivery Date: ${o.deliveryDate}`);
                    
                    const items = o.items || (o.order && o.order.items) || [];
                    console.log(`Items count: ${items.length}`);
                    
                    if (Array.isArray(items)) {
                        items.forEach(i => {
                             const name = i.product ? i.product.name : (i.name || 'Unknown');
                             console.log(` - ${name} x${i.amount} (Price: ${i.price})`);
                        });
                    }
                    
                    if (o.comment) console.log(`Comment: ${o.comment}`);
                });
                found = true;
            }
        }

        if (!found) {
            console.log('\nNo orders found for this phone number in the last 24 hours.');
            // Try adding +7
            console.log('Trying with +79045501567...');
             const res2 = await axios.post(
                `${BASE_URL}/api/1/deliveries/by_delivery_date_and_phone`,
                {
                    phone: "+79045501567", 
                    deliveryDateFrom,
                    deliveryDateTo,
                    organizationIds: [ORG_ID],
                    rowsCount: 50
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
             const groups2 = (res2.data && res2.data.ordersByOrganizations) || [];
             for (const g of groups2) {
                const orders = (g && g.orders) || [];
                if (orders.length > 0) {
                    console.log(`\nFound ${orders.length} orders for +79045501567:`);
                     orders.forEach(o => {
                        console.log(`\nOrder ID: ${o.id}`);
                        console.log(`External Number: ${o.externalNumber}`);
                        console.log(`Status: ${o.status}`);
                        console.log(`Created: ${o.creationDate}`);
                        console.log(`Delivery Date: ${o.deliveryDate}`);
                        console.log(`Items:`);
                         o.items.forEach(i => {
                             console.log(` - ${i.product.name} x${i.amount} (Price: ${i.price})`);
                        });
                        if (o.comment) console.log(`Comment: ${o.comment}`);
                    });
                }
             }
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

checkOrders();
