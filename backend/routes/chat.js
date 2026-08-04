const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const chatService = require('../services/ai/chatService');

const router = express.Router();

// POST /api/chat — send a message to the AI assistant
router.post('/', auth, [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await chatService.sendMessage(req.user._id, req.body.message);

    res.json({
      success: true,
      reply: result.reply,
      provider: result.provider,
      messages: result.messages
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message || 'Failed to process chat message' });
  }
});

// GET /api/chat/history — load chat history for the logged-in user
router.get('/history', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const messages = await chatService.getHistory(req.user._id, limit);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load chat history' });
  }
});

// DELETE /api/chat/history — clear chat history
router.delete('/history', auth, async (req, res) => {
  try {
    await chatService.clearHistory(req.user._id);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear chat history' });
  }
});

module.exports = router;
