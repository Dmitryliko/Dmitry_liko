module.exports = (req, res) => {
    const { orderid } = req.query;
    
    const shopFailUrl = process.env.SHOP_FAIL_URL;

    if (shopFailUrl) {
        return res.redirect(302, shopFailUrl);
    }

    res.send(`
        <html>
            <head><title>Payment Cancelled</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: red;">Payment Cancelled</h1>
                <p>Order ID: ${orderid}</p>
                <p>You cancelled the payment.</p>
                <a href="javascript:history.back()">Go Back</a>
            </body>
        </html>
    `);
};
