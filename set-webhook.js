const axios = require('axios');
require('dotenv').config();

const ZIINA_API_TOKEN = process.env.ZIINA_API_TOKEN;
const WEBHOOK_URL = 'https://tildaavto.vercel.app/api/webhook';

if (!ZIINA_API_TOKEN) {
  console.error('Error: ZIINA_API_TOKEN is not defined in .env file');
  process.exit(1);
}

async function setWebhook() {
  try {
    const response = await axios.post(
      'https://api-v2.ziina.com/api/webhook',
      {
        url: WEBHOOK_URL
      },
      {
        headers: {
          'Authorization': `Bearer ${ZIINA_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Webhook set successfully:', response.data);
  } catch (error) {
    console.error('Error setting webhook:', error.response ? error.response.data : error.message);
  }
}

setWebhook();
