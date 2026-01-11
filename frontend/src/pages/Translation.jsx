import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHandPaper, FaKeyboard, FaArrowRight } from 'react-icons/fa';
import './Translation.css';

function Translation() {
  return (
    <div className="translation-container">
      <motion.div
        className="translation-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="translation-title">🤟 Translation Hub</h1>
        <p className="translation-subtitle">
          Choose your translation direction and start communicating in Indian Sign Language
        </p>
      </motion.div>

      <div className="translation-options">
        <motion.div
          className="translation-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-icon isl-to-text">
            <FaHandPaper />
          </div>
          <h3>ISL to Text</h3>
          <p>
            Use your camera to capture sign language gestures and get instant text translation. 
            Perfect for real-time communication and learning.
          </p>
          <div className="card-features">
            <span className="feature-tag">Real-time Detection</span>
            <span className="feature-tag">47 Gestures</span>
            <span className="feature-tag">High Accuracy</span>
          </div>
          <Link to="/isl-to-text" className="card-button">
            Start Translation <FaArrowRight />
          </Link>
        </motion.div>

        <motion.div
          className="translation-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-icon text-to-isl">
            <FaKeyboard />
          </div>
          <h3>Text to ISL</h3>
          <p>
            Type or speak text and see it converted to Indian Sign Language gestures. 
            Great for learning and understanding sign language.
          </p>
          <div className="card-features">
            <span className="feature-tag">Visual Learning</span>
            <span className="feature-tag">Step-by-step</span>
            <span className="feature-tag">Interactive</span>
          </div>
          <Link to="/text-to-isl" className="card-button">
            Start Learning <FaArrowRight />
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="translation-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h3>💡 Translation Tips</h3>
        <div className="tips-grid">
          <div className="tip-item">
            <div className="tip-icon">📸</div>
            <h4>Good Lighting</h4>
            <p>Ensure your hand is well-lit for better gesture detection</p>
          </div>
          <div className="tip-item">
            <div className="tip-icon">🤚</div>
            <h4>Clear Gestures</h4>
            <p>Make distinct, steady gestures for accurate recognition</p>
          </div>
          <div className="tip-item">
            <div className="tip-icon">🎯</div>
            <h4>Centered Frame</h4>
            <p>Keep your hand centered in the camera view</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Translation;
