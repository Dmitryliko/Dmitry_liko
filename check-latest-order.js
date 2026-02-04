const axios = require('axios');
const citiesConfig = require('./api/cities-config');

async function checkLatestOrder() {
  const city = citiesConfig.cities.msk;
  if (!city || !city.apiLogin) {
    console.error('No API login for MSK');
    return;
  }

  const phoneToFind = '+79045501567';

  try {
    // 1. Get Token
    console.log('Getting token...');
    const tokenRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: city.apiLogin
    });
    const token = tokenRes.data.token;
    console.log('Token received.');

    // 1. List Organizations
    try {
        const orgRes = await axios.get('https://api-ru.iiko.services/api/1/organizations', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const orgs = (orgRes.data && orgRes.data.organizations) || [];
        console.log('Available Organizations:');
        orgs.forEach(o => console.log(` - ${o.name} (ID: ${o.id})`));
    } catch (e) {
        console.error('Error listing organizations:', e.message);
    }

    // 2. Search orders by date and status (to avoid phone format issues)
    const deliveryDateFrom = '2026-02-04 00:00:00.000'; // Today only to be cleaner
    const deliveryDateTo = '2026-02-04 23:59:59.999';
    
    console.log(`\nSearching ALL orders from ${deliveryDateFrom} to ${deliveryDateTo}...`);
    
    try {
        const payload = {
            organizationIds: [city.organizationId],
            deliveryDateFrom,
            deliveryDateTo,
        };
        // console.log('Payload:', JSON.stringify(payload));

        const res = await axios.post(
            'https://api-ru.iiko.services/api/1/deliveries/by_delivery_date_and_status',
            payload,
            {
            headers: { Authorization: `Bearer ${token}` }
            }
        );

        const groups = (res.data && res.data.ordersByOrganizations) || [];
        let foundOrders = [];

        groups.forEach(g => {
            const orders = g.orders || [];
            orders.forEach(o => {
                foundOrders.push(o);
            });
        });

        if (foundOrders.length > 0) {
            console.log(`✅ FOUND ${foundOrders.length} ORDERS total!`);
            
            // Sort by creation time (descending)
            // creationStatus is a string? No, creationStatus is 'Success'. 
            // We need timestamp. o.order.creationDate?
            // Let's just take the last ones as they usually come in order.
            
            console.log('\nLatest 5 orders:');
            foundOrders.slice(-5).forEach(o => {
                console.log('--------------------------------------------------');
                console.log(`Order ID: ${o.id}`);
                console.log(`External Number: ${o.externalNumber}`);
                console.log(`Phone: ${o.customer ? o.customer.phone : 'N/A'}`);
                console.log(`Created: ${o.creationStatus}`);
                console.log(`Status: ${o.status}`);
                console.log(`Comment: ${o.order.comment}`);
                console.log(`Items:`);
                if (o.order.items) {
                     o.order.items.forEach(i => {
                         const productName = i.product ? i.product.name : 'Unknown Product';
                         console.log(` - ${productName} (x${i.amount}) [${i.type}]`);
                         if (i.modifiers) {
                             i.modifiers.forEach(m => {
                                 const modName = m.product ? m.product.name : 'Unknown Modifier';
                                 console.log(`   + Mod: ${modName} (x${m.amount})`);
                             });
                         }
                     });
                 }
            });

        } else {
            console.log(`❌ No orders found for date range.`);
        }
    } catch (e) {
        console.error(`Error searching by date/status: ${e.message}`);
        if (e.response) {
            console.error('Response data:', JSON.stringify(e.response.data, null, 2));
        }
    }

  } catch (err) {
    console.error('Error:', err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}

checkLatestOrder();
