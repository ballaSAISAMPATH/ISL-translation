const express = require('express');
const router = express.Router();
const axios = require('axios');
const Translation = require('../models/Translation.model');
const jwt = require('jsonwebtoken');

/**
 * Get translation from sign.mt/Nagish service
 * Note: sign.mt has been acquired by Nagish (https://sign.mt/)
 * This function attempts to use their translation service if available
 */
async function getSignMTTranslation(text) {
  try {
    // Option 1: Try Nagish API if available
    // Note: Replace with actual API endpoint when available
    const nagishAPI = process.env.NAGISH_API_URL || 'https://api.nagish.com/translate';
    const nagishAPIKey = process.env.NAGISH_API_KEY;
    
    if (nagishAPIKey) {
      const response = await axios.post(
        nagishAPI,
        {
          text: text,
          source_language: 'en',
          target_language: 'sign',
          format: 'sign_language'
        },
        {
          headers: {
            'Authorization': `Bearer ${nagishAPIKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      return {
        provider: 'Nagish',
        translated_text: response.data.translated_text || response.data.text,
        sign_language: response.data.sign_language || 'ASL',
        video_url: response.data.video_url,
        gestures: response.data.gestures
      };
    }
    
    // Option 2: Use sign.mt open-source translate project structure
    // Reference: https://github.com/sign/translate
    // This would require running their service locally or using their API
    return {
      provider: 'sign.mt',
      message: 'sign.mt service integration - configure API endpoint',
      note: 'sign.mt has been acquired by Nagish. Please configure NAGISH_API_URL and NAGISH_API_KEY environment variables. See https://sign.mt/ for more information.'
    };
    
  } catch (error) {
    console.error('sign.mt/Nagish translation error:', error.message);
    throw error;
  }
}

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

// ISL to Text translation (receive gesture data from ML model)
router.post('/isl-to-text', authenticateToken, async (req, res) => {
  try {
    const { gestures, sessionId } = req.body;

    // Combine gestures into text
    const output = gestures.map(g => g.gesture).join('');
    const avgConfidence = gestures.reduce((sum, g) => sum + g.confidence, 0) / gestures.length;

    // Save translation to database
    const translation = new Translation({
      userId: req.userId,
      type: 'isl-to-text',
      input: JSON.stringify(gestures),
      output: output,
      confidence: avgConfidence,
      gestures: gestures,
      sessionId: sessionId
    });

    await translation.save();

    res.json({
      success: true,
      text: output,
      confidence: avgConfidence,
      translationId: translation._id
    });
  } catch (error) {
    console.error('ISL to text translation error:', error);
    res.status(500).json({ error: 'Translation failed', message: error.message });
  }
});

// Text to ISL translation (return ISL gesture data with AI explanation)
router.post('/text-to-isl', authenticateToken, async (req, res) => {
  try {
    const { text, useSignMT } = req.body;
    
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        message: 'Text is required and must be a non-empty string' 
      });
    }
    
    const ISLGesture = require('../models/ISLGesture.model');
    const ISLPhrase = require('../models/ISLPhrase.model');
    const { processTextToISL } = require('../utils/textProcessor');
    
    // Optional: Integrate with sign.mt/Nagish service
    let signMTTranslation = null;
    if (useSignMT) {
      try {
        signMTTranslation = await getSignMTTranslation(text);
      } catch (err) {
        console.log('sign.mt translation not available, using local ISL:', err.message);
      }
    }

    // Process text using advanced text processing
    const result = await processTextToISL(text, ISLGesture, ISLPhrase);

    // Save translation
    const translation = new Translation({
      userId: req.userId,
      type: 'text-to-isl',
      input: text,
      output: JSON.stringify(result.gestures),
      confidence: result.type === 'phrase' ? 1.0 : 0.9
    });

    await translation.save();

    // Return response based on result type
    if (result.type === 'phrase') {
      return res.json({
        success: true,
        isPhrase: true,
        phrase: result.gestures[0]?.word || text.toUpperCase(),
        gestures: result.gestures,
        explanation: result.explanation,
        usage: result.usage,
        category: result.category,
        translationId: translation._id,
        signMTTranslation: signMTTranslation
      });
    }

    // Regular text translation
    res.json({
      success: true,
      isPhrase: false,
      gestures: result.gestures,
      explanation: result.explanation,
      wordCount: result.wordCount,
      wordInfo: result.wordInfo,
      translationId: translation._id,
      signMTTranslation: signMTTranslation,
      processingInfo: {
        source: result.source,
        dictionaryMatches: result.wordInfo?.filter(w => w.source === 'dictionary').length || 0,
        spelledWords: result.wordInfo?.filter(w => w.source === 'spelling').length || 0
      }
    });
  } catch (error) {
    console.error('Text to ISL translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Text to Sign Sequence endpoint
// Returns sequence format with label and imageUrl using local text processing
router.post('/text-to-sign-sequence', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Text is required',
        message: 'Please provide text to translate'
      });
    }

    // Use local ISL database with proper text processing
    const ISLGesture = require('../models/ISLGesture.model');
    const ISLPhrase = require('../models/ISLPhrase.model');
    const { processTextToISL } = require('../utils/textProcessor');
    
    // Process text using advanced text processing
    const result = await processTextToISL(text, ISLGesture, ISLPhrase);
    
    // Convert gestures to sequence format
    const sequence = [];
    for (const gesture of result.gestures) {
      if (gesture.type === 'space') {
        sequence.push({
          label: 'SPACE',
          imageUrl: null
        });
      } else if (gesture.type === 'punctuation') {
        // Skip punctuation markers in sequence
        continue;
      } else if (gesture.type !== 'word-start') {
        sequence.push({
          label: gesture.letter,
          imageUrl: gesture.imageUrl || null
        });
      }
    }

    // Save translation
    const translation = new Translation({
      userId: req.userId,
      type: 'text-to-sign-sequence',
      input: text,
      output: JSON.stringify(sequence),
      confidence: 0.9
    });

    await translation.save();

    return res.json({
      success: true,
      sequence: sequence,
      translationId: translation._id,
      source: 'local',
      message: 'Using local ISL database with text processing'
    });
  } catch (error) {
    console.error('Text to sign sequence error:', error);
    res.status(500).json({ 
      error: 'Translation failed', 
      message: error.message || 'Failed to generate sign sequence'
    });
  }
});

// Process single frame for real-time detection
router.post('/detect-gesture', async (req, res) => {
  try {
    const { imageData } = req.body;

    // Forward to ML model service
    const mlResponse = await axios.post(
      `${process.env.ML_MODEL_URL || 'http://localhost:5001'}/detect_gesture`,
      { imageData: imageData },
      { timeout: 5000 }
    );

    // Return the response from ML service
    res.json({
      hand_detected: mlResponse.data.hand_detected,
      gesture: mlResponse.data.gesture,
      gesture_full: mlResponse.data.gesture_full,
      confidence: mlResponse.data.confidence,
      message: mlResponse.data.message
    });
  } catch (error) {
    console.error('Gesture detection error:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'ML service unavailable',
        message: 'The ML detection service is not running. Please start it on port 5001.',
        hand_detected: false,
        gesture: null,
        confidence: 0
      });
    }
    
    res.status(500).json({ 
      error: 'Detection failed', 
      message: error.message,
      hand_detected: false,
      gesture: null,
      confidence: 0
    });
  }
});

module.exports = router;

