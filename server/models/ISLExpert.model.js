const mongoose = require('mongoose');

const islExpertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  credentials: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  specializations: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuingOrganization: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true
    }
  }],
  organization: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending_verification', 'verified', 'suspended', 'rejected'],
    default: 'pending_verification'
  },
  verificationDate: {
    type: Date
  },
  verificationNotes: {
    type: String,
    trim: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  expertiseAreas: [{
    type: String,
    enum: ['alphabet', 'numbers', 'common_words', 'phrases', 'emotions', 'regional_variations', 'cultural_context']
  }],
  languages: [{
    type: String,
    trim: true
  }],
  regions: [{
    type: String,
    trim: true
  }],
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  contactPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    phone: {
      type: Boolean,
      default: false
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'platform'],
      default: 'email'
    }
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  profileImage: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },
  reviewHistory: [{
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityValidation',
      required: true
    },
    gesture: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    reviewDate: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      enum: ['certification', 'award', 'publication', 'recognition', 'other']
    }
  }],
  preferences: {
    reviewNotifications: {
      type: Boolean,
      default: true
    },
    emailDigest: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
islExpertSchema.index({ userId: 1 });
islExpertSchema.index({ status: 1 });
islExpertSchema.index({ specializations: 1 });
islExpertSchema.index({ expertiseAreas: 1 });
islExpertSchema.index({ regions: 1 });
islExpertSchema.index({ averageRating: -1 });
islExpertSchema.index({ reviewCount: -1 });

// Virtual for years of experience
islExpertSchema.virtual('yearsOfExperience').get(function() {
  if (!this.experience) return 0;
  const match = this.experience.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
});

// Method to update rating
islExpertSchema.methods.updateRating = function(newRating) {
  this.totalReviews += 1;
  this.averageRating = ((this.averageRating * (this.totalReviews - 1)) + newRating) / this.totalReviews;
  this.lastActiveDate = new Date();
};

// Method to add review
islExpertSchema.methods.addReview = function(reviewId, gesture, rating) {
  this.reviewHistory.push({
    reviewId: reviewId,
    gesture: gesture,
    rating: rating
  });
  this.reviewCount += 1;
  this.updateRating(rating);
};

// Method to check if expert is available
islExpertSchema.methods.isAvailable = function() {
  return this.status === 'verified' && this.availability === 'available';
};

// Method to get expertise summary
islExpertSchema.methods.getExpertiseSummary = function() {
  return {
    name: this.name,
    credentials: this.credentials,
    experience: this.experience,
    specializations: this.specializations,
    expertiseAreas: this.expertiseAreas,
    averageRating: this.averageRating,
    totalReviews: this.totalReviews,
    isAvailable: this.isAvailable(),
    status: this.status
  };
};

// Method to validate expert credentials
islExpertSchema.methods.validateCredentials = function() {
  const requiredFields = ['name', 'credentials', 'experience'];
  const missingFields = requiredFields.filter(field => !this[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields: missingFields
    };
  }
  
  return {
    isValid: true,
    missingFields: []
  };
};

// Pre-save middleware to update last active date
islExpertSchema.pre('save', function(next) {
  if (this.isModified('reviewCount') || this.isModified('averageRating')) {
    this.lastActiveDate = new Date();
  }
  next();
});

module.exports = mongoose.model('ISLExpert', islExpertSchema);
