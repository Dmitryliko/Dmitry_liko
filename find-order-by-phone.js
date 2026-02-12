const axios = require('axios');
const citiesConfig = require('./lib/cities-config');

async function findOrder() {
  const city = citiesConfig.cities.msk;
  if (!city || !city.apiLogin) {
    console.error('No API login for MSK');
    return;
  }

  const phone = '+79154958685';

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
      const orderIds = orders.map(o => o.id);
      
      if (orderIds.length > 0) {
        console.log(`Found ${orderIds.length} orders. Fetching details...`);
        const detailsRes = await axios.post(
            'https://api-ru.iiko.services/api/1/deliveries/by_id',
            {
                organizationId: city.organizationId,
                orderIds: orderIds
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        const detailedOrders = (detailsRes.data && detailsRes.data.orders) || [];
        console.log('Detailed Response:', JSON.stringify(detailedOrders[0], null, 2));
        
        for (const o of detailedOrders) {
             foundCount++;
             console.log('--------------------------------------------------');
             console.log('Order ID (UUID):', o.id);
             console.log('External Number:', o.externalNumber);
             console.log('Creation Date:', o.creationDate);
             console.log('Order Type:', o.orderServiceType);
             console.log('Source Key:', o.sourceKey); // This often indicates source (e.g., 'tilda', 'api')
             console.log('Customer:', o.customer ? o.customer.name : 'N/A');
             console.log('Phone:', o.customer ? o.customer.phone : 'N/A');
             console.log('Delivery Point:', o.deliveryPoint ? o.deliveryPoint.address : 'N/A');
             console.log('Comment:', o.comment);
             console.log('Items:', JSON.stringify(o.items.map(i => `${i.productName} x${i.amount}`), null, 2));
             console.log('--------------------------------------------------');
        }
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
