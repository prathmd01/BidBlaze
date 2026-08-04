const ChatSession = require('../../models/ChatSession');
const { buildAuctionContext, buildSystemPrompt } = require('./auctionContext');
const { generateReply } = require('./llmProvider');

async function getOrCreateSession(userId) {
  let session = await ChatSession.findOne({ user_id: userId });
  if (!session) {
    session = await ChatSession.create({ user_id: userId, messages: [] });
  }
  return session;
}

async function sendMessage(userId, message) {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty');
  }
  if (trimmed.length > 1000) {
    throw new Error('Message too long (max 1000 characters)');
  }

  const [session, context] = await Promise.all([
    getOrCreateSession(userId),
    buildAuctionContext()
  ]);

  const systemPrompt = buildSystemPrompt(context);
  const { reply, provider } = await generateReply(
    trimmed,
    session.messages,
    context,
    systemPrompt
  );

  session.messages.push({ role: 'user', content: trimmed });
  session.messages.push({ role: 'assistant', content: reply });

  // Cap history at 100 messages
  if (session.messages.length > 100) {
    session.messages = session.messages.slice(-100);
  }

  await session.save();

  return {
    reply,
    provider,
    messages: session.messages.slice(-20)
  };
}

async function getHistory(userId, limit = 50) {
  const session = await ChatSession.findOne({ user_id: userId });
  if (!session) return [];
  return session.messages.slice(-limit);
}

async function clearHistory(userId) {
  await ChatSession.findOneAndUpdate(
    { user_id: userId },
    { $set: { messages: [] } },
    { upsert: true }
  );
}

module.exports = { sendMessage, getHistory, clearHistory };
