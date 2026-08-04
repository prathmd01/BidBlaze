/**
 * Unified LLM provider — uses OpenAI or Google Gemini based on env vars.
 * Falls back to rule-based responses when no API key is configured.
 */

async function callOpenAI(messages, systemPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content }))
      ],
      max_tokens: 600,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function callGemini(messages, systemPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I will help BidBlaze users with auction questions.' }] },
    ...messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { maxOutputTokens: 600, temperature: 0.7 }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

/**
 * Rule-based fallback when no LLM API key is set (dev/demo mode).
 */
function ruleBasedReply(userMessage, context) {
  const msg = userMessage.toLowerCase();

  if (msg.includes('how') && (msg.includes('bid') || msg.includes('bidding'))) {
    return `**How bidding works on BidBlaze:**
1. Sign in and open an auction from the homepage or /auctions.
2. Enter a bid at least **current bid + minimum increment**.
3. You'll get real-time updates when others outbid you.
4. When the timer hits zero, the highest bidder wins and can pay via Razorpay.

Tip: Use Quick Bid buttons on the auction page for common increments!`;
  }

  if (msg.includes('ending soon') || msg.includes('end soon')) {
    const list = context.endingSoon;
    if (!list.length) return 'No active auctions ending soon right now. Check back on the Live Auctions section!';
    return `**Auctions ending soon:**\n${list.map((a) => `• **${a.title}** — ₹${a.current_price}, ends ${new Date(a.end_time).toLocaleString('en-IN')}`).join('\n')}\n\nOpen any listing from the homepage to place a bid.`;
  }

  if (msg.includes('electronics') && (msg.includes('5000') || msg.includes('₹') || msg.includes('under'))) {
    const list = context.electronicsUnder5000;
    if (!list.length) return 'No electronics auctions under ₹5,000 at the moment. Try the "electronics" filter on /auctions.';
    return `**Electronics under ₹5,000:**\n${list.map((a) => `• **${a.title}** — ₹${a.current_price}`).join('\n')}`;
  }

  if (msg.includes('suggest') || msg.includes('best') || msg.includes('recommend')) {
    const list = context.active;
    if (!list.length) return 'No active auctions right now. Visit /auctions to browse scheduled listings.';
    return `**Top auctions on BidBlaze right now:**\n${list.slice(0, 5).map((a, i) => `${i + 1}. **${a.title}** (${a.category}) — ₹${a.current_price}, ${a.total_bids ?? 0} bids`).join('\n')}\n\nSign in to get personalized recommendations on your homepage!`;
  }

  return `I'm BidBlaze Assistant! I can help you with:
• **"Suggest best auctions"** — popular live listings
• **"Show electronics under ₹5000"**
• **"How does bidding work?"**
• **"Which auction is ending soon?"**

Add \`OPENAI_API_KEY\` or \`GEMINI_API_KEY\` in backend \`.env\` for smarter AI replies.`;
}

async function generateReply(userMessage, history, context, systemPrompt) {
  const recent = history.slice(-10).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

  const messages = [...recent, { role: 'user', content: userMessage }];

  const provider = (process.env.AI_PROVIDER || 'auto').toLowerCase();

  try {
    if (provider === 'openai' || (provider === 'auto' && process.env.OPENAI_API_KEY)) {
      const reply = await callOpenAI(messages, systemPrompt);
      if (reply) return { reply, provider: 'openai' };
    }

    if (provider === 'gemini' || (provider === 'auto' && process.env.GEMINI_API_KEY)) {
      const reply = await callGemini(messages, systemPrompt);
      if (reply) return { reply, provider: 'gemini' };
    }
  } catch (error) {
    console.error('LLM provider error:', error.message);
    // Fall through to rule-based on API failure
  }

  return { reply: ruleBasedReply(userMessage, context), provider: 'rule-based' };
}

module.exports = { generateReply, ruleBasedReply };
