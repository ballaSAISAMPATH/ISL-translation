const mongoose = require('mongoose');

const islGestureSchema = new mongoose.Schema({
  letter: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  word: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String
  },
  imageUrl: {
    type: String
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['alphabet', 'number', 'word', 'phrase'],
    default: 'alphabet'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
islGestureSchema.index({ letter: 1 });
islGestureSchema.index({ category: 1 });

module.exports = mongoose.model('ISLGesture', islGestureSchema);



