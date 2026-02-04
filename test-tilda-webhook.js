const axios = require('axios');

async function sendTestWebhook() {
  const url = 'https://integration-iiko.vercel.app/api/webhook';
  const payload = {
    orderid: 'TEST-' + Date.now(),
    name: 'Anna Test Debug',
    phone: '+79045501567',
    payment: {
      orderid: 'TEST-' + Date.now(),
      amount: 100,
      products: [
        { name: 'Чешский пирог', price: 100, quantity: 1 }
      ]
    }
  };

  try {
    console.log('Sending payload to:', url);
    console.log(JSON.stringify(payload, null, 2));
    const res = await axios.post(url, payload);
    console.log('Response status:', res.status);
    console.log('Response data:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    }
  }
}

sendTestWebhook();
