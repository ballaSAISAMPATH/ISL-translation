import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaGraduationCap, FaCommentDots, FaImages, FaArrowRight, FaLightbulb, FaCheckCircle } from 'react-icons/fa';
import './Learning.css';

function Learning() {
  return (
    <div className="learning-container">
      <motion.div
        className="learning-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="learning-title">🎓 Learning Hub</h1>
        <p className="learning-subtitle">
          Master Indian Sign Language with our comprehensive learning resources and interactive tools
        </p>
      </motion.div>

      <div className="learning-options">
        <motion.div
          className="learning-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-icon learn-isl">
            <FaBook />
          </div>
          <h3>Learn ISL</h3>
          <p>
            Explore our comprehensive library of ISL gestures with detailed explanations, 
            examples, and practice exercises for all skill levels.
          </p>
          <div className="card-features">
            <span className="feature-tag">47 Gestures</span>
            <span className="feature-tag">Interactive</span>
            <span className="feature-tag">Progressive</span>
          </div>
          <Link to="/learn" className="card-button">
            Start Learning <FaArrowRight />
          </Link>
        </motion.div>

        <motion.div
          className="learning-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-icon tutorial">
            <FaGraduationCap />
          </div>
          <h3>Tutorials</h3>
          <p>
            Step-by-step video tutorials and guided lessons to help you master 
            Indian Sign Language from beginner to advanced levels.
          </p>
          <div className="card-features">
            <span className="feature-tag">Video Lessons</span>
            <span className="feature-tag">Guided Practice</span>
            <span className="feature-tag">Progress Tracking</span>
          </div>
          <Link to="/tutorial" className="card-button">
            View Tutorials <FaArrowRight />
          </Link>
        </motion.div>

        <motion.div
          className="learning-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-icon phrases">
            <FaCommentDots />
          </div>
          <h3>Common Phrases</h3>
          <p>
            Learn essential ISL phrases for everyday communication including greetings, 
            questions, and common expressions used in daily life.
          </p>
          <div className="card-features">
            <span className="feature-tag">Daily Phrases</span>
            <span className="feature-tag">Contextual</span>
            <span className="feature-tag">Practical</span>
          </div>
          <Link to="/phrases" className="card-button">
            Explore Phrases <FaArrowRight />
          </Link>
        </motion.div>

      </div>

     
      <motion.div
        className="learning-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <h3>💡 Learning Tips</h3>
        <div className="tips-grid">
          <div className="tip-item">
            <div className="tip-icon">🎯</div>
            <h4>Practice Daily</h4>
            <p>Consistent practice is key to mastering sign language</p>
          </div>
          <div className="tip-item">
            <div className="tip-icon">👥</div>
            <h4>Practice with Others</h4>
            <p>Find learning partners to practice conversations</p>
          </div>
          <div className="tip-item">
            <div className="tip-icon">📚</div>
            <h4>Start Simple</h4>
            <p>Begin with basic gestures and gradually advance</p>
          </div>
          <div className="tip-item">
            <div className="tip-icon">🎥</div>
            <h4>Record Yourself</h4>
            <p>Use video to check your gesture accuracy</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Learning;
