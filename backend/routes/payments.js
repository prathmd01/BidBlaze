
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay (only if credentials are available)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay configured successfully!');
} else {
  console.log('⚠️  Razorpay credentials not found. Payment features will be disabled.');
  console.log('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
}

// Create payment order
router.post('/create-order', [
  auth,
  body('auction_id').isMongoId(),
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['bid_deposit', 'winning_payment'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment service is not configured. Please contact administrator.' 
      });
    }

    const { auction_id, amount, type } = req.body;

    // Verify auction exists
    const auction = await Auction.findById(auction_id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        auction_id,
        user_id: req.user._id.toString(),
        type
      }
    });

    // Create transaction record
    const transaction = new Transaction({
      user_id: req.user._id,
      auction_id,
      amount,
      type,
      payment_method: 'razorpay',
      razorpay_order_id: order.id,
      status: 'pending'
    });

    await transaction.save();

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      transaction_id: transaction._id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify payment
router.post('/verify', [
  auth,
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty(),
  body('transaction_id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment service is not configured. Please contact administrator.' 
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction_id } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update transaction
    const transaction = await Transaction.findById(transaction_id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    transaction.status = 'completed';
    transaction.razorpay_payment_id = razorpay_payment_id;
    transaction.razorpay_signature = razorpay_signature;
    transaction.processed_at = new Date();
    await transaction.save();

    // Update auction payment status if this is a winning payment
    if (transaction.type === 'winning_payment') {
      await Auction.findByIdAndUpdate(transaction.auction_id, {
        payment_status: 'paid'
      });
    }

    res.json({
      message: 'Payment verified successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    let filter = { user_id: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .populate('auction_id', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's transactions for profile page
router.get('/my-transactions', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Only get completed transactions (orders)
    const filter = { 
      user_id: req.user._id,
      status: 'completed',
      type: 'winning_payment'
    };

    const transactions = await Transaction.find(filter)
      .populate('auction_id', 'title images')
      .sort({ created_at: -1 })
      .limit(parseInt(limit));

    res.json({
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Webhook for payment status updates
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(webhookBody);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Handle successful payment
        await handlePaymentSuccess(event.payload.payment.entity);
        break;
      case 'payment.failed':
        // Handle failed payment
        await handlePaymentFailure(event.payload.payment.entity);
        break;
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// Helper functions
async function handlePaymentSuccess(payment) {
  try {
    const transaction = await Transaction.findOne({
      razorpay_order_id: payment.order_id
    });

    if (transaction && transaction.status === 'pending') {
      transaction.status = 'completed';
      transaction.razorpay_payment_id = payment.id;
      transaction.processed_at = new Date();
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(payment) {
  try {
    const transaction = await Transaction.findOne({
      razorpay_order_id: payment.order_id
    });

    if (transaction && transaction.status === 'pending') {
      transaction.status = 'failed';
      transaction.failure_reason = payment.error_description;
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

module.exports = router;
