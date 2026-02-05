const crypto = require('crypto');

function createEsewaSignature({ amount, tax_amount, transaction_uuid, product_code }) {
    const secret = process.env.ESEWA_SECRET || '8gBm/:&EnhH.1/q';
    const message = `total_amount=${amount + tax_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hmac = crypto.createHmac('sha256', secret).update(message).digest('base64');
    return hmac;
}
module.exports = { createEsewaSignature };