import express from 'express';
import axios from 'axios';
const router = express.Router();

// Use correct Khalti API endpoint - dev for sandbox/test, khalti.com for production
const KHALTI_API = process.env.KHALTI_ENV === 'production' 
  ? 'https://khalti.com/api/v2' 
  : 'https://dev.khalti.com/api/v2';
const SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const BASE_URL = process.env.BASE_URL || 'http://localhost:2004';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('Khalti Routes Loaded - Environment:', process.env.KHALTI_ENV || 'development');
console.log('Khalti API:', KHALTI_API);
console.log('SECRET_KEY:', SECRET_KEY ? `${SECRET_KEY.substring(0, 8)}...` : 'MISSING');

// Initiate Payment
router.post('/initiate', async (req, res) => {
  try {
    const { amount, purchase_order_id, purchase_order_name, customer_info } = req.body;
    
    console.log('=== KHALTI INITIATE ===');
    console.log('Amount (in paisa):', amount);
    console.log('Order ID:', purchase_order_id);
    console.log('SECRET_KEY:', SECRET_KEY ? 'EXISTS' : 'MISSING');
    console.log('BASE_URL:', BASE_URL);
    
    const requestData = {
      return_url: `${BASE_URL}/khalti/verify`,
      website_url: BASE_URL,
      amount, // in paisa
      purchase_order_id,
      purchase_order_name,
      customer_info,
    };
    
    console.log('Request to Khalti:', JSON.stringify(requestData, null, 2));
    
    const response = await axios.post(`${KHALTI_API}/epayment/initiate/`, requestData, {
      headers: {
        Authorization: `key ${SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Khalti response:', response.data);
    res.json({ payment_url: response.data.payment_url, pidx: response.data.pidx });
  } catch (err) {
    console.error('=== KHALTI ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error response:', err.response?.data);
    console.error('Error status:', err.response?.status);
    
    let errorMessage = 'Khalti initiation failed';
    let hint = undefined;
    
    if (err.response?.status === 401) {
      errorMessage = 'Khalti API credentials are invalid. Please configure valid credentials in the .env file or contact support.';
      hint = 'Get valid Khalti API keys from https://khalti.com/merchant';
    } else if (err.response?.data?.detail) {
      errorMessage = err.response.data.detail;
      
      // Check for insufficient balance error
      if (errorMessage.toLowerCase().includes('insufficient') || 
          errorMessage.toLowerCase().includes('balance')) {
        errorMessage = 'Test account has insufficient balance. This is a limitation of Khalti test environment.';
        hint = 'For production use, sign up for a real Khalti merchant account at https://khalti.com/merchant\n' +
               'For testing, you can use Cash or eSewa payment methods instead.';
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    // Add test account information for development
    if (SECRET_KEY?.includes('test') || SECRET_KEY === 'cf225d50fa7c4f48a23b977e82f211b8') {
      if (!hint) {
        hint = 'Using Khalti test environment. For production use, get live credentials from https://khalti.com/merchant';
      }
    }
    
    res.status(err.response?.status || 500).json({ 
      error: errorMessage,
      hint
    });
  }
});

// Verify Payment after user returns
router.get('/verify', async (req, res) => {
  const { pidx, status, transaction_id, amount } = req.query;
  
  console.log('=== KHALTI VERIFY ===');
  console.log('pidx:', pidx);
  console.log('Status from query:', status);
  
  try {
    const response = await axios.post(`${KHALTI_API}/epayment/lookup/`, { pidx }, {
      headers: {
        Authorization: `key ${SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Khalti lookup response:', response.data);
    
    if (response.data.status === 'Completed') {
      // Redirect to frontend success page
      const params = new URLSearchParams({
        status: 'success',
        method: 'khalti',
        transaction_id: response.data.transaction_id || pidx,
        amount: (response.data.total_amount / 100).toString(), // Convert from paisa to rupees
        pidx: pidx
      });
      
      return res.redirect(`${FRONTEND_URL}/payment-success?${params.toString()}`);
    }
    
    // Payment not completed
    return res.redirect(`${FRONTEND_URL}/payment-success?status=failed&message=Payment not completed`);
  } catch (err) {
    console.error('Verification error:', err.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}/payment-success?status=error&message=Verification failed`);
  }
});

export default router;