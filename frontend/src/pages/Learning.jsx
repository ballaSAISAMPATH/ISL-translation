import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaGraduationCap, FaCommentDots, FaImages, FaArrowRight, FaLightbulb, FaCheckCircle } from 'react-icons/fa';
import './Learning.css';

function Learning() {
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('completedLessons');
    return saved ? JSON.parse(saved) : [];
  });

  const tutorialModules = [
    {
      id: 'hello',
      title: 'HELLO',
      explanation: 'Learn how to greet someone in Indian Sign Language. This video demonstrates the proper way to sign "HELLO" in ISL, including hand position and movement.',
      videoId: '6_j8oJ1Qn7I'
    },
    {
      id: 'yes',
      title: 'YES',
      explanation: 'Master the sign for "YES" to express agreement or confirmation. Watch this ISL tutorial to learn the correct hand gesture and movement for saying "YES".',
      videoId: '9M2yV8nM4cY'
    },
    {
      id: 'no',
      title: 'NO',
      explanation: 'Learn how to sign "NO" clearly and respectfully in Indian Sign Language. This video shows you the proper technique for expressing disagreement or denial.',
      videoId: '9GdZ3J3dQ6Q'
    },
    {
      id: 'thank-you',
      title: 'THANK YOU',
      explanation: 'Express gratitude with the sign for "THANK YOU" in ISL. This tutorial demonstrates the polite gesture for showing appreciation and saying thank you.',
      videoId: '1tF3Y1s6R3I'
    },
    {
      id: 'sorry',
      title: 'SORRY',
      explanation: 'Learn to apologize using the sign for "SORRY" in Indian Sign Language. This video teaches you how to express regret and empathy using the correct ISL gesture.',
      videoId: 'HZk0oZtY4pA'
    }
  ];

  useEffect(() => {
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  const handleMarkCompleted = (lessonId) => {
    setCompletedLessons(prev => {
      if (prev.includes(lessonId)) {
        return prev.filter(id => id !== lessonId);
      } else {
        return [...prev, lessonId];
      }
    });
  };
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

        <motion.div
          className="learning-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-icon visual">
            <FaImages />
          </div>
          <h3>Visual Reference</h3>
          <p>
            Browse our visual library of ISL signs with high-quality images, 
            animations, and detailed hand position guides for accurate learning.
          </p>
          <div className="card-features">
            <span className="feature-tag">Visual Guide</span>
            <span className="feature-tag">High Quality</span>
            <span className="feature-tag">Detailed</span>
          </div>
          <Link to="/visual-reference" className="card-button">
            Browse Signs <FaArrowRight />
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="tutorial-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="tutorial-section-header">
          <h2>📚 Beginner Tutorials</h2>
          <p>Start your ISL journey with these essential basic signs</p>
        </div>

        <div className="tutorial-progress-bar">
          <div className="progress-header">
            <span className="progress-label">Your Progress</span>
            <span className="progress-percentage">
              {Math.round((completedLessons.length / tutorialModules.length) * 100)}%
            </span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-fill-bar" 
              style={{ width: `${(completedLessons.length / tutorialModules.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="tutorial-modules">
          {tutorialModules.map((module, index) => (
            <motion.div
              key={module.id}
              className={`tutorial-module-card ${completedLessons.includes(module.id) ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="tutorial-module-header">
                <h3>{module.title}</h3>
                {completedLessons.includes(module.id) && (
                  <span className="completed-badge">
                    <FaCheckCircle /> Completed
                  </span>
                )}
              </div>

              <p className="tutorial-explanation">{module.explanation}</p>

              <div className="tutorial-video-container">
                <iframe
                  src={`https://www.youtube.com/embed/${module.videoId}`}
                  title={`${module.title} Tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="tutorial-video"
                ></iframe>
              </div>

              <button
                className={`tutorial-complete-btn ${completedLessons.includes(module.id) ? 'completed' : ''}`}
                onClick={() => handleMarkCompleted(module.id)}
              >
                {completedLessons.includes(module.id) ? (
                  <>
                    <FaCheckCircle /> Mark as Incomplete
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Mark as Completed
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
