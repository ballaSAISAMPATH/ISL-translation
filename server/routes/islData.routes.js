const express = require('express');
const router = express.Router();
const ISLGesture = require('../models/ISLGesture.model');

// Get all ISL gestures
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};

    const gestures = await ISLGesture.find(query).sort({ letter: 1 });

    res.json({
      success: true,
      gestures,
      count: gestures.length
    });
  } catch (error) {
    console.error('Gestures fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch gestures', message: error.message });
  }
});

// Get single gesture by letter
router.get('/:letter', async (req, res) => {
  try {
    const gesture = await ISLGesture.findOne({ 
      letter: req.params.letter.toUpperCase() 
    });

    if (!gesture) {
      return res.status(404).json({ error: 'Gesture not found' });
    }

    res.json({ success: true, gesture });
  } catch (error) {
    console.error('Gesture fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch gesture', message: error.message });
  }
});

// Add new gesture (admin only - add auth middleware in production)
router.post('/', async (req, res) => {
  try {
    const { letter, word, videoUrl, imageUrl, description, category, difficulty } = req.body;

    const gesture = new ISLGesture({
      letter: letter.toUpperCase(),
      word,
      videoUrl,
      imageUrl,
      description,
      category,
      difficulty
    });

    await gesture.save();

    res.status(201).json({
      success: true,
      message: 'Gesture added successfully',
      gesture
    });
  } catch (error) {
    console.error('Gesture creation error:', error);
    res.status(500).json({ error: 'Failed to add gesture', message: error.message });
  }
});

// Update gesture
router.put('/:letter', async (req, res) => {
  try {
    const gesture = await ISLGesture.findOneAndUpdate(
      { letter: req.params.letter.toUpperCase() },
      req.body,
      { new: true }
    );

    if (!gesture) {
      return res.status(404).json({ error: 'Gesture not found' });
    }

    res.json({
      success: true,
      message: 'Gesture updated successfully',
      gesture
    });
  } catch (error) {
    console.error('Gesture update error:', error);
    res.status(500).json({ error: 'Failed to update gesture', message: error.message });
  }
});

module.exports = router;



