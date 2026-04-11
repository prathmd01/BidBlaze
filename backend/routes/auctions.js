
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { auth, authorize } = require('../middleware/auth');
const { cleanupAuctionImages } = require('../lib/imageCleanup');

const router = express.Router();

// Get all auctions with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['watches', 'art', 'jewelry', 'cars', 'books', 'electronics', 'collectibles', 'other']),
  query('status').optional().isIn(['active', 'scheduled', 'ended']),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'ending_soon', 'newest'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 12,
      category,
      status,
      sort = 'newest',
      search
    } = req.query;

    // Build filter
    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sortObj = {};
    switch (sort) {
      case 'price_asc':
        sortObj = { current_price: 1 };
        break;
      case 'price_desc':
        sortObj = { current_price: -1 };
        break;
      case 'ending_soon':
        sortObj = { end_time: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const auctions = await Auction.find(filter)
      .populate('seller_id', 'full_name email')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Auction.countDocuments(filter);

    // Update auction statuses
    auctions.forEach(auction => auction.updateStatus());

    res.json({
      auctions,
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

// Get auctions for the current logged-in seller
router.get('/seller', auth, authorize('seller', 'admin'), async (req, res) => {
  try {
    const auctions = await Auction.find({ seller_id: req.user._id })
      .sort({ createdAt: -1 });

    // Update statuses
    auctions.forEach(auction => auction.updateStatus());

    res.json({ auctions });
  } catch (error) {
    console.error('Error fetching seller auctions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single auction
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller_id', 'full_name email kyc_status address')
      .populate('winner_id', 'full_name');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Update status
    auction.updateStatus();
    await auction.save();

    // Get recent bids
    const recentBids = await Bid.find({ auction_id: auction._id })
      .populate('bidder_id', 'full_name')
      .sort({ bid_time: -1 })
      .limit(10);
    const sellerId = (auction.seller_id && auction.seller_id._id) ? auction.seller_id._id : auction.seller_id;
    const totalSellerAuctions = await Auction.countDocuments({ seller_id: sellerId });
    const successfulSellerAuctions = await Auction.countDocuments({ seller_id: sellerId, status: 'ended', payment_status: 'paid' });
    const rating = totalSellerAuctions > 0 ? Math.min(5, Math.round((successfulSellerAuctions / totalSellerAuctions) * 50) / 10) : null;

    const User = require('../models/User');
    const SellerDatabase = require('../models/Seller');
    let sellerDoc = await User.findById(sellerId).select('full_name email kyc_status address');
    if (!sellerDoc) {
      sellerDoc = await SellerDatabase.findById(sellerId).select('business_name email kyc_status address');
    }

    const addr = sellerDoc && sellerDoc.address ? sellerDoc.address : {};
    const sellerLocation = [addr.city, addr.state, addr.country].filter(Boolean).join(', ');

    const auctionObj = auction.toObject();
    auctionObj.seller_id = {
      ...(sellerDoc ? {
        _id: sellerId,
        full_name: sellerDoc.full_name,
        business_name: sellerDoc.business_name,
        email: sellerDoc.email,
        kyc_status: sellerDoc.kyc_status
      } : { _id: sellerId }),
      rating,
      successful_auctions: successfulSellerAuctions,
      location: sellerLocation
    };
    if (!auctionObj.location && sellerLocation) {
      auctionObj.location = sellerLocation;
    }

    res.json({
      auction: auctionObj,
      recent_bids: recentBids
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create auction (sellers only)
router.post('/', [
  auth,
  authorize('seller', 'admin'),
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('category').isIn(['watches', 'art', 'jewelry', 'cars', 'books', 'electronics', 'collectibles', 'other']),
  body('starting_price').isFloat({ min: 0 }).custom((value) => {
    if (value < 100) {
      throw new Error('Starting price must be at least ₹100');
    }
    return true;
  }),
  body('bid_increment').isFloat({ min: 1 }),
  body('start_time').isISO8601(),
  body('end_time').isISO8601(),
  body('condition').optional().isIn(['new', 'like_new', 'good', 'fair', 'poor']),
  body('images').isArray().custom((value) => {
    if (!value || value.length < 1) {
      throw new Error('At least 1 image is required');
    }
    if (value.length > 10) {
      throw new Error('Maximum 10 images allowed per auction');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const auctionData = {
      ...req.body,
      seller_id: req.user._id,
      start_time: new Date(req.body.start_time),
      end_time: new Date(req.body.end_time)
    };

    // Validate images structure if provided
    if (auctionData.images && Array.isArray(auctionData.images)) {
      auctionData.images.forEach((img, index) => {
        if (!img.url || !img.public_id) {
          throw new Error(`Image ${index + 1} is missing required fields (url or public_id)`);
        }
      });
    }

    const auction = new Auction(auctionData);
    await auction.save();

    res.status(201).json({
      message: 'Auction created successfully',
      auction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update auction (seller only, before auction starts)
router.put('/:id', [
  auth,
  authorize('seller', 'admin'),
  body('title').optional().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('starting_price').optional().isFloat({ min: 0 }).custom((value) => {
    if (value && value < 100) {
      throw new Error('Starting price must be at least ₹100');
    }
    return true;
  }),
  body('reserve_price').optional().isFloat({ min: 0 }),
  body('images').optional().isArray().custom((value) => {
    if (value && value.length > 10) {
      throw new Error('Maximum 10 images allowed per auction');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user owns the auction
    if (auction.seller_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this auction' });
    }

    // Check if auction has started
    if (auction.status === 'active' || auction.status === 'ended') {
      return res.status(400).json({ message: 'Cannot update auction that has started or ended' });
    }

    // Validate images structure if provided
    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.images.forEach((img, index) => {
        if (!img.url || !img.public_id) {
          throw new Error(`Image ${index + 1} is missing required fields (url or public_id)`);
        }
      });
    }

    // Update auction
    Object.assign(auction, req.body);
    await auction.save();

    // Emit Socket.IO event for product updates
    const io = req.app.get('io');
    if (io) {
      io.to(`auction_${auction._id}`).emit('productUpdate', {
        auctionId: auction._id,
        updates: auction,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      message: 'Auction updated successfully',
      auction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete auction (seller only, before auction starts)
router.delete('/:id', [auth, authorize('seller', 'admin')], async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user owns the auction
    if (auction.seller_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this auction' });
    }

    // Check if auction has bids
    const bidCount = await Bid.countDocuments({ auction_id: auction._id });
    if (bidCount > 0) {
      return res.status(400).json({ message: 'Cannot delete auction with existing bids' });
    }

    // Clean up images from Cloudinary before deleting auction
    await cleanupAuctionImages(auction);

    await Auction.findByIdAndDelete(req.params.id);

    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

// Endpoint to create all placeholder auctions from frontend
router.post('/create-placeholder-auctions', async (req, res) => {
  try {
    // Create a test seller if needed
    const User = require('../models/User');
    let testSeller = await User.findOne({ email: 'test-seller@bidblaze.com' });

    if (!testSeller) {
      testSeller = new User({
        full_name: 'Test Seller',
        email: 'test-seller@bidblaze.com',
        password: 'test123456',
        role: 'seller'
      });
      await testSeller.save();
    }

    // Create auctions from frontend placeholder data
    const placeholderAuctions = [
      {
        title: "Vintage Rolex Submariner 1680 - Rare Red Sub",
        description: "A highly sought-after vintage Rolex Submariner 1680 with the rare 'Red Sub' dial. This timepiece features a black dial with red 'Submariner' text, a black bezel, and has been professionally serviced. Includes original box and papers. Excellent condition with minimal wear.",
        category: "watches",
        starting_price: 800000,
        current_price: 1000000,
        bid_increment: 1900,
        start_time: new Date(),
        end_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
        condition: "like_new",
        seller_id: testSeller._id,
        total_bids: 18,
        images: [
          {
            url: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-watch-1"
          },
          {
            url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-watch-2"
          },
          {
            url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-watch-3"
          }
        ],
        status: "active",
        shipping_details: {
          cost: 0,
          estimated_days: 3
        }
      },
      {
        title: "Rare First Edition Book Collection - Complete Set",
        description: "A complete collection of rare first edition novels from renowned authors of the 20th century. All books are in very good condition with minimal wear. Includes signed copies and limited editions.",
        category: "books",
        starting_price: 300000,
        current_price: 400000,
        bid_increment: 5000,
        start_time: new Date(),
        end_time: new Date(Date.now() + 4.5 * 60 * 60 * 1000),
        condition: "good",
        seller_id: testSeller._id,
        total_bids: 9,
        images: [
          {
            url: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-books-1"
          },
          {
            url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-books-2"
          },
          {
            url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-books-3"
          }
        ],
        status: "active",
        shipping_details: {
          cost: 0,
          estimated_days: 5
        }
      },
      {
        title: "Original Oil Painting by Emma Roberts - Contemporary Art",
        description: "An original contemporary oil painting by emerging artist Emma Roberts. The piece measures 24″ x 36″ and comes in a handcrafted frame. This is a unique piece with vibrant colors and modern composition.",
        category: "art",
        starting_price: 400000,
        current_price: 600000,
        bid_increment: 20000,
        start_time: new Date(),
        end_time: new Date(Date.now() + 32 * 60 * 60 * 1000),
        condition: "new",
        seller_id: testSeller._id,
        total_bids: 12,
        images: [
          {
            url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62b1?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-art-1"
          },
          {
            url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62b1?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-art-2"
          },
          {
            url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62b1?auto=format&fit=crop&q=80&w=800&h=600",
            public_id: "test-art-3"
          }
        ],
        status: "active",
        shipping_details: {
          cost: 0,
          estimated_days: 7
        }
      }
    ];

    // Save all auctions to database
    const createdAuctions = [];
    for (const auctionData of placeholderAuctions) {
      const auction = new Auction(auctionData);
      await auction.save();
      createdAuctions.push({
        id: auction._id,
        title: auction.title
      });
    }

    res.status(201).json({
      message: 'Placeholder auctions created successfully',
      auctions: createdAuctions,
      test_seller: {
        email: 'test-seller@bidblaze.com',
        password: 'test123456'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recommended auctions for user
router.get('/recommended', auth, async (req, res) => {
  try {
    const { limit = 4 } = req.query;

    // Get user's bid categories to recommend similar auctions
    const userBids = await Bid.find({ bidder_id: req.user._id })
      .populate('auction_id', 'category')
      .limit(10);

    // Extract categories from user's bids
    const userCategories = userBids
      .filter(bid => bid.auction_id && bid.auction_id.category)
      .map(bid => bid.auction_id.category);

    // If user has bid history, recommend auctions from those categories
    // Otherwise, recommend active auctions across all categories
    let filter = { status: 'active' };

    if (userCategories.length > 0) {
      filter.category = { $in: [...new Set(userCategories)] };
    }

    // Don't recommend auctions the user has already bid on
    const userAuctionIds = userBids
      .filter(bid => bid.auction_id)
      .map(bid => bid.auction_id._id);

    if (userAuctionIds.length > 0) {
      filter._id = { $nin: userAuctionIds };
    }

    const auctions = await Auction.find(filter)
      .sort({ total_bids: -1 }) // Popular auctions first
      .limit(parseInt(limit));

    res.json({
      auctions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test endpoint to create a sample auction (for development only)
router.post('/create-test', async (req, res) => {
  try {
    // Create a test seller if needed
    const User = require('../models/User');
    let testSeller = await User.findOne({ email: 'test-seller@bidblaze.com' });

    if (!testSeller) {
      testSeller = new User({
        full_name: 'Test Seller',
        email: 'test-seller@bidblaze.com',
        password: 'test123456',
        role: 'seller'
      });
      await testSeller.save();
    }

    // Create test auction
    const testAuction = new Auction({
      title: 'Rare First Edition Book Collection - Complete Set',
      description: 'A complete collection of rare first edition novels from renowned authors of the 20th century. All books are in very good condition with minimal wear. Includes signed copies and limited editions.',
      category: 'books',
      starting_price: 300000,
      current_price: 300000,
      bid_increment: 5000,
      start_time: new Date(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      condition: 'good',
      seller_id: testSeller._id,
      images: [{
        url: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=800&h=600',
        public_id: 'test-books-1'
      }],
      location: 'Delhi, India',
      shipping: 'Free shipping within India',
      return_policy: '14-day return policy',
      authenticity: 'Expert Verified',
      expert_verified: true
    });

    await testAuction.save();

    res.status(201).json({
      message: 'Test auction created successfully',
      auction: {
        id: testAuction._id,
        title: testAuction.title,
        current_price: testAuction.current_price,
        bid_increment: testAuction.bid_increment,
        end_time: testAuction.end_time
      },
      test_seller: {
        email: 'test-seller@bidblaze.com',
        password: 'test123456'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
