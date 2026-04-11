
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  auction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bid_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0, 'Amount must be positive']
  },
  type: {
    type: String,
    enum: ['bid_deposit', 'winning_payment', 'refund', 'seller_payout'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['razorpay', 'wallet', 'bank_transfer'],
    required: true
  },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  failure_reason: String,
  processed_at: Date,
  reference_number: {
    type: String,
    unique: true,
    default: function() {
      return 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
