
const jwt = require('jsonwebtoken');
const UserDatabase = require('../models/User');
const SellerDatabase = require('../models/Seller');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in UserDatabase first
    let user = await UserDatabase.findById(decoded.userId).select('-password');
    let userType = 'user';
    
    // If not found in UserDatabase, try SellerDatabase
    if (!user) {
      user = await SellerDatabase.findById(decoded.userId).select('-password');
      userType = 'seller';
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Ensure user has is_active field
    if (user.is_active === false) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    // Add role if not present (for backward compatibility)
    if (!user.role) {
      user.role = userType;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
