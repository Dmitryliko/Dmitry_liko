const axios = require('axios');

const apiLogin = '95d5ce46963b47418e5b07543ec77fb4';
const baseUrl = 'https://api-ru.iiko.services';
const organizationId = '6fd820ff-65a0-40d6-8309-83d6425aaf2e';

async function run() {
  try {
    console.log('Getting token...');
    const tokenRes = await axios.post(`${baseUrl}/api/1/access_token`, { apiLogin });
    const token = tokenRes.data.token;
    console.log('Token received.');

    const now = Date.now();
    const d = new Date(now - 6 * 60 * 60 * 1000); // 6 hours ago
    const dateFrom = d.toISOString();

    const d2 = new Date(now + 60 * 60 * 1000); // 1 hour ahead
    const dateTo = d2.toISOString();

    console.log(`Fetching orders from ${dateFrom} to ${dateTo}...`);
    
    // We use deliveries/by_delivery_date_and_status because it's a common way to list.
    // Or just by_delivery_date_and_phone if we don't have phone?
    // Let's use /api/1/deliveries/by_delivery_date_and_status which is not always available/documented for all versions,
    // but usually works. Or we can use `by_delivery_date_and_phone` with empty phone if allowed? No, phone is required.
    // Let's try to find a way to list recent orders.
    // Documentation says `POST /api/1/deliveries/by_delivery_date_and_status`
    
    const res = await axios.post(`${baseUrl}/api/1/deliveries/by_delivery_date_and_status`, {
      organizationIds: [organizationId],
      deliveryDateFrom: dateFrom,
      deliveryDateTo: dateTo
      // statuses: removed
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const groups = res.data.ordersByOrganizations || [];
    let count = 0;
    
    groups.forEach(g => {
      const orders = g.orders || [];
      console.log(`Found ${orders.length} orders for org ${g.organizationId}`);
      // Sort by creation time desc
      orders.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
      
      orders.slice(0, 5).forEach(o => {
        console.log(`--- Order ${o.id} ---`);
        console.log(`External #: ${o.externalNumber}`);
        console.log(`Created: ${o.creationDate}`);
        console.log(`Customer: ${o.customer?.name} (${o.customer?.phone})`);
        console.log(`Status: ${o.status}`);
        console.log(`Items: ${o.items?.length}`);
        count++;
      });
    });
    
    if (count === 0) console.log('No recent orders found.');

  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

run();
