
const axios = require('axios');
const citiesConfig = require('../lib/cities-config');

const BASE_URL = process.env.IIKO_BASE_URL || 'https://api-ru.iiko.services';

async function getIikoToken(apiLogin) {
  try {
    const response = await axios.post(`${BASE_URL}/api/1/access_token`, {
      apiLogin: apiLogin
    });
    return response.data.token;
  } catch (error) {
    console.error('Error getting token:', error.message);
    throw error;
  }
}

async function checkOrderStatus(orderId) {
  const cityCfg = citiesConfig.cities['msk'];
  if (!cityCfg) {
    console.error('Moscow config not found');
    return;
  }

  try {
    const token = await getIikoToken(cityCfg.apiLogin);
    console.log('Got token:', token.substring(0, 10) + '...');

    const response = await axios.post(
      `${BASE_URL}/api/1/deliveries/by_id`,
      {
        organizationId: cityCfg.organizationId,
        orderIds: [orderId]
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Order Status Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error checking status:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Order ID from last-create-response.json
const orderId = 'eafd8e76-911f-4710-9b71-20c5e396ce74';
checkOrderStatus(orderId);
