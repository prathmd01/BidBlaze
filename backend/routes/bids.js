
const express = require('express');
const { body, validationResult } = require('express-validator');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Place a bid
router.post('/', [
  auth,
  body('auction_id').isMongoId(),
  body('amount').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { auction_id, amount, is_auto_bid = false, max_auto_bid } = req.body;

    // Get auction
    const auction = await Auction.findById(auction_id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if auction is active
    auction.updateStatus();
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    // Check if user is not the seller
    if (auction.seller_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Sellers cannot bid on their own auctions' });
    }

    // Check if bid amount is valid
    const minBidAmount = auction.current_price + auction.bid_increment;
    if (amount < minBidAmount) {
      return res.status(400).json({
        message: `Bid must be at least ${minBidAmount}`
      });
    }

    // Check if this is an auto bid and validate max_auto_bid
    if (is_auto_bid && (!max_auto_bid || max_auto_bid < amount)) {
      return res.status(400).json({
        message: 'Max auto bid must be greater than or equal to current bid amount'
      });
    }

    // Mark previous winning bid as outbid
    await Bid.updateMany(
      { auction_id, is_winning: true },
      { is_winning: false, status: 'outbid' }
    );

    // Create new bid
    const bid = new Bid({
      auction_id,
      bidder_id: req.user._id,
      amount,
      is_auto_bid,
      max_auto_bid,
      is_winning: true,
      status: 'active'
    });

    await bid.save();

    // Update auction
    auction.current_price = amount;
    auction.total_bids += 1;
    auction.winner_id = req.user._id;
    auction.winning_bid = bid._id;
    await auction.save();

    // Populate bid for response
    await bid.populate('bidder_id', 'full_name');

    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`auction_${auction_id}`).emit('bidUpdate', {
        auctionId: auction_id,
        newBid: amount,
        bidderId: req.user._id,
        bidderName: req.user.full_name || req.user.business_name,
        timestamp: new Date().toISOString(),
        totalBids: auction.total_bids
      });
    }

    res.status(201).json({
      message: 'Bid placed successfully',
      bid,
      auction: {
        current_price: auction.current_price,
        total_bids: auction.total_bids
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bids for an auction
router.get('/auction/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const bids = await Bid.find({ auction_id: auctionId })
      .populate('bidder_id', 'full_name email')
      .sort({ bid_time: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Bid.countDocuments({ auction_id: auctionId });

    res.json({
      bids,
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

// Get user's bids
router.get('/my-bids', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let filter = { bidder_id: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const bids = await Bid.find(filter)
      .populate('auction_id', 'title current_price end_time status images')
      .sort({ bid_time: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Bid.countDocuments(filter);

    res.json({
      bids,
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

// Get winning bids for user
router.get('/winning', auth, async (req, res) => {
  try {
    const winningBids = await Bid.find({
      bidder_id: req.user._id,
      is_winning: true
    })
      .populate('auction_id', 'title current_price end_time status images payment_status')
      .sort({ bid_time: -1 });

    res.json({ winning_bids: winningBids });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Delete a bid
router.delete('/:id', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    // Ensure the user is the one who placed the bid
    if (bid.bidder_id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const auction = await Auction.findById(bid.auction_id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // If the bid to be deleted is the winning bid, we need to find the next highest bid and make it the winning bid.
    if (bid.is_winning) {
      await bid.deleteOne();

      const nextHighestBid = await Bid.findOne({ auction_id: auction._id }).sort({ amount: -1 });

      if (nextHighestBid) {
        nextHighestBid.is_winning = true;
        await nextHighestBid.save();
        auction.current_price = nextHighestBid.amount;
        auction.winner_id = nextHighestBid.bidder_id;
        auction.winning_bid = nextHighestBid._id;
      } else {
        // If there are no other bids, reset the auction's current price to the starting price
        auction.current_price = auction.starting_price;
        auction.winner_id = null;
        auction.winning_bid = null;
      }
    } else {
      await bid.deleteOne();
    }

    auction.total_bids -= 1;
    await auction.save();

    res.json({ message: 'Bid deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
