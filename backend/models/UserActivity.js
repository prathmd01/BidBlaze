const mongoose = require('mongoose');

const viewedAuctionSchema = new mongoose.Schema({
  auction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  viewed_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const userActivitySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  viewed_auctions: {
    type: [viewedAuctionSchema],
    default: []
  },
  // Category interest scores built from views and bids
  category_scores: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Keep only the last 50 viewed auctions per user
userActivitySchema.methods.addView = function(auctionId, category) {
  this.viewed_auctions = this.viewed_auctions.filter(
    (v) => v.auction_id.toString() !== auctionId.toString()
  );
  this.viewed_auctions.unshift({ auction_id: auctionId, category, viewed_at: new Date() });
  if (this.viewed_auctions.length > 50) {
    this.viewed_auctions = this.viewed_auctions.slice(0, 50);
  }

  const current = this.category_scores.get(category) || 0;
  this.category_scores.set(category, current + 1);
};

module.exports = mongoose.model('UserActivity', userActivitySchema);
