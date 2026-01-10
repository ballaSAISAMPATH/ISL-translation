const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['isl-to-text', 'text-to-isl'],
    required: true
  },
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  gestures: [{
    gesture: String,
    confidence: Number,
    timestamp: Date
  }],
  sessionId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
translationSchema.index({ userId: 1, createdAt: -1 });
translationSchema.index({ type: 1 });

module.exports = mongoose.model('Translation', translationSchema);



