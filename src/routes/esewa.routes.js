const  esewaRoutes = '8gBm/:&EnhH.1/q';
// Success URL
router.get('/verify', (req, res) => {
    const token = req.query.data;
    if (!token) 
         return res.status(400).json({ result: 'Missing token' });

    const decodedData = Buffer.from(token, 'base64').toString('utf-8');
    const data = JSON.parse(decodedData);
    const signedFields = data.signed_field_names.split(',');
    const message = signedFields.map(f => `${f}=${data[f]}`).join(',');
    const hmac = crypto.createHmac('sha256', secret).update(message).digest('base64');
    if (hmac === data.signature) {
        return res.send(`
            <h1>✅ Payment Successful</h1>
            <p>Transaction ID: ${data.transaction_uuid}</p>
            <p>Status: ${data.status}</p>
        `);
    } else {
        return res.status(403).json({ result: 'Invalid Signature' });
    }
});
// Failure route
router.get('/failure', (req, res) => {
    res.send('<h1>❌ Payment Failed</h1><p>Please try again.</p>');
});
module.exports = router;