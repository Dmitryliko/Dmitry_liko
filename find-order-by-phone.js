const axios = require('axios');
const citiesConfig = require('./api/cities-config');

async function findOrder() {
  const city = citiesConfig.cities.msk;
  if (!city || !city.apiLogin) {
    console.error('No API login for MSK');
    return;
  }

  const phone = '+79045501567';

  try {
    console.log('Getting token...');
    const tokenRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: city.apiLogin
    });
    const token = tokenRes.data.token;
    console.log('Token received.');

    console.log(`Searching orders for phone ${phone}...`);
    
    const now = Date.now();
    const from = new Date(now - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const to = new Date(now + 24 * 60 * 60 * 1000); // Tomorrow

    const deliveryDateFrom = from.toISOString().replace('T', ' ').replace('Z', '');
    const deliveryDateTo = to.toISOString().replace('T', ' ').replace('Z', '');

    const res = await axios.post(
      'https://api-ru.iiko.services/api/1/deliveries/by_delivery_date_and_phone',
      {
        phone: phone,
        deliveryDateFrom,
        deliveryDateTo,
        organizationIds: [city.organizationId],
        rowsCount: 50
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const groups = (res.data && res.data.ordersByOrganizations) || [];
    let foundCount = 0;
    
    for (const g of groups) {
      const orders = (g && g.orders) || [];
      for (const order of orders) {
        foundCount++;
        console.log('--------------------------------------------------');
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
    }

    if (foundCount === 0) {
        console.log('No orders found for this phone number.');
    }

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

findOrder();
