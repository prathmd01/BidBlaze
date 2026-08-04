const Auction = require('../../models/Auction');

const CATEGORIES = ['watches', 'art', 'jewelry', 'cars', 'books', 'electronics', 'collectibles', 'other'];

/**
 * Fetches live auction data to inject into the AI system prompt.
 */
async function buildAuctionContext() {
  const now = new Date();
  const [active, endingSoon, electronics] = await Promise.all([
    Auction.find({ status: 'active' })
      .sort({ total_bids: -1 })
      .limit(8)
      .select('title category current_price end_time total_bids'),
    Auction.find({ status: 'active', end_time: { $gt: now } })
      .sort({ end_time: 1 })
      .limit(5)
      .select('title category current_price end_time'),
    Auction.find({
      status: 'active',
      category: 'electronics',
      current_price: { $lte: 5000 }
    })
      .sort({ current_price: 1 })
      .limit(5)
      .select('title current_price end_time')
  ]);

  return {
    active,
    endingSoon,
    electronicsUnder5000: electronics,
    categories: CATEGORIES
  };
}

function formatAuctionList(auctions) {
  if (!auctions.length) return 'None available.';
  return auctions
    .map((a) => {
      const ends = a.end_time ? new Date(a.end_time).toLocaleString('en-IN') : 'N/A';
      return `- "${a.title}" (${a.category}) — current bid ₹${a.current_price}, ${a.total_bids ?? 0} bids, ends ${ends}`;
    })
    .join('\n');
}

function buildSystemPrompt(context) {
  return `You are BidBlaze Assistant, a helpful AI for an Indian auction platform (prices in ₹ INR).

You can help users with:
- Finding auctions (by category, price, ending soon)
- Explaining how bidding works on BidBlaze
- Suggesting popular or relevant auctions

HOW BIDDING WORKS ON BIDBLAZE:
1. Browse active auctions and open an auction page.
2. Place a bid at or above current price + minimum increment.
3. Highest bid when the timer ends wins (subject to reserve price if set).
4. Winners complete payment via Razorpay on the platform.

CURRENT LIVE DATA (use this for factual answers):
Popular active auctions:
${formatAuctionList(context.active)}

Ending soon:
${formatAuctionList(context.endingSoon)}

Electronics under ₹5000:
${formatAuctionList(context.electronicsUnder5000)}

Categories: ${context.categories.join(', ')}

Rules:
- Be concise, friendly, and use ₹ for prices.
- If asked about auctions not in the data, suggest browsing /auctions or filtering by category.
- Do not invent auction titles or prices not listed above.`;
}

module.exports = { buildAuctionContext, buildSystemPrompt, CATEGORIES };
