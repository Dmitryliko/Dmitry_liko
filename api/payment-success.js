module.exports = (req, res) => {
    const { orderid } = req.query;
    
    // Ideally, redirect back to the Tilda site's success page.
    // We can allow the user to configure a redirect base URL.
    const shopSuccessUrl = process.env.SHOP_SUCCESS_URL;

    if (shopSuccessUrl) {
        return res.redirect(302, shopSuccessUrl);
    }

    res.send(`
        <html>
            <head><title>Payment Successful</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: green;">Payment Successful!</h1>
                <p>Order ID: ${orderid}</p>
                <p>You can verify the status in your email or account.</p>
                <a href="javascript:window.close()">Close this window</a>
            </body>
        </html>
    `);
};
