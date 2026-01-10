const express = require('express');
const router = express.Router();
const ISLPhrase = require('../models/ISLPhrase.model');

// Get all phrases
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const phrases = await ISLPhrase.find(query).sort({ phrase: 1 });

    res.json({
      success: true,
      phrases,
      count: phrases.length
    });
  } catch (error) {
    console.error('Phrases fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch phrases', message: error.message });
  }
});

// Get single phrase
router.get('/:id', async (req, res) => {
  try {
    const phrase = await ISLPhrase.findById(req.params.id);

    if (!phrase) {
      return res.status(404).json({ error: 'Phrase not found' });
    }

    res.json({ success: true, phrase });
  } catch (error) {
    console.error('Phrase fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch phrase', message: error.message });
  }
});

// Search phrases
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const phrases = await ISLPhrase.find({
      phrase: { $regex: searchQuery, $options: 'i' }
    }).limit(10);

    res.json({
      success: true,
      phrases,
      count: phrases.length
    });
  } catch (error) {
    console.error('Phrase search error:', error);
    res.status(500).json({ error: 'Failed to search phrases', message: error.message });
  }
});

module.exports = router;



