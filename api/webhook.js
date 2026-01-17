const axios = require('axios');
const { generateTildaSignature } = require('../utils/tilda');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const event = req.body;
        console.log('Received webhook from Ziina:', JSON.stringify(event, null, 2));

        // Ziina Webhook structure usually wraps the object. 
        // Based on docs, it might be the PaymentIntent object directly or an event wrapper.
        // We'll assume it sends the PaymentIntent object or we check for it.
        // Common pattern: { type: 'payment_intent.succeeded', data: { ... } } or just the object.
        // Since docs are sparse, we'll look for 'status' and 'success_url' in the body.
        
        const paymentIntent = event.data || event; // Handle potential wrapper

        if (paymentIntent.status === 'completed' || paymentIntent.status === 'succeeded') {
            
            // Extract orderid from success_url
            const successUrl = paymentIntent.success_url;
            if (!successUrl) {
                console.error('No success_url in webhook payload, cannot identify order');
                return res.status(200).send('OK - No context'); // Don't fail the webhook
            }

            const urlObj = new URL(successUrl);
            const orderid = urlObj.searchParams.get('orderid');
            const amountFromUrl = urlObj.searchParams.get('amount');

            if (!orderid) {
                console.error('No orderid in success_url');
                return res.status(200).send('OK - No Order ID');
            }

            // Update Tilda
            const tildaCallbackUrl = process.env.TILDA_CALLBACK_URL;
            const tildaSecret = process.env.TILDA_SECRET;

            if (tildaCallbackUrl && tildaSecret) {
                const signature = generateTildaSignature(orderid, amountFromUrl, tildaSecret);
                
                // Tilda expects form-data or urlencoded usually
                const tildaPayload = new URLSearchParams();
                tildaPayload.append('orderid', orderid);
                tildaPayload.append('amount', amountFromUrl);
                tildaPayload.append('signature', signature);
                // "paid" field is often required by custom gateways to indicate success
                tildaPayload.append('paid', '1'); 

                await axios.post(tildaCallbackUrl, tildaPayload.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                
                console.log(`Updated Tilda for order ${orderid}`);
            }
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Error');
    }
};
