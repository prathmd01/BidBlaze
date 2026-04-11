const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount must be positive']
  },
  is_winning: {
    type: Boolean,
    default: false
  },
  bid_time: {
    type: Date,
    default: Date.now
  },
  is_auto_bid: {
    type: Boolean,
    default: false
  },
  max_auto_bid: {
    type: Number,
    validate: {
      validator: function(v) {
        return !this.is_auto_bid || (v && v >= this.amount);
      },
      message: 'Max auto bid must be greater than or equal to current bid amount'
    }
  },
  status: {
    type: String,
    enum: ['active', 'outbid', 'won', 'lost'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
bidSchema.index({ auction_id: 1, amount: -1 });
bidSchema.index({ bidder_id: 1, bid_time: -1 });

module.exports = mongoose.model('Bid', bidSchema);
