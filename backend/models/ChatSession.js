const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 4000
  }
}, {
  timestamps: true
});

const chatSessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  messages: {
    type: [messageSchema],
    default: []
  }
}, {
  timestamps: true
});

chatSessionSchema.index({ user_id: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
