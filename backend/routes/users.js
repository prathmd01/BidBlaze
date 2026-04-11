
const express = require('express');
const { body, validationResult } = require('express-validator');
const UserDatabase = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await UserDatabase.findById(req.user._id);

    // Get user stats
    const stats = {
      total_auctions: 0,
      total_bids: 0,
      won_auctions: 0,
      active_bids: 0
    };

    // Only count auctions/bids if user exists
    if (user) {
      stats.total_bids = await Bid.countDocuments({ bidder_id: user._id });
      stats.won_auctions = await Bid.countDocuments({
        bidder_id: user._id,
        is_winning: true
      });
      stats.active_bids = await Bid.countDocuments({
        bidder_id: user._id,
        status: 'active'
      });
    }

    res.json({
      user,
      stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', [
  auth,
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/),
  body('address.street').optional().trim().isLength({ max: 200 }),
  body('address.city').optional().trim().isLength({ max: 100 }),
  body('address.state').optional().trim().isLength({ max: 100 }),
  body('address.zip_code').optional().trim().isLength({ max: 20 }),
  body('address.country').optional().trim().isLength({ max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, phone, address, avatar_url } = req.body;

    const updatedUser = await UserDatabase.findByIdAndUpdate(
      req.user._id,
      {
        ...(full_name && { full_name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(avatar_url && { avatar_url })
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change password
router.put('/change-password', [
  auth,
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { current_password, new_password } = req.body;

    // Get user with password
    const user = await UserDatabase.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = new_password;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's auctions (for sellers)
router.get('/my-auctions', [auth, authorize('seller', 'admin')], async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let filter = { seller_id: req.user._id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const auctions = await Auction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Auction.countDocuments(filter);

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

// Update user by ID (for profile editing)
router.put('/:userId', [
  auth,
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('business_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail(),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/),
  body('address.street').optional().trim().isLength({ max: 200 }),
  body('address.city').optional().trim().isLength({ max: 100 }),
  body('address.state').optional().trim().isLength({ max: 100 }),
  body('address.zip_code').optional().trim().isLength({ max: 20 }),
  body('address.country').optional().trim().isLength({ max: 100 }),
  body('address.country').optional().trim().isLength({ max: 100 }),
  body('avatar_url').optional().isURL(),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('website').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is updating their own profile
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const updateData = { ...req.body };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    // Handle address object
    if (updateData.address) {
      Object.keys(updateData.address).forEach(key => {
        if (updateData.address[key] === undefined || updateData.address[key] === '') {
          delete updateData.address[key];
        }
      });
      if (Object.keys(updateData.address).length === 0) {
        delete updateData.address;
      }
    }

    // Try to update in UserDatabase first
    let updatedUser = await UserDatabase.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    // If not found in UserDatabase, try SellerDatabase
    if (!updatedUser) {
      const SellerDatabase = require('../models/Seller');
      updatedUser = await SellerDatabase.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Deactivate account
router.put('/deactivate', auth, async (req, res) => {
  try {
    // Check for active auctions
    const activeAuctions = await Auction.countDocuments({
      seller_id: req.user._id,
      status: { $in: ['active', 'scheduled'] }
    });

    if (activeAuctions > 0) {
      return res.status(400).json({
        message: 'Cannot deactivate account with active auctions'
      });
    }

    await UserDatabase.findByIdAndUpdate(req.user._id, { is_active: false });

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
