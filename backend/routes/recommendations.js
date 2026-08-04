const express = require('express');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');
const recommendationEngine = require('../services/recommendation/recommendationEngine');

const router = express.Router();

// GET /api/recommendations/:userId — personalized auction recommendations
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Users can only fetch their own recommendations (unless admin)
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const limit = req.query.limit || 8;
    const { auctions, algorithm, meta } = await recommendationEngine.getRecommendations(
      userId,
      { limit }
    );

    res.json({
      success: true,
      auctions,
      algorithm,
      meta,
      count: auctions.length
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations', error: error.message });
  }
});

// POST /api/recommendations/track-view — record auction view for better recommendations
router.post('/track-view', auth, [
  // body validated inline
], async (req, res) => {
  try {
    const { auctionId } = req.body;
    if (!auctionId || !mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({ message: 'Valid auctionId is required' });
    }

    await recommendationEngine.trackAuctionView(req.user._id, auctionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to track view' });
  }
});

module.exports = router;
