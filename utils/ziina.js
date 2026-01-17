const axios = require('axios');

const ZIINA_API_URL = process.env.ZIINA_API_URL || 'https://api-v2.ziina.com/api';

async function createPaymentIntent(amount, currency, successUrl, cancelUrl, apiKey) {
    try {
        // Ziina expects amount in fils (integers). 
        // Tilda sends "10.00". We need to convert to 1000.
        // Be careful with floating point math.
        const amountInFils = Math.round(parseFloat(amount) * 100);

        const payload = {
            amount: amountInFils,
            currency_code: currency || 'AED',
            success_url: successUrl,
            cancel_url: cancelUrl,
            test: false // Set to true if testing env var is set? User can switch keys.
        };

        const response = await axios.post(`${ZIINA_API_URL}/payment_intent`, payload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating Ziina payment intent:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = {
    createPaymentIntent
};
