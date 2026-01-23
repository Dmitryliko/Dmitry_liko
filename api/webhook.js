const axios = require('axios');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const event = req.body;

    console.log('Received webhook:', JSON.stringify(event, null, 2));

    let paymentIntent = event.payment_intent || event;

    if (paymentIntent.status === 'completed' || paymentIntent.status === 'succeeded') {
      const metadata = paymentIntent.metadata || {};
      const tildaOrderId = metadata.tilda_order_id;
      
      if (!tildaOrderId) {
        console.log('No Tilda order ID in metadata, skipping Tilda notification.');
        return res.status(200).send('Skipped');
      }

      // Prepare Tilda notification
      const tildaLogin = process.env.TILDA_LOGIN || 'ziina_shop';
      const tildaSecret = process.env.TILDA_SECRET;
      
      if (!tildaSecret) {
        console.error('TILDA_SECRET is missing in environment variables!');
      }

      // Use the original amount string from metadata if available, otherwise calculate
      let amountStr = metadata.tilda_amount;
      if (!amountStr) {
         // Fallback logic
         amountStr = (paymentIntent.amount / 100).toString();
      }

      const paymentId = paymentIntent.id;
      const state = 'paid';

      // Signature: md5(login + amount + orderid + paymentid + state + password)
      const signatureStr = `${tildaLogin}${amountStr}${tildaOrderId}${paymentId}${state}${tildaSecret}`;
      const signature = crypto.createHash('md5').update(signatureStr).digest('hex');

      const tildaData = {
        payment_system: tildaLogin,
        order_id: tildaOrderId,
        amount: amountStr,
        payment_id: paymentId,
        state: state,
        signature: signature
      };

      console.log('Sending notification to Tilda:', tildaData);

      // Use the CORRECT URL from the screenshot provided by the user.
      // The one in Vercel env vars (TILDA_CALLBACK_URL) appears to be incorrect/incomplete (forms.tildacdn.com vs forms.tildaapi.com).
      const tildaNotificationUrl = 'https://forms.tildaapi.com/payment/custom/ps2755493';
      
      console.log('Using Tilda URL:', tildaNotificationUrl);

      try {
        const tildaResponse = await axios.post(tildaNotificationUrl, tildaData);
        console.log('Tilda notification sent successfully. Status:', tildaResponse.status);
        console.log('Tilda Response Body:', tildaResponse.data);
      } catch (err) {
        console.error('Error sending to Tilda:', err.message);
        if (err.response) {
            console.error('Tilda response status:', err.response.status);
            console.error('Tilda response data:', err.response.data);
        }
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).send('Internal Server Error');
  }
};
