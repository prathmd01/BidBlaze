const Auction = require('../../models/Auction');
const Bid = require('../../models/Bid');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';

const CATEGORY_MAP = {
  watches: 0,
  art: 1,
  jewelry: 2,
  cars: 3,
  books: 4,
  electronics: 5,
  collectibles: 6,
  other: 7
};

/**
 * Heuristic fallback when Python ML service is offline.
 */
function heuristicPrediction(auction, uniqueBidders, timeRemainingHours) {
  const urgencyMultiplier = timeRemainingHours < 2 ? 1.15 : timeRemainingHours < 24 ? 1.08 : 1.03;
  const bidderBoost = 1 + Math.min(uniqueBidders * 0.02, 0.25);
  const categoryBoost = auction.category === 'cars' ? 1.1 : auction.category === 'jewelry' ? 1.05 : 1;
  const predicted = Math.round(
    auction.current_price * urgencyMultiplier * bidderBoost * categoryBoost
  );
  return {
    predicted_final_price: Math.max(predicted, auction.current_price),
    confidence: 'low',
    model: 'heuristic-fallback'
  };
}

async function buildPredictionPayload(auctionId) {
  const auction = await Auction.findById(auctionId);
  if (!auction) throw new Error('Auction not found');

  const bids = await Bid.find({ auction_id: auctionId }).sort({ amount: -1 });
  const uniqueBidders = new Set(bids.map((b) => b.bidder_id.toString())).size;
  const now = Date.now();
  const endMs = new Date(auction.end_time).getTime();
  const timeRemainingHours = Math.max((endMs - now) / (1000 * 60 * 60), 0);

  const bidHistory = bids.slice(0, 20).map((b) => ({
    amount: b.amount,
    time: b.bid_time || b.createdAt
  }));

  return {
    auction_id: auction._id.toString(),
    current_highest_bid: auction.current_price,
    starting_price: auction.starting_price,
    num_bidders: uniqueBidders,
    total_bids: auction.total_bids || bids.length,
    time_remaining_hours: Math.round(timeRemainingHours * 100) / 100,
    category: auction.category,
    category_encoded: CATEGORY_MAP[auction.category] ?? 7,
    bid_increment: auction.bid_increment,
    bid_history: bidHistory
  };
}

async function predictFinalPrice(auctionId) {
  const payload = await buildPredictionPayload(auctionId);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`ML service returned ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      inputs: payload,
      source: 'ml-service'
    };
  } catch (error) {
    console.warn('ML prediction fallback:', error.message);
    const auction = await Auction.findById(auctionId);
    const fallback = heuristicPrediction(
      auction,
      payload.num_bidders,
      payload.time_remaining_hours
    );
    return {
      ...fallback,
      inputs: payload,
      source: 'heuristic-fallback',
      ml_error: error.message
    };
  }
}

module.exports = { predictFinalPrice, buildPredictionPayload, heuristicPrediction };
