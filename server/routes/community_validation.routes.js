const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Community Validation Models
const CommunityValidation = require('../models/CommunityValidation.model');
const ISLExpert = require('../models/ISLExpert.model');
const GestureFeedback = require('../models/GestureFeedback.model');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Submit gesture for community validation
router.post('/submit-gesture', authenticateToken, async (req, res) => {
  try {
    const { 
      gesture, 
      category, 
      imageData, 
      videoData, 
      description, 
      difficulty,
      region,
      context
    } = req.body;

    // Create community validation entry
    const validation = new CommunityValidation({
      submitterId: req.userId,
      gesture: gesture,
      category: category,
      imageData: imageData,
      videoData: videoData,
      description: description,
      difficulty: difficulty,
      region: region,
      context: context,
      status: 'pending',
      validations: [],
      expertReviews: [],
      communityScore: 0,
      submissionDate: new Date()
    });

    await validation.save();

    res.json({
      success: true,
      message: 'Gesture submitted for community validation',
      validationId: validation._id
    });
  } catch (error) {
    console.error('Error submitting gesture:', error);
    res.status(500).json({ error: 'Failed to submit gesture', message: error.message });
  }
});

// Validate a gesture (community member)
router.post('/validate-gesture', authenticateToken, async (req, res) => {
  try {
    const { 
      validationId, 
      isValid, 
      accuracy, 
      comments, 
      suggestedImprovements,
      culturalContext
    } = req.body;

    // Find the validation entry
    const validation = await CommunityValidation.findById(validationId);
    if (!validation) {
      return res.status(404).json({ error: 'Validation entry not found' });
    }

    // Add validation from community member
    const communityValidation = {
      validatorId: req.userId,
      isValid: isValid,
      accuracy: accuracy, // 1-5 scale
      comments: comments,
      suggestedImprovements: suggestedImprovements,
      culturalContext: culturalContext,
      validationDate: new Date()
    };

    validation.validations.push(communityValidation);
    
    // Update community score
    const validValidations = validation.validations.filter(v => v.isValid);
    validation.communityScore = validValidations.length / validation.validations.length;
    
    // Check if enough validations received
    if (validation.validations.length >= 5) {
      if (validation.communityScore >= 0.7) {
        validation.status = 'community_approved';
      } else {
        validation.status = 'community_rejected';
      }
    }

    await validation.save();

    res.json({
      success: true,
      message: 'Validation submitted successfully',
      communityScore: validation.communityScore,
      status: validation.status
    });
  } catch (error) {
    console.error('Error validating gesture:', error);
    res.status(500).json({ error: 'Failed to validate gesture', message: error.message });
  }
});

// Expert review of gesture
router.post('/expert-review', authenticateToken, async (req, res) => {
  try {
    const { 
      validationId, 
      expertRating, 
      technicalAccuracy, 
      culturalAuthenticity,
      educationalValue,
      expertComments,
      recommendations
    } = req.body;

    // Check if user is an ISL expert
    const expert = await ISLExpert.findOne({ userId: req.userId });
    if (!expert) {
      return res.status(403).json({ error: 'User is not authorized as ISL expert' });
    }

    const validation = await CommunityValidation.findById(validationId);
    if (!validation) {
      return res.status(404).json({ error: 'Validation entry not found' });
    }

    // Add expert review
    const expertReview = {
      expertId: req.userId,
      expertName: expert.name,
      expertCredentials: expert.credentials,
      expertRating: expertRating, // 1-5 scale
      technicalAccuracy: technicalAccuracy,
      culturalAuthenticity: culturalAuthenticity,
      educationalValue: educationalValue,
      expertComments: expertComments,
      recommendations: recommendations,
      reviewDate: new Date()
    };

    validation.expertReviews.push(expertReview);
    
    // Update status based on expert review
    const avgExpertRating = validation.expertReviews.reduce((sum, review) => sum + review.expertRating, 0) / validation.expertReviews.length;
    
    if (avgExpertRating >= 4.0) {
      validation.status = 'expert_approved';
    } else if (avgExpertRating <= 2.0) {
      validation.status = 'expert_rejected';
    } else {
      validation.status = 'expert_reviewed';
    }

    await validation.save();

    res.json({
      success: true,
      message: 'Expert review submitted successfully',
      averageExpertRating: avgExpertRating,
      status: validation.status
    });
  } catch (error) {
    console.error('Error submitting expert review:', error);
    res.status(500).json({ error: 'Failed to submit expert review', message: error.message });
  }
});

// Get gestures pending validation
router.get('/pending-validations', authenticateToken, async (req, res) => {
  try {
    const { category, region, limit = 20 } = req.query;
    
    const query = { status: 'pending' };
    if (category) query.category = category;
    if (region) query.region = region;

    const validations = await CommunityValidation.find(query)
      .populate('submitterId', 'name email')
      .sort({ submissionDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      validations: validations
    });
  } catch (error) {
    console.error('Error fetching pending validations:', error);
    res.status(500).json({ error: 'Failed to fetch pending validations', message: error.message });
  }
});

// Get validated gestures for training
router.get('/validated-gestures', async (req, res) => {
  try {
    const { category, minScore = 0.7 } = req.query;
    
    const query = { 
      status: { $in: ['community_approved', 'expert_approved'] },
      communityScore: { $gte: parseFloat(minScore) }
    };
    if (category) query.category = category;

    const validatedGestures = await CommunityValidation.find(query)
      .populate('submitterId', 'name region')
      .populate('expertReviews.expertId', 'name credentials')
      .sort({ communityScore: -1 });

    res.json({
      success: true,
      validatedGestures: validatedGestures,
      totalCount: validatedGestures.length
    });
  } catch (error) {
    console.error('Error fetching validated gestures:', error);
    res.status(500).json({ error: 'Failed to fetch validated gestures', message: error.message });
  }
});

// Submit feedback on gesture recognition
router.post('/gesture-feedback', authenticateToken, async (req, res) => {
  try {
    const { 
      gesture, 
      predictedGesture, 
      confidence, 
      accuracy, 
      userCorrection,
      context,
      lighting,
      background,
      handPosition
    } = req.body;

    const feedback = new GestureFeedback({
      userId: req.userId,
      gesture: gesture,
      predictedGesture: predictedGesture,
      confidence: confidence,
      accuracy: accuracy, // 1-5 scale
      userCorrection: userCorrection,
      context: context,
      lighting: lighting,
      background: background,
      handPosition: handPosition,
      feedbackDate: new Date()
    });

    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedback._id
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback', message: error.message });
  }
});

// Get community statistics
router.get('/community-stats', async (req, res) => {
  try {
    const totalValidations = await CommunityValidation.countDocuments();
    const approvedGestures = await CommunityValidation.countDocuments({ 
      status: { $in: ['community_approved', 'expert_approved'] } 
    });
    const pendingValidations = await CommunityValidation.countDocuments({ status: 'pending' });
    
    const totalFeedback = await GestureFeedback.countDocuments();
    const avgAccuracy = await GestureFeedback.aggregate([
      { $group: { _id: null, avgAccuracy: { $avg: '$accuracy' } } }
    ]);

    const expertCount = await ISLExpert.countDocuments();

    res.json({
      success: true,
      stats: {
        totalValidations,
        approvedGestures,
        pendingValidations,
        totalFeedback,
        averageAccuracy: avgAccuracy[0]?.avgAccuracy || 0,
        expertCount,
        approvalRate: totalValidations > 0 ? (approvedGestures / totalValidations) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({ error: 'Failed to fetch community stats', message: error.message });
  }
});

// Register as ISL expert
router.post('/register-expert', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      credentials, 
      experience, 
      specializations,
      certifications,
      organization
    } = req.body;

    // Check if already registered
    const existingExpert = await ISLExpert.findOne({ userId: req.userId });
    if (existingExpert) {
      return res.status(400).json({ error: 'User is already registered as an expert' });
    }

    const expert = new ISLExpert({
      userId: req.userId,
      name: name,
      credentials: credentials,
      experience: experience,
      specializations: specializations,
      certifications: certifications,
      organization: organization,
      registrationDate: new Date(),
      status: 'pending_verification'
    });

    await expert.save();

    res.json({
      success: true,
      message: 'Expert registration submitted for verification',
      expertId: expert._id
    });
  } catch (error) {
    console.error('Error registering expert:', error);
    res.status(500).json({ error: 'Failed to register as expert', message: error.message });
  }
});

module.exports = router;
