const mongoose = require('mongoose');

const islPhraseSchema = new mongoose.Schema({
  phrase: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['greeting', 'daily', 'question', 'emotion', 'emergency', 'polite'],
    default: 'daily'
  },
  signs: [{
    word: String,
    imageUrl: String,
    description: String
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  explanation: {
    type: String
  },
  usage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster searches
islPhraseSchema.index({ phrase: 1 });
islPhraseSchema.index({ category: 1 });

module.exports = mongoose.model('ISLPhrase', islPhraseSchema);



