const axios = require('axios');
const citiesConfig = require('./api/cities-config');

async function fetchOrders() {
  const city = citiesConfig.cities.msk;
  if (!city || !city.apiLogin) {
    console.error('No API login for MSK');
    return;
  }

  try {
    console.log('Getting token...');
    const tokenRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: city.apiLogin
    });
    const token = tokenRes.data.token;
    console.log('Token received.');

    console.log('Fetching orders for today (2026-02-04)...');
    
    // Using deliveries endpoint to find orders
    const ordersRes = await axios.post(
      'https://api-ru.iiko.services/api/1/deliveries/by_delivery_date_and_status',
      {
        organizationIds: [city.organizationId],
        deliveryDateFrom: "2026-02-04 00:00:00.000",
        deliveryDateTo: "2026-02-04 23:59:59.999",
        statuses: null // All statuses
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const orders = ordersRes.data.deliveries || [];
    console.log(`Found ${orders.length} orders.`);
    
    orders.forEach(order => {
      console.log('--------------------------------------------------');
      console.log(`Order ID (UUID): ${order.id}`);
      console.log(`External Number: ${order.externalNumber}`);
      console.log(`Created At: ${order.creationDate}`);
      console.log(`Status: ${order.status}`);
      if (order.items) {
          console.log('Items:');
          order.items.forEach(item => {
              console.log(` - ${item.productName} x${item.amount} (${item.productId})`);
          });
      }
      console.log('--------------------------------------------------');
    });

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

fetchOrders();
