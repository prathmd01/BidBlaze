# Razorpay Payment Integration Setup

## Prerequisites

1. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **Test Credentials**: Get your test API keys from Razorpay Dashboard

## Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bidblaze

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Getting Razorpay Test Credentials

1. **Login to Razorpay Dashboard**
2. **Go to Settings > API Keys**
3. **Copy your test credentials**:
   - Key ID: `rzp_test_...`
   - Key Secret: `...`

## Testing the Payment Flow

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Test Payment Flow
1. Navigate to an auction page
2. Place a bid
3. Click "Pay Now" when you win
4. Use Razorpay test card details:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry**: Any future date
   - **CVV**: Any 3 digits
   - **Name**: Any name

## Payment Flow Features

✅ **Secure Payment Processing** - All payments go through Razorpay's secure gateway  
✅ **Payment Verification** - Backend verifies payment signatures  
✅ **Success/Failure Handling** - Clear feedback to users  
✅ **Transaction Tracking** - All transactions stored in database  
✅ **Webhook Support** - Real-time payment status updates  

## API Endpoints

- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment signature
- `GET /api/payments/transactions` - Get user transactions
- `POST /api/payments/webhook` - Razorpay webhook handler

## Security Features

- **Signature Verification** - All payments verified using HMAC SHA256
- **Webhook Validation** - Webhook signatures verified
- **Transaction Logging** - Complete audit trail
- **Error Handling** - Graceful error handling and user feedback

## Production Deployment

For production:

1. **Replace test credentials** with live Razorpay credentials
2. **Set up webhook URL** in Razorpay dashboard
3. **Configure proper domain** in environment variables
4. **Enable HTTPS** for secure payment processing

## Support

For any issues:
1. Check Razorpay documentation
2. Verify environment variables
3. Check browser console for errors
4. Review server logs for backend issues
