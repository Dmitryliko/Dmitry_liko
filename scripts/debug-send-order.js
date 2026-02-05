const axios = require('axios');
const citiesConfig = require('./cities-config');

const payload = { 
  "organizationId": "6fd820ff-65a0-40d6-8309-83d6425aaf2e", 
  "terminalGroupId": "16405536-0b9a-30e4-017e-dea16b460064", 
  "order": { 
    "externalNumber": "1140349168", 
    "orderServiceType": "DeliveryByCourier", 
    "phone": "+79045501567", 
    "customer": { 
      "name": "аннатест" 
    }, 
    "comment": "Заказ из Tilda #1140349168", 
    "items": [ 
      { 
        "type": "Compound", 
        "primaryComponent": { 
          "productId": "70291db1-a0fc-49df-a625-762c919cbf99" 
        }, 
        "template": { 
          "id": "0d0d70f2-ce97-4f83-9ff4-0a49cc31029b" 
        }, 
        "size": { 
          "id": "7c23e0c5-ef2e-4a16-8653-15918a7807d7" 
        }, 
        "amount": 1, 
        "price": 1361 
      } 
    ] 
  } 
};

async function run() {
  try {
    const apiLogin = citiesConfig.cities.msk.apiLogin;
    console.log('Getting token...');
    const tokenRes = await axios.post('https://api-ru.iiko.services/api/1/access_token', {
      apiLogin: apiLogin
    });
    const token = tokenRes.data.token;
    console.log('Token received.');

    console.log('Sending order...');
    const res = await axios.post('https://api-ru.iiko.services/api/1/deliveries/create', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Response from iiko:');
    console.log(JSON.stringify(res.data, null, 2));

  } catch (err) {
    console.error('Error from iiko:');
    if (err.response) {
      console.error(JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

run();
