
const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Auction title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['watches', 'art', 'jewelry', 'cars', 'books', 'electronics', 'collectibles', 'other']
  },
  starting_price: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price must be positive']
  },
  current_price: {
    type: Number,
    default: function() { return this.starting_price; }
  },
  reserve_price: {
    type: Number,
    validate: {
      validator: function(v) {
        return v >= this.starting_price;
      },
      message: 'Reserve price must be greater than or equal to starting price'
    }
  },
  bid_increment: {
    type: Number,
    required: [true, 'Bid increment is required'],
    min: [1, 'Bid increment must be at least 1']
  },
  start_time: {
    type: Date,
    required: [true, 'Start time is required']
  },
  end_time: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        return v > this.start_time;
      },
      message: 'End time must be after start time'
    }
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    width: Number,
    height: Number,
    format: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'ended', 'cancelled'],
    default: 'draft'
  },
  total_bids: {
    type: Number,
    default: 0
  },
  winner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winning_bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shipping_details: {
    cost: Number,
    estimated_days: Number,
    tracking_number: String
  },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update status based on current time
auctionSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (this.status === 'cancelled') return;
  
  if (now < this.start_time) {
    this.status = 'scheduled';
  } else if (now >= this.start_time && now < this.end_time) {
    this.status = 'active';
  } else if (now >= this.end_time) {
    this.status = 'ended';
  }
};

// Pre-save middleware to update status
auctionSchema.pre('save', function(next) {
  this.updateStatus();
  next();
});

module.exports = mongoose.model('Auction', auctionSchema);
