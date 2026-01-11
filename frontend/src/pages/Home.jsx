import React from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaHandPaper, FaGraduationCap, FaUsers, FaGlobe, FaHeart, FaUniversalAccess, FaLightbulb, FaShieldAlt } from 'react-icons/fa';
import './Home.css';

function Home() {

  return (
    <div className="home-container">
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">
          Welcome to ISL Translation System
        </h1>
        <p className="hero-subtitle">
          Bridging communication gaps with AI-powered Indian Sign Language translation
        </p>
        <div className="hero-features">
          <div className="hero-feature">
            <FaChartLine />
            <span>Real-time Translation</span>
          </div>
          <div className="hero-feature">
            <FaHandPaper />
            <span>Bidirectional Support</span>
          </div>
          <div className="hero-feature">
            <FaGraduationCap />
            <span>Interactive Learning</span>
          </div>
        </div>
      </motion.div>

      {/* Sign Language Detection in Society Section */}
      <motion.div
        className="society-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="section-header">
          <h2>🤟 Sign Language Detection in Our Society</h2>
          <p className="section-subtitle">
            Understanding the impact of AI-powered sign language recognition on communities worldwide
          </p>
        </div>

        <div className="society-grid">
          <motion.div 
            className="society-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="card-icon">
              <FaUsers />
            </div>
            <h3>Community Impact</h3>
            <p>
              <strong>2.7 million</strong> deaf individuals in India benefit from improved communication access. 
              Our technology helps bridge the gap between hearing and deaf communities, 
              fostering inclusive communication in schools, workplaces, and public spaces.
            </p>
          </motion.div>

          <motion.div 
            className="society-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="card-icon">
              <FaGlobe />
            </div>
            <h3>Global Reach</h3>
            <p>
              Sign language recognition technology is transforming communication worldwide. 
              From <strong>educational institutions</strong> to <strong>healthcare facilities</strong>, 
              AI-powered sign language detection is making services more accessible to deaf and hard-of-hearing individuals.
            </p>
          </motion.div>

          <motion.div 
            className="society-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="card-icon">
              <FaUniversalAccess />
            </div>
            <h3>Accessibility Revolution</h3>
            <p>
              Real-time sign language detection enables <strong>instant communication</strong> in emergency situations, 
              public transportation, and customer service. This technology empowers deaf individuals 
              to participate fully in society without communication barriers.
            </p>
          </motion.div>

          <motion.div 
            className="society-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="card-icon">
              <FaHeart />
            </div>
            <h3>Social Inclusion</h3>
            <p>
              By making sign language recognition accessible, we're creating a more <strong>inclusive society</strong> 
              where everyone can communicate effectively. This technology helps reduce social isolation 
              and promotes equal opportunities for all community members.
            </p>
          </motion.div>

          <motion.div 
            className="society-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="card-icon">
              <FaLightbulb />
            </div>
            <h3>Educational Benefits</h3>
            <p>
              Schools and universities are integrating sign language detection to support deaf students. 
              This technology enables <strong>real-time learning</strong>, making education more accessible 
              and helping hearing students learn sign language for better communication.
            </p>
          </motion.div>

          <motion.div 
            className="society-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="card-icon">
              <FaShieldAlt />
            </div>
            <h3>Privacy & Security</h3>
            <p>
              Our system processes sign language gestures locally, ensuring <strong>user privacy</strong> 
              and data security. No personal communication data is stored or transmitted, 
              making it safe for sensitive conversations and professional use.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="impact-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h3>📊 Impact Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">2.7M+</div>
              <div className="stat-label">Deaf Individuals in India</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">70M+</div>
              <div className="stat-label">Deaf People Worldwide</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">300+</div>
              <div className="stat-label">Sign Languages Globally</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Communication Improvement</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="call-to-action"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <h3>🌟 Join the Movement</h3>
          <p>
            Be part of creating a more inclusive society where communication barriers are eliminated. 
            Our AI-powered sign language detection technology is making a real difference in people's lives, 
            one gesture at a time.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;
