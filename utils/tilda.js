const crypto = require('crypto');

/**
 * Verifies the signature sent by Tilda.
 * Tilda signature rule: md5(amount:orderid:secret) or custom.
 * We will assume the custom rule: md5(order_id:amount:secret) or similar.
 * 
 * NOTE: The user MUST configure the signature rule in Tilda to match this.
 * Let's use a robust one: SHA256 of (order_id + amount + secret).
 * 
 * Tilda settings: 
 * Signature rules: Custom rules
 * Custom Signature Rules: {{orderid}}{{amount}}{{secret}} (concatenated)
 * Algorithm: SHA256
 */
function verifyTildaSignature(params, secret) {
    const { orderid, amount, signature } = params;
    
    if (!orderid || !amount || !signature) {
        return false;
    }

    // Signature Rule: orderid + amount + secret
    const data = `${orderid}${amount}${secret}`;
    const calculatedSignature = crypto.createHash('sha256').update(data).digest('hex');

    return calculatedSignature.toLowerCase() === signature.toLowerCase();
}

/**
 * Generates the signature to send BACK to Tilda for notification.
 * Tilda expects the signature to verify the callback.
 * 
 * Tilda Notification Signature Rule:
 * Usually configured separately. Let's assume:
 * {{orderid}}{{amount}}{{secret}}
 */
function generateTildaSignature(orderid, amount, secret) {
    const data = `${orderid}${amount}${secret}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
    verifyTildaSignature,
    generateTildaSignature
};
