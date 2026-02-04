const createOrderInIiko = require('./tilda-iiko');

module.exports = async (req, res) => {
  console.log('Init Payment Request Method:', req.method);
  
  if (req.body) {
    console.log('Request Body Keys:', Object.keys(req.body));
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // BYPASS PAYMENT: Directly create order in Iiko
    console.log('Bypassing payment, delegating to tilda-iiko handler...');

    let responseData = null;
    let responseStatus = 200;

    const mockRes = {
      status: (code) => {
        responseStatus = code;
        return mockRes;
      },
      json: (data) => {
        responseData = data;
        return mockRes;
      },
      send: (data) => {
        responseData = data;
        return mockRes;
      },
      setHeader: () => {}
    };

    // Call tilda-iiko.js handler with the current request and mocked response
    await createOrderInIiko(req, mockRes);

    // Check result
    if (responseStatus >= 200 && responseStatus < 300 && responseData && responseData.ok) {
      console.log('Order processed successfully via tilda-iiko. Redirecting to success page.');
      // Redirect to Tilda success page or local success page
      // Assuming /ordersuccess.html exists or is handled by Vercel rewrites
      return res.redirect(303, '/ordersuccess.html');
    } else {
      console.error('tilda-iiko handler returned error:', responseStatus, responseData);
      const errorMsg = responseData && responseData.error ? responseData.error : 'Unknown error';
      return res.status(responseStatus).send('Error creating order: ' + errorMsg);
    }

  } catch (error) {
    console.error('Error in init-payment bypass:', error);
    return res.status(500).send('Internal Server Error: ' + error.message);
  }
};
