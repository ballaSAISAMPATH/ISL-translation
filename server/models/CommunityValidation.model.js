const mongoose = require('mongoose');

const communityValidationSchema = new mongoose.Schema({
  submitterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gesture: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['alphabet', 'numbers', 'common_words', 'phrases', 'emotions']
  },
  imageData: {
    type: String, // Base64 encoded image
    required: true
  },
  videoData: {
    type: String, // Base64 encoded video or URL
    required: false
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  context: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'community_approved', 'community_rejected', 'expert_approved', 'expert_rejected', 'expert_reviewed'],
    default: 'pending'
  },
  validations: [{
    validatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isValid: {
      type: Boolean,
      required: true
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comments: {
      type: String,
      trim: true
    },
    suggestedImprovements: {
      type: String,
      trim: true
    },
    culturalContext: {
      type: String,
      trim: true
    },
    validationDate: {
      type: Date,
      default: Date.now
    }
  }],
  expertReviews: [{
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ISLExpert',
      required: true
    },
    expertName: {
      type: String,
      required: true
    },
    expertCredentials: {
      type: String,
      required: true
    },
    expertRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    technicalAccuracy: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    culturalAuthenticity: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    educationalValue: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    expertComments: {
      type: String,
      trim: true
    },
    recommendations: {
      type: String,
      trim: true
    },
    reviewDate: {
      type: Date,
      default: Date.now
    }
  }],
  communityScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
communityValidationSchema.index({ submitterId: 1 });
communityValidationSchema.index({ gesture: 1 });
communityValidationSchema.index({ category: 1 });
communityValidationSchema.index({ status: 1 });
communityValidationSchema.index({ communityScore: -1 });
communityValidationSchema.index({ submissionDate: -1 });

// Virtual for total validations
communityValidationSchema.virtual('totalValidations').get(function() {
  return this.validations.length;
});

// Virtual for total expert reviews
communityValidationSchema.virtual('totalExpertReviews').get(function() {
  return this.expertReviews.length;
});

// Method to calculate average accuracy
communityValidationSchema.methods.getAverageAccuracy = function() {
  if (this.validations.length === 0) return 0;
  const sum = this.validations.reduce((acc, validation) => acc + validation.accuracy, 0);
  return sum / this.validations.length;
};

// Method to calculate average expert rating
communityValidationSchema.methods.getAverageExpertRating = function() {
  if (this.expertReviews.length === 0) return 0;
  const sum = this.expertReviews.reduce((acc, review) => acc + review.expertRating, 0);
  return sum / this.expertReviews.length;
};

// Method to check if gesture is approved
communityValidationSchema.methods.isApproved = function() {
  return this.status === 'community_approved' || this.status === 'expert_approved';
};

// Method to get validation summary
communityValidationSchema.methods.getValidationSummary = function() {
  return {
    totalValidations: this.validations.length,
    totalExpertReviews: this.expertReviews.length,
    communityScore: this.communityScore,
    averageAccuracy: this.getAverageAccuracy(),
    averageExpertRating: this.getAverageExpertRating(),
    isApproved: this.isApproved(),
    status: this.status
  };
};

module.exports = mongoose.model('CommunityValidation', communityValidationSchema);
