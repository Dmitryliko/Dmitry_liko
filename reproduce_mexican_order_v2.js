
const handler = require('./api/tilda-iiko');

// Mock Request
const req = {
  method: 'POST',
  url: '/api/tilda-iiko?city=msk',
  headers: {
    'x-forwarded-host': 'test.vercel.app',
    'x-tilda-webhook-secret': process.env.TILDA_WEBHOOK_SECRET || 'secret' // Assuming secret might be needed if env var is set
  },
  body: {
    "name": "тест v2",
    "phone": "+7 (904) 550-15-67",
    "email": "ania.volckova2015@mail.ru",
    "payment": {
      "orderid": "1648813463", // New ID
      "amount": "1361",
      "products": [
        {
          "name": "Мексиканский пирог",
          "price": "1361",
          "quantity": "1",
          "options": [
            { "option": "Вес", "value": "500±50 г, диаметр ≈18 см", "price": "0" }
          ]
        }
      ]
    },
    "formid": "cart",
    "formname": "Cart"
  }
};

// Mock Response
const res = {
  setHeader: (k, v) => console.log(`[Header] ${k}: ${v}`),
  status: (code) => {
    console.log(`[Status] ${code}`);
    return res;
  },
  json: (data) => {
    console.log('[JSON Response]:');
    console.log(JSON.stringify(data, null, 2));
    return res;
  },
  send: (msg) => {
    console.log(`[Send] ${msg}`);
    return res;
  }
};

console.log('Running reproduction script v2...');
handler(req, res).catch(err => {
  console.error('Handler error:', err);
});
