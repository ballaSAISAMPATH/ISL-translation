const mongoose = require('mongoose');

const gestureFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gesture: {
    type: String,
    required: true,
    trim: true
  },
  predictedGesture: {
    type: String,
    required: true,
    trim: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  accuracy: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  userCorrection: {
    type: String,
    trim: true
  },
  context: {
    type: String,
    enum: ['learning', 'communication', 'testing', 'demonstration', 'other'],
    default: 'communication'
  },
  lighting: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'very_poor'],
    default: 'good'
  },
  background: {
    type: String,
    enum: ['plain', 'cluttered', 'busy', 'distracting'],
    default: 'plain'
  },
  handPosition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  feedbackDate: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String,
    trim: true
  },
  deviceInfo: {
    camera: {
      type: String,
      trim: true
    },
    resolution: {
      type: String,
      trim: true
    },
    browser: {
      type: String,
      trim: true
    },
    operatingSystem: {
      type: String,
      trim: true
    }
  },
  technicalIssues: [{
    type: String,
    enum: ['camera_not_working', 'poor_lighting', 'background_issues', 'hand_not_visible', 'gesture_unclear', 'system_slow', 'other']
  }],
  suggestions: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isHelpful: {
    type: Boolean,
    default: true
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  additionalComments: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  region: {
    type: String,
    trim: true
  },
  ageGroup: {
    type: String,
    enum: ['18-25', '26-35', '36-45', '46-55', '55+'],
    required: false
  },
  signingExperience: {
    type: String,
    enum: ['native', 'fluent', 'intermediate', 'beginner'],
    required: false
  },
  hearingStatus: {
    type: String,
    enum: ['deaf', 'hard_of_hearing', 'hearing'],
    required: false
  },
  feedbackCategory: {
    type: String,
    enum: ['recognition_accuracy', 'user_interface', 'performance', 'accessibility', 'educational_value', 'cultural_authenticity', 'other'],
    default: 'recognition_accuracy'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'in_review', 'addressed', 'dismissed'],
    default: 'new'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  resolutionDate: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
gestureFeedbackSchema.index({ userId: 1 });
gestureFeedbackSchema.index({ gesture: 1 });
gestureFeedbackSchema.index({ predictedGesture: 1 });
gestureFeedbackSchema.index({ accuracy: -1 });
gestureFeedbackSchema.index({ feedbackDate: -1 });
gestureFeedbackSchema.index({ status: 1 });
gestureFeedbackSchema.index({ feedbackCategory: 1 });
gestureFeedbackSchema.index({ severity: 1 });
gestureFeedbackSchema.index({ region: 1 });

// Virtual for feedback age
gestureFeedbackSchema.virtual('feedbackAge').get(function() {
  return Math.floor((Date.now() - this.feedbackDate) / (1000 * 60 * 60 * 24)); // days
});

// Method to calculate accuracy score
gestureFeedbackSchema.methods.getAccuracyScore = function() {
  // Convert 1-5 scale to percentage
  return (this.accuracy / 5) * 100;
};

// Method to check if feedback is recent
gestureFeedbackSchema.methods.isRecent = function(days = 7) {
  return this.feedbackAge <= days;
};

// Method to get feedback summary
gestureFeedbackSchema.methods.getFeedbackSummary = function() {
  return {
    gesture: this.gesture,
    predictedGesture: this.predictedGesture,
    accuracy: this.accuracy,
    accuracyScore: this.getAccuracyScore(),
    confidence: this.confidence,
    context: this.context,
    feedbackAge: this.feedbackAge,
    isRecent: this.isRecent(),
    status: this.status
  };
};

// Method to mark as resolved
gestureFeedbackSchema.methods.markAsResolved = function(resolvedBy, notes) {
  this.status = 'addressed';
  this.resolutionDate = new Date();
  this.resolvedBy = resolvedBy;
  if (notes) {
    this.adminNotes = notes;
  }
};

// Static method to get feedback statistics
gestureFeedbackSchema.statics.getFeedbackStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalFeedback: { $sum: 1 },
        averageAccuracy: { $avg: '$accuracy' },
        averageConfidence: { $avg: '$confidence' },
        highAccuracyCount: {
          $sum: { $cond: [{ $gte: ['$accuracy', 4] }, 1, 0] }
        },
        lowAccuracyCount: {
          $sum: { $cond: [{ $lte: ['$accuracy', 2] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalFeedback: 0,
    averageAccuracy: 0,
    averageConfidence: 0,
    highAccuracyCount: 0,
    lowAccuracyCount: 0
  };
};

// Static method to get feedback by category
gestureFeedbackSchema.statics.getFeedbackByCategory = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$feedbackCategory',
        count: { $sum: 1 },
        averageAccuracy: { $avg: '$accuracy' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get recent feedback
gestureFeedbackSchema.statics.getRecentFeedback = async function(days = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return await this.find({ feedbackDate: { $gte: cutoffDate } })
    .sort({ feedbackDate: -1 })
    .limit(50);
};

// Pre-save middleware to update timestamps
gestureFeedbackSchema.pre('save', function(next) {
  if (this.isNew) {
    this.feedbackDate = new Date();
  }
  next();
});

module.exports = mongoose.model('GestureFeedback', gestureFeedbackSchema);
