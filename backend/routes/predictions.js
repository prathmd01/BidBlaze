const express = require('express');
const mongoose = require('mongoose');
const predictionService = require('../services/prediction/predictionService');

const router = express.Router();

// POST /api/predictions/:auctionId — predict final auction price
router.post('/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({ message: 'Invalid auction ID' });
    }

    const result = await predictionService.predictFinalPrice(auctionId);

    res.json({
      success: true,
      predicted_final_price: result.predicted_final_price,
      confidence: result.confidence || 'medium',
      model: result.model,
      source: result.source,
      inputs: {
        current_highest_bid: result.inputs?.current_highest_bid,
        num_bidders: result.inputs?.num_bidders,
        time_remaining_hours: result.inputs?.time_remaining_hours,
        category: result.inputs?.category
      }
    });
  } catch (error) {
    console.error('Prediction error:', error);
    if (error.message === 'Auction not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to generate prediction', error: error.message });
  }
});

module.exports = router;
