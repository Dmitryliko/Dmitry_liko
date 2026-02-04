const axios = require('axios');

async function testInitPayment() {
  const url = 'https://integration-iiko.vercel.app/api/init-payment';
  const payload = {
    orderid: 'TEST-CHECK-VERSION-' + Date.now(),
    name: 'Version Check',
    phone: '+79045501567',
    amount: 100,
    payment: {
      orderid: 'TEST-CHECK-VERSION-' + Date.now(),
      products: [{ name: 'Test', price: 100 }]
    }
  };

  try {
    console.log('Sending to:', url);
    const res = await axios.post(url, payload);
    console.log('Response status:', res.status);
    console.log('Response data:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.log('Response data:', err.response.data);
    }
  }
}

testInitPayment();
