const express = require('express');
const router = express.Router();
const Translation = require('../models/Translation.model');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user's translation history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, limit = 50, skip = 0 } = req.query;

    const query = { userId: req.userId };
    if (type) {
      query.type = type;
    }

    const translations = await Translation.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Translation.countDocuments(query);

    res.json({
      success: true,
      translations,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history', message: error.message });
  }
});

// Get single translation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const translation = await Translation.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!translation) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    res.json({ success: true, translation });
  } catch (error) {
    console.error('Translation fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch translation', message: error.message });
  }
});

// Delete translation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await Translation.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    res.json({ success: true, message: 'Translation deleted' });
  } catch (error) {
    console.error('Translation delete error:', error);
    res.status(500).json({ error: 'Failed to delete translation', message: error.message });
  }
});

// Get statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalTranslations = await Translation.countDocuments({ userId: req.userId });
    const islToText = await Translation.countDocuments({ userId: req.userId, type: 'isl-to-text' });
    const textToIsl = await Translation.countDocuments({ userId: req.userId, type: 'text-to-isl' });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await Translation.countDocuments({
      userId: req.userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        totalTranslations,
        islToText,
        textToIsl,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

module.exports = router;



