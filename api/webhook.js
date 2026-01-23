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
      
      // Use the original amount string from metadata if available, otherwise calculate
      let amountStr = metadata.tilda_amount;
      if (!amountStr) {
         // Fallback logic
         amountStr = (paymentIntent.amount / 100).toString();
         // Check if it needs decimal places? usually integer is safer if no cents.
         // If it was 10.50, /100 -> 10.5. Tilda might expect 10.50.
         // Let's try to match what we think Tilda sent.
         // But really, using metadata.tilda_amount is the only safe way.
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

      // Prioritize TILDA_CALLBACK_URL as seen in user's Vercel config
      const tildaNotificationUrl = process.env.TILDA_CALLBACK_URL || process.env.TILDA_NOTIFICATION_URL || 'https://forms.tildaapi.com/payment/custom/ps2755493';

      try {
        await axios.post(tildaNotificationUrl, tildaData);
        console.log('Tilda notification sent successfully.');
      } catch (err) {
        // Even if Tilda returns error (e.g. 200 OK but body "error"), axios might not throw if status is 200.
        // Tilda often returns "OK" in body.
        console.error('Error sending to Tilda:', err.message);
        if (err.response) {
            console.error('Tilda response:', err.response.data);
        }
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).send('Internal Server Error');
  }
};
