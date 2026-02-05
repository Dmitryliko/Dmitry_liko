
const axios = require('axios');
const citiesConfig = require('./lib/cities-config');

async function getIikoToken({ baseUrl, apiLogin }) {
  const response = await axios.post(`${baseUrl}/api/1/access_token`, {
    apiLogin
  });
  return response.data.token;
}

async function checkOrderStatus() {
  const cityCfg = citiesConfig.cities['msk'];
  const baseUrl = process.env.IIKO_BASE_URL || 'https://api-ru.iiko.services';
  
  try {
    const token = await getIikoToken({ baseUrl, apiLogin: cityCfg.apiLogin });
    console.log('Token obtained');

    const orderId = process.argv[2];
    if (!orderId) {
      console.error('Please provide orderId as argument');
      process.exit(1);
    }

    console.log(`Checking status for order: ${orderId}`);

    const response = await axios.post(
      `${baseUrl}/api/1/deliveries/by_id`,
      {
        organizationId: cityCfg.organizationId,
        orderIds: [orderId]
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkOrderStatus();
