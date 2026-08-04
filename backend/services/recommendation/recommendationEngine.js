const Auction = require('../../models/Auction');
const Bid = require('../../models/Bid');
const UserActivity = require('../../models/UserActivity');

const ALL_CATEGORIES = [
  'watches', 'art', 'jewelry', 'cars', 'books', 'electronics', 'collectibles', 'other'
];

/**
 * Build a category preference vector for a user (8 dimensions).
 */
function buildCategoryVector(categoryScores) {
  const vec = ALL_CATEGORIES.map((cat) => {
    const score = categoryScores?.get?.(cat) ?? categoryScores?.[cat] ?? 0;
    return Number(score) || 0;
  });
  const sum = vec.reduce((a, b) => a + b, 0);
  if (sum === 0) return vec.map(() => 1 / ALL_CATEGORIES.length);
  return vec.map((v) => v / sum);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Phase 1: Simple popularity + category match from bid history.
 */
async function getDummyRecommendations(userId, limit = 8) {
  const userBids = await Bid.find({ bidder_id: userId })
    .populate('auction_id', 'category')
    .limit(20);

  const bidCategories = [
    ...new Set(
      userBids
        .filter((b) => b.auction_id?.category)
        .map((b) => b.auction_id.category)
    )
  ];

  const activity = await UserActivity.findOne({ user_id: userId });
  const viewedIds = (activity?.viewed_auctions || []).map((v) => v.auction_id.toString());
  const bidAuctionIds = userBids
    .filter((b) => b.auction_id)
    .map((b) => b.auction_id._id.toString());

  const excludeIds = [...new Set([...viewedIds, ...bidAuctionIds])];

  const filter = { status: 'active' };
  if (bidCategories.length) filter.category = { $in: bidCategories };
  if (excludeIds.length) filter._id = { $nin: excludeIds };

  const auctions = await Auction.find(filter)
    .sort({ total_bids: -1, featured: -1 })
    .limit(limit);

  if (auctions.length >= limit) {
    return { auctions, algorithm: 'dummy-category-popularity' };
  }

  const fallback = await Auction.find({ status: 'active', _id: { $nin: excludeIds } })
    .sort({ total_bids: -1 })
    .limit(limit);

  return { auctions: fallback, algorithm: 'dummy-popular-fallback' };
}

/**
 * Phase 2: Cosine similarity — collaborative filtering across users + content scores.
 */
async function getCosineRecommendations(userId, limit = 8) {
  const [userBids, allActivities, activeAuctions] = await Promise.all([
    Bid.find({ bidder_id: userId }).populate('auction_id', 'category').limit(30),
    UserActivity.find().limit(200),
    Auction.find({ status: 'active' }).select(
      'title category current_price total_bids end_time images featured'
    )
  ]);

  // Build target user vector from bids + activity
  const targetScores = new Map();
  userBids.forEach((b) => {
    if (b.auction_id?.category) {
      const c = b.auction_id.category;
      targetScores.set(c, (targetScores.get(c) || 0) + 2);
    }
  });

  const myActivity = allActivities.find((a) => a.user_id.toString() === userId.toString());
  if (myActivity?.category_scores) {
    for (const [cat, score] of myActivity.category_scores) {
      targetScores.set(cat, (targetScores.get(cat) || 0) + score);
    }
  }

  const targetVec = buildCategoryVector(targetScores);

  // Similar users by category vector
  const similarUsers = [];
  for (const act of allActivities) {
    if (act.user_id.toString() === userId.toString()) continue;
    const vec = buildCategoryVector(act.category_scores);
    const sim = cosineSimilarity(targetVec, vec);
    if (sim > 0.3) similarUsers.push({ userId: act.user_id, similarity: sim });
  }
  similarUsers.sort((a, b) => b.similarity - a.similarity);

  const similarUserIds = similarUsers.slice(0, 10).map((u) => u.userId);
  let collaborativeAuctionIds = [];

  if (similarUserIds.length) {
    const similarBids = await Bid.find({ bidder_id: { $in: similarUserIds } })
      .populate('auction_id', '_id category')
      .limit(50);
    collaborativeAuctionIds = similarBids
      .filter((b) => b.auction_id)
      .map((b) => b.auction_id._id.toString());
  }

  const exclude = new Set([
    ...userBids.filter((b) => b.auction_id).map((b) => b.auction_id._id.toString()),
    ...(myActivity?.viewed_auctions || []).map((v) => v.auction_id.toString())
  ]);

  // Score each active auction: content match + collaborative boost
  const scored = activeAuctions
    .filter((a) => !exclude.has(a._id.toString()))
    .map((auction) => {
      const catIdx = ALL_CATEGORIES.indexOf(auction.category);
      const contentScore = catIdx >= 0 ? targetVec[catIdx] : 0;
      const collabBoost = collaborativeAuctionIds.includes(auction._id.toString()) ? 0.25 : 0;
      const popularity = Math.min((auction.total_bids || 0) / 20, 0.2);
      const featured = auction.featured ? 0.1 : 0;
      const score = contentScore * 0.55 + collabBoost + popularity + featured;
      return { auction, score };
    })
    .sort((a, b) => b.score - a.score);

  const auctions = scored.slice(0, limit).map((s) => s.auction);

  if (auctions.length < limit) {
    const { auctions: fallback } = await getDummyRecommendations(userId, limit);
    const seen = new Set(auctions.map((a) => a._id.toString()));
    for (const a of fallback) {
      if (!seen.has(a._id.toString()) && auctions.length < limit) {
        auctions.push(a);
        seen.add(a._id.toString());
      }
    }
    return { auctions, algorithm: 'cosine-hybrid-fallback' };
  }

  return {
    auctions,
    algorithm: 'cosine-similarity',
    meta: { similarUsersFound: similarUsers.length }
  };
}

async function getRecommendations(userId, options = {}) {
  const limit = Math.min(parseInt(options.limit, 10) || 8, 24);
  const mode = process.env.RECOMMENDATION_MODE || 'cosine';

  if (mode === 'dummy') {
    return getDummyRecommendations(userId, limit);
  }
  return getCosineRecommendations(userId, limit);
}

async function trackAuctionView(userId, auctionId) {
  const auction = await Auction.findById(auctionId).select('category');
  if (!auction) throw new Error('Auction not found');

  let activity = await UserActivity.findOne({ user_id: userId });
  if (!activity) {
    activity = new UserActivity({ user_id: userId, viewed_auctions: [], category_scores: {} });
  }

  activity.addView(auction._id, auction.category);
  await activity.save();
  return { success: true };
}

module.exports = {
  getRecommendations,
  trackAuctionView,
  getDummyRecommendations,
  getCosineRecommendations,
  cosineSimilarity,
  buildCategoryVector
};
