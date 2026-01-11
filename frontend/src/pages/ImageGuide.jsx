import React from 'react';
import { motion } from 'framer-motion';
import { FaImage, FaDownload, FaCheck, FaCamera, FaUpload } from 'react-icons/fa';
import './ImageGuide.css';

function ImageGuide() {
  const imageList = [
    { letter: 'A', description: 'Closed fist with thumb on side' },
    { letter: 'B', description: 'Flat hand with fingers together' },
    { letter: 'C', description: 'Curved hand forming C shape' },
    { letter: 'D', description: 'Index finger up, thumb and fingers touching' },
    { letter: 'E', description: 'Fingers curled, thumb across fingers' },
    { letter: 'F', description: 'OK sign with three fingers up' },
    { letter: 'G', description: 'Index finger and thumb parallel' },
    { letter: 'H', description: 'Index and middle finger together horizontally' },
    { letter: 'I', description: 'Pinky finger up, fist closed' },
    { letter: 'J', description: 'Pinky finger draws J' },
    { letter: 'K', description: 'Index and middle finger up, thumb between' },
    { letter: 'L', description: 'L shape with thumb and index' },
    { letter: 'M', description: 'Three fingers over thumb' },
    { letter: 'N', description: 'Two fingers over thumb' },
    { letter: 'O', description: 'Fingers and thumb form O' },
    { letter: 'P', description: 'Index finger down, middle finger out' },
    { letter: 'Q', description: 'Index finger and thumb down' },
    { letter: 'R', description: 'Index and middle crossed' },
    { letter: 'S', description: 'Fist with thumb across fingers' },
    { letter: 'T', description: 'Thumb between index and middle' },
    { letter: 'U', description: 'Index and middle fingers together up' },
    { letter: 'V', description: 'Index and middle fingers apart' },
    { letter: 'W', description: 'Three fingers up and apart' },
    { letter: 'X', description: 'Index finger bent' },
    { letter: 'Y', description: 'Thumb and pinky out' },
    { letter: 'Z', description: 'Index finger draws Z' }
  ];

  const steps = [
    {
      icon: <FaDownload />,
      title: 'Download ISL Images',
      description: 'Search "Indian Sign Language alphabet" online or use ISLRTC resources',
      color: '#667eea'
    },
    {
      icon: <FaCamera />,
      title: 'Or Take Photos',
      description: 'Use your camera to photograph ISL gestures with good lighting',
      color: '#10b981'
    },
    {
      icon: <FaUpload />,
      title: 'Name & Save',
      description: 'Rename files as A.png, B.png, etc. and place in images/isl folder',
      color: '#f59e0b'
    },
    {
      icon: <FaCheck />,
      title: 'Refresh & See',
      description: 'Refresh browser and your images appear automatically in the app!',
      color: '#764ba2'
    }
  ];

  return (
    <div className="image-guide-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1><FaImage /> ISL Image Setup Guide</h1>
        <p>Add visual ISL sign images to enhance learning</p>
      </motion.div>

      <div className="card guide-intro">
        <h2>Make Learning Visual & Interactive!</h2>
        <p>
          Your ISL system is ready to display real hand sign images. Adding images makes learning
          easier, more engaging, and more effective for users. Follow the simple steps below!
        </p>
      </div>

      <div className="steps-section">
        <h2>How to Add ISL Images (4 Easy Steps)</h2>
        <div className="steps-grid-guide">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="step-card-guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ '--step-color': step.color }}
            >
              <div className="step-icon-large" style={{ background: step.color }}>
                {step.icon}
              </div>
              <div className="step-number-badge">Step {index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="card image-specs">
        <h2>Image Specifications</h2>
        <div className="specs-grid">
          <div className="spec-item">
            <h4>Format</h4>
            <p>PNG (transparent) or JPG (white background)</p>
          </div>
          <div className="spec-item">
            <h4>Size</h4>
            <p>500x500 to 800x800 pixels (square)</p>
          </div>
          <div className="spec-item">
            <h4>File Size</h4>
            <p>Under 500KB per image</p>
          </div>
          <div className="spec-item">
            <h4>Quality</h4>
            <p>Clear, well-lit, centered hand gesture</p>
          </div>
        </div>
      </div>

      <div className="card required-images">
        <h2>Required Images (36 Total)</h2>
        <div className="images-checklist">
          <div className="checklist-section">
            <h3>Alphabet (26 images)</h3>
            <div className="letters-grid">
              {imageList.map((item) => (
                <div key={item.letter} className="letter-item-check">
                  <div className="letter-badge">{item.letter}</div>
                  <div className="letter-desc">
                    <strong>{item.letter}.png</strong>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="checklist-section">
            <h3>Numbers (10 images)</h3>
            <div className="numbers-grid">
              {[0,1,2,3,4,5,6,7,8,9].map((num) => (
                <div key={num} className="number-item-check">
                  <div className="number-badge">{num}</div>
                  <span>{num}.png</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card location-info">
        <h2><FaUpload /> Where to Place Images</h2>
        <div className="location-box">
          <code>server/public/images/isl/</code>
        </div>
        <p className="location-path">
          Full path: <code>C:\Users\renuk\OneDrive\Desktop\FINAL\server\public\images\isl\</code>
        </p>
      </div>

      <div className="card quick-links">
        <h2>Quick Resources</h2>
        <div className="resources-list">
          <a href="https://www.islrtc.nic.in/" target="_blank" rel="noopener noreferrer" className="resource-link">
            <FaDownload />
            <div>
              <h4>ISLRTC Official Website</h4>
              <p>Indian Sign Language Research & Training Centre - Official government resource</p>
            </div>
          </a>
          <div className="resource-link-inactive">
            <FaCamera />
            <div>
              <h4>Create Your Own</h4>
              <p>Use a camera and good lighting to photograph ISL gestures</p>
            </div>
          </div>
          <div className="resource-link-inactive">
            <FaImage />
            <div>
              <h4>Google Images</h4>
              <p>Search "Indian Sign Language alphabet chart" with Creative Commons filter</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card benefits-section">
        <h2>Benefits of Adding Images</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <span className="benefit-icon">👀</span>
            <h4>Visual Learning</h4>
            <p>Users can see exactly how to form each sign</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <h4>Faster Understanding</h4>
            <p>Pictures are worth a thousand words</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🎯</span>
            <h4>Better Accuracy</h4>
            <p>Users can mimic the exact hand position</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🌟</span>
            <h4>Professional Look</h4>
            <p>Real images make your app look polished</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageGuide;



