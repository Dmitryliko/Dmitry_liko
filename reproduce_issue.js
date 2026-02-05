const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Mock Tilda payload with Chech Pie and Banoffee Pie (both sizes)
const payload = {
  name: 'аннатест',
  phone: '+7 (904) 550-15-67',
  email: 'annavolkova@mail.ru',
  payment: {
    orderid: '2136627341',
    amount: '6678', // Sum of all items
    products: [
      {
        name: 'Чешский пирог (Вес: 500±50 г, диаметр ~18 см)',
        quantity: 1,
        price: 1610,
        sku: '18355'
      },
      {
        name: 'Чешский пирог (Вес: 850±50 г, диаметр ~24 см)',
        quantity: 1,
        price: 2160,
        sku: '18355'
      },
      {
        name: 'Американский Баноффи пай (Small)',
        quantity: 1,
        price: 1173,
        sku: '15605'
      },
      {
        name: 'Американский Баноффи пай (Large)',
        quantity: 1,
        price: 1735,
        sku: '15605'
      },
      {
        name: 'Киш клубничный (Small)',
        quantity: 1,
        price: 1200,
        sku: '17150'
      },
      {
        name: 'Киш клубничный (Large)',
        quantity: 1,
        price: 1800,
        sku: '17150'
      }
    ]
  },
  city: 'Москва',
  delivery_type: 'Самовывоз',
  building: 'г. Москва, Можайское шоссе 71, ТЦ Дубрава'
};

async function run() {
  console.log('--- Running Reproduction ---');
  
  const handler = require('./api/tilda-iiko');
  
  const req = {
    body: payload,
    headers: {
      'x-tilda-signature': 'mock-signature'
    },
    query: {},
    url: 'http://localhost/api/tilda-iiko',
    method: 'POST' // Added method
  };
  
  const originalSecret = process.env.TILDA_WEBHOOK_SECRET;
  delete process.env.TILDA_WEBHOOK_SECRET; 
  
  const res = {
    setHeader: (k, v) => {
        // console.log(`Header: ${k}=${v}`);
    },
    status: (code) => {
        // console.log(`Response Status: ${code}`);
        return res;
    },
    json: (data) => {
        if (data.iiko && data.iiko.orderInfo && data.iiko.orderInfo.items) {
             console.log('\n--- Mapping Results ---');
             data.iiko.orderInfo.items.forEach((item, index) => {
                 const p = payload.payment.products[index];
                 console.log(`Item ${index + 1}: ${p.name} (${p.price})`);
                 console.log(`   -> iikoProductId: ${item.productId}`);
                 console.log(`   -> sizeId: ${item.sizeId || 'N/A'}`);
                 console.log(`   -> price: ${item.price}`);
                 console.log(`   -> type: ${item.type}`);
             });
        } else if (data.iiko && data.iiko.orderInfo === null) {
             console.log('Order creation skipped/failed (dry run maybe?)');
        }
        
        return res;
    },
    send: (msg) => {
        console.log('Response Send:', msg);
        return res;
    }
  };

  try {
   await handler(req, res);
  } catch (e) {
    console.error('Error running handler:', e);
  } finally {
      process.env.TILDA_WEBHOOK_SECRET = originalSecret;
  }
}

run();
