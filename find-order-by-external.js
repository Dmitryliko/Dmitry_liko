const axios = require('axios');
const citiesConfig = require('./api/cities-config');

async function findOrderByExternal() {
  const city = citiesConfig.cities.msk;
  if (!city || !city.apiLogin) {
    console.error('No API login for MSK');
    return;
  }

  const externalNumber = '1842409877';

  try {
    console.log('Getting token...');
    const tokenRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: city.apiLogin
    });
    const token = tokenRes.data.token;
    console.log('Token received.');

    console.log(`Searching orders for external number ${externalNumber}...`);
    
    const now = Date.now();
    const from = new Date(now - 12 * 60 * 60 * 1000); // 12 hours ago
    const to = new Date(now + 12 * 60 * 60 * 1000); // 12 hours ahead

    const deliveryDateFrom = from.toISOString().replace('T', ' ').replace('Z', '');
    const deliveryDateTo = to.toISOString().replace('T', ' ').replace('Z', '');

    // Note: there is no direct endpoint to search by external number only,
    // so we have to search by status/date and filter manually, or search by phone if we knew it.
    // Since we don't have the phone for this specific order (unless it's the same), 
    // we will fetch ALL orders for today and filter.
    
    const res = await axios.post(
      'https://api-ru.iiko.services/api/1/deliveries/by_delivery_date_and_status',
      {
        organizationIds: [city.organizationId],
        deliveryDateFrom,
        deliveryDateTo,
        statuses: null // All statuses
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const deliveries = res.data.deliveries || [];
    let found = false;

    deliveries.forEach(order => {
        if (order.externalNumber === externalNumber) {
            found = true;
            console.log('--------------------------------------------------');
            console.log(`FOUND ORDER!`);
            console.log(`Order ID (UUID): ${order.id}`);
            console.log(`External Number: ${order.externalNumber}`);
            console.log(`Created At: ${order.creationDate}`);
            console.log(`Status: ${order.status}`);
            if (order.items) {
                console.log('Items:');
                order.items.forEach(item => {
                    console.log(` - ${item.productName} x${item.amount}`);
                });
            }
            console.log('--------------------------------------------------');
        }
    });

    if (!found) {
        console.log(`Order with external number ${externalNumber} NOT found in ${deliveries.length} orders.`);
    }

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

findOrderByExternal();
