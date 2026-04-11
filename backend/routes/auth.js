
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const UserDatabase = require('../models/User');
const SellerDatabase = require('../models/Seller');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register
router.post('/register', [
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('business_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['user', 'seller'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, business_name, email, password, role = 'user', phone, address } = req.body;

    let existingUser, user;
    if (role === 'seller') {
      existingUser = await SellerDatabase.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Seller already exists with this email' });
      }
      user = new SellerDatabase({
        business_name: business_name || full_name,
        email,
        password,
        phone,
        address,
        role: 'seller'
      });
      await user.save();
    } else {
      existingUser = await UserDatabase.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      user = new UserDatabase({
        full_name: full_name || business_name,
        email,
        password,
        phone,
        address
      });
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      token,
      user: {
        id: user._id,
        full_name: user.full_name || user.business_name,
        email: user.email,
        role: user.role || role,
        business_name: user.business_name,
        phone: user.phone,
        address: user.address,
        kyc_status: user.kyc_status,
        bio: user.bio,
        website: user.website
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  body('role').optional().isIn(['user', 'seller'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role = 'user' } = req.body;
    let user;
    if (role === 'seller') {
      user = await SellerDatabase.findOne({ email }).select('+password');
    } else {
      user = await UserDatabase.findOne({ email }).select('+password');
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    user.last_login = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        full_name: user.full_name || user.business_name,
        email: user.email,
        role: user.role || role,
        business_name: user.business_name,
        phone: user.phone,
        address: user.address,
        kyc_status: user.kyc_status,
        bio: user.bio,
        website: user.website
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        full_name: req.user.full_name || req.user.business_name,
        email: req.user.email,
        role: req.user.role,
        business_name: req.user.business_name,
        phone: req.user.phone,
        address: req.user.address,
        kyc_status: req.user.kyc_status,
        bio: req.user.bio,
        website: req.user.website,
        avatar_url: req.user.avatar_url
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
