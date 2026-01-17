const { createPaymentIntent } = require('../utils/ziina');
const { verifyTildaSignature } = require('../utils/tilda');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        // Tilda sends data in body (x-www-form-urlencoded)
        const params = req.body;
        
        console.log('Received request from Tilda:', params);

        const secret = process.env.TILDA_SECRET;
        const apiKey = process.env.ZIINA_API_KEY;
        const baseUrl = process.env.BASE_URL;

        if (!secret || !apiKey || !baseUrl) {
            console.error('Missing environment variables');
            return res.status(500).send('Server Misconfiguration');
        }

        // 1. Verify Signature
        if (!verifyTildaSignature(params, secret)) {
            console.error('Invalid signature');
            return res.status(403).send('Invalid signature');
        }

        const { amount, currency, orderid } = params;

        // 2. Construct URLs
        // We embed the orderid in the success_url so we can retrieve it in the webhook
        // (Assuming Ziina returns the success_url in the webhook payload)
        const successUrl = `${baseUrl}/api/payment-success?orderid=${orderid}&amount=${amount}`;
        const cancelUrl = `${baseUrl}/api/payment-cancel?orderid=${orderid}`;

        // 3. Create Ziina Payment Intent
        const paymentIntent = await createPaymentIntent(
            amount, 
            currency || 'AED', 
            successUrl, 
            cancelUrl, 
            apiKey
        );

        // 4. Redirect User
        if (paymentIntent && paymentIntent.redirect_url) {
            return res.redirect(302, paymentIntent.redirect_url);
        } else {
            console.error('No redirect_url from Ziina');
            return res.status(500).send('Failed to initiate payment');
        }

    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).send('Internal Server Error');
    }
};
