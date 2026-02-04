const axios = require('axios');
const citiesConfig = require('./api/cities-config');

async function checkCustomer() {
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

    console.log(`Checking customer by phone ${phone}...`);
    
    const res = await axios.post(
      'https://api-ru.iiko.services/api/1/loyalty/iiko/customer/info',
      {
        organizationId: city.organizationId,
        phone: phone,
        type: 'phone'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('Customer Info:', JSON.stringify(res.data, null, 2));

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

checkCustomer();
