
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Set JWT secret if not in environment
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const paymentRoutes = require('./routes/payments');
const imageRoutes = require('./routes/images');

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import the connectDB function from the mongodb.js file
const connectDB = require('./lib/mongodb');

// Import models to ensure they are registered with Mongoose
require('./models/User');
require('./models/Auction');
require('./models/Bid');
require('./models/Seller');
require('./models/Transaction');

// Connect to MongoDB Atlas directly using the connectDB function
connectDB();


// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Join auction room
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`User ${socket.userId} joined auction ${auctionId}`);
  });
  
  // Leave auction room
  socket.on('leaveAuction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`User ${socket.userId} left auction ${auctionId}`);
  });
  
  // Handle new bid
  socket.on('newBid', (data) => {
    const { auctionId, bidAmount, bidderId, bidderName } = data;
    io.to(`auction_${auctionId}`).emit('bidUpdate', {
      auctionId,
      newBid: bidAmount,
      bidderId,
      bidderName,
      timestamp: new Date().toISOString()
    });
    console.log(`New bid of ${bidAmount} for auction ${auctionId}`);
  });
  
  // Handle product updates
  socket.on('productUpdate', (data) => {
    const { auctionId, updates } = data;
    io.to(`auction_${auctionId}`).emit('productUpdate', {
      auctionId,
      updates,
      timestamp: new Date().toISOString()
    });
    console.log(`Product update for auction ${auctionId}`);
  });
  
  // Handle image updates
  socket.on('imageUpdate', (data) => {
    const { auctionId, images } = data;
    io.to(`auction_${auctionId}`).emit('imageUpdate', {
      auctionId,
      images,
      timestamp: new Date().toISOString()
    });
    console.log(`Image update for auction ${auctionId}`);
  });
  
  // Handle auction end
  socket.on('auctionEnd', (data) => {
    const { auctionId, winnerId, finalBid } = data;
    io.to(`auction_${auctionId}`).emit('auctionEnd', {
      auctionId,
      winnerId,
      finalBid,
      timestamp: new Date().toISOString()
    });
    console.log(`Auction ${auctionId} ended`);
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready for real-time updates`);
});
