import express from 'express';
import crypto from 'crypto';
const router = express.Router();

const secret = '8gBm/:&EnhH.1/q';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Success URL
router.get('/verify', async (req, res) => {
    try {
        const token = req.query.data;
        if (!token) {
            return res.redirect(`${FRONTEND_URL}/payment-success?status=error&message=Missing token`);
        }
        
        const decodedData = Buffer.from(token, 'base64').toString('utf-8');
        const data = JSON.parse(decodedData);
        const signedFields = data.signed_field_names.split(',');
        const message = signedFields.map(f => `${f}=${data[f]}`).join(',');
        const hmac = crypto.createHmac('sha256', secret).update(message).digest('base64');
        
        if (hmac !== data.signature) {
            return res.redirect(`${FRONTEND_URL}/payment-success?status=error&message=Invalid signature`);
        }
        
        // Payment verified successfully
        // Redirect to frontend success page with transaction details
        const params = new URLSearchParams({
            status: 'success',
            method: 'esewa',
            transaction_id: data.transaction_uuid,
            amount: data.total_amount,
            refId: data.ref_id || data.transaction_uuid
        });
        
        return res.redirect(`${FRONTEND_URL}/payment-success?${params.toString()}`);
    } catch (error) {
        console.error('eSewa verification error:', error);
        return res.redirect(`${FRONTEND_URL}/payment-success?status=error&message=Verification failed`);
    }
});

// Failure route
router.get('/failure', (req, res) => {
    res.redirect(`${FRONTEND_URL}/payment-success?status=failed&message=Payment cancelled or failed`);
});

export default router;