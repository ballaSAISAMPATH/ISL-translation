import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHandPaper } from 'react-icons/fa';
import './VisualReference.css';

function VisualReference() {
  const [filter, setFilter] = useState('all');

  const alphabetGestures = [
    { letter: 'A', name: 'A - Fist with Thumb', emoji: '✊', fingers: 'Closed fist', thumb: 'Thumb on side', description: 'Make a fist and place thumb on the side' },
    { letter: 'B', name: 'B - Flat Hand', emoji: '✋', fingers: 'All fingers together', thumb: 'Beside palm', description: 'Flat hand with all fingers straight together' },
    { letter: 'C', name: 'C - Curved Hand', emoji: '👌', fingers: 'Curved like C', thumb: 'Curves with fingers', description: 'Curve hand to form letter C shape' },
    { letter: 'D', name: 'D - Index Up', emoji: '☝️', fingers: 'Index finger up', thumb: 'Touches others', description: 'Point index finger up, thumb touches other fingers' },
    { letter: 'E', name: 'E - Bent Fingers', emoji: '✊', fingers: 'All bent inward', thumb: 'Across fingers', description: 'Curl all fingers, thumb across them' },
    { letter: 'F', name: 'F - OK + Three', emoji: '👌', fingers: 'Three up', thumb: 'Touches index', description: 'OK sign with 3 fingers extended up' },
    { letter: 'G', name: 'G - Side Point', emoji: '👈', fingers: 'Index & thumb', thumb: 'Parallel to index', description: 'Index finger and thumb parallel, point sideways' },
    { letter: 'H', name: 'H - Two Horizontal', emoji: '✌️', fingers: 'Index & middle', thumb: 'Down', description: 'Two fingers together, horizontal' },
    { letter: 'I', name: 'I - Pinky Up', emoji: '🤙', fingers: 'Pinky only', thumb: 'Fist', description: 'Fist with pinky finger extended upward' },
    { letter: 'J', name: 'J - Draw J', emoji: '🤙', fingers: 'Pinky draws', thumb: 'Fist', description: 'Use pinky to draw letter J in air' },
    { letter: 'K', name: 'K - Peace + Thumb', emoji: '✌️', fingers: 'Index & middle', thumb: 'Between them', description: 'Peace sign with thumb poking through' },
    { letter: 'L', name: 'L - L Shape', emoji: '👍', fingers: 'Index up', thumb: 'Out to side', description: 'Form letter L with index finger and thumb' },
    { letter: 'M', name: 'M - Three Over', emoji: '✊', fingers: '3 over thumb', thumb: 'Under 3 fingers', description: 'Three fingers draped over thumb' },
    { letter: 'N', name: 'N - Two Over', emoji: '✊', fingers: '2 over thumb', thumb: 'Under 2 fingers', description: 'Two fingers draped over thumb' },
    { letter: 'O', name: 'O - Circle', emoji: '👌', fingers: 'Touch thumb', thumb: 'Touches fingers', description: 'All fingertips touch thumb forming O' },
    { letter: 'P', name: 'P - K Downward', emoji: '👇', fingers: 'Like K', thumb: 'Between, down', description: 'K sign pointing downward' },
    { letter: 'Q', name: 'Q - G Downward', emoji: '👇', fingers: 'Like G', thumb: 'Parallel, down', description: 'G sign pointing downward' },
    { letter: 'R', name: 'R - Crossed Fingers', emoji: '🤞', fingers: 'Index & middle crossed', thumb: 'Down', description: 'Cross index and middle fingers' },
    { letter: 'S', name: 'S - Fist Thumb Front', emoji: '✊', fingers: 'Closed fist', thumb: 'Across front', description: 'Fist with thumb across fingers' },
    { letter: 'T', name: 'T - Thumb Through', emoji: '✊', fingers: 'Closed', thumb: 'Pokes between', description: 'Thumb between index and middle' },
    { letter: 'U', name: 'U - Two Together', emoji: '✌️', fingers: 'Index & middle', thumb: 'Down', description: 'Two fingers together pointing up' },
    { letter: 'V', name: 'V - Victory', emoji: '✌️', fingers: 'Index & middle apart', thumb: 'Down', description: 'Victory/Peace sign with fingers apart' },
    { letter: 'W', name: 'W - Three Up', emoji: '🖖', fingers: 'Three spread', thumb: 'Down', description: 'Three fingers up and spread apart' },
    { letter: 'X', name: 'X - Hooked Index', emoji: '☝️', fingers: 'Index bent', thumb: 'Down', description: 'Index finger bent at middle joint' },
    { letter: 'Y', name: 'Y - Hang Loose', emoji: '🤙', fingers: 'Pinky & thumb', thumb: 'Extended out', description: 'Thumb and pinky extended, others closed' },
    { letter: 'Z', name: 'Z - Draw Z', emoji: '☝️', fingers: 'Index draws', thumb: 'Down', description: 'Use index finger to draw Z in air' }
  ];

  const numberGestures = [
    { letter: '0', name: '0 - Closed Fist', emoji: '✊', fingers: 'All closed', thumb: 'In fist', description: 'Completely closed fist representing zero/nothing' },
    { letter: '1', name: '1 - One Finger', emoji: '☝️', fingers: 'Index only', thumb: 'Down in fist', description: 'Only index finger pointing straight up' },
    { letter: '2', name: '2 - Two Fingers', emoji: '✌️', fingers: 'Index & middle', thumb: 'Down in fist', description: 'Index and middle fingers up (peace sign)' },
    { letter: '3', name: '3 - Three Fingers', emoji: '🤟', fingers: 'Thumb, index, middle', thumb: 'Extended with fingers', description: 'Thumb, index, and middle fingers up' },
    { letter: '4', name: '4 - Four Fingers', emoji: '🖐️', fingers: 'All except thumb', thumb: 'Down/folded', description: 'Four fingers up, thumb folded in' },
    { letter: '5', name: '5 - Open Hand', emoji: '🖐️', fingers: 'All spread open', thumb: 'Open spread', description: 'All five fingers spread wide open' },
    { letter: '6', name: '6 - Three Bent', emoji: '🤙', fingers: '3 bent down', thumb: 'Touches pinky', description: 'Thumb touches pinky, 3 fingers bent' },
    { letter: '7', name: '7 - Two Bent', emoji: '🖖', fingers: '2 bent down', thumb: 'Touches ring', description: 'Thumb touches ring finger' },
    { letter: '8', name: '8 - One Bent', emoji: '🖐️', fingers: '1 bent down', thumb: 'Touches middle', description: 'Thumb touches middle finger' },
    { letter: '9', name: '9 - Circle', emoji: '👌', fingers: 'Most up', thumb: 'Touches index', description: 'Thumb and index form circle, others up' }
  ];

  const allGestures = filter === 'alphabet' ? alphabetGestures : 
                      filter === 'numbers' ? numberGestures : 
                      [...alphabetGestures, ...numberGestures];

  return (
    <div className="visual-reference-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1><FaHandPaper /> Visual ISL Sign Reference</h1>
        <p>See visual representations of all ISL hand gestures</p>
      </motion.div>

      <div className="card">
        <div className="filter-section">
          <button
            className={`filter-btn-visual ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Signs (36)
          </button>
          <button
            className={`filter-btn-visual ${filter === 'alphabet' ? 'active' : ''}`}
            onClick={() => setFilter('alphabet')}
          >
            Alphabet (A-Z)
          </button>
          <button
            className={`filter-btn-visual ${filter === 'numbers' ? 'active' : ''}`}
            onClick={() => setFilter('numbers')}
          >
            Numbers (0-9)
          </button>
        </div>

        <div className="visual-gestures-grid">
          {allGestures.map((gesture, index) => (
            <motion.div
              key={gesture.letter}
              className="visual-gesture-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className="visual-header">
                <h2 className="visual-letter">{gesture.letter}</h2>
                <span className="visual-name">{gesture.name}</span>
              </div>
              
              <div className="visual-emoji-display">
                <span className="large-emoji">{gesture.emoji}</span>
              </div>

              <div className="visual-instructions">
                <div className="instruction-row">
                  <span className="inst-label">✋ Fingers:</span>
                  <span className="inst-value">{gesture.fingers}</span>
                </div>
                <div className="instruction-row">
                  <span className="inst-label">👍 Thumb:</span>
                  <span className="inst-value">{gesture.thumb}</span>
                </div>
                <div className="instruction-description">
                  <p>{gesture.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="card usage-tips">
        <h2>How to Use This Visual Reference</h2>
        <div className="tips-list">
          <div className="tip-item-visual">
            <span className="tip-emoji">👀</span>
            <div>
              <h3>Look at the Emoji</h3>
              <p>Each gesture has a hand emoji showing the general shape. This gives you a quick visual idea.</p>
            </div>
          </div>
          <div className="tip-item-visual">
            <span className="tip-emoji">✋</span>
            <div>
              <h3>Read Finger Position</h3>
              <p>Check which fingers should be up, down, bent, or straight for each sign.</p>
            </div>
          </div>
          <div className="tip-item-visual">
            <span className="tip-emoji">👍</span>
            <div>
              <h3>Check Thumb Position</h3>
              <p>Thumb position is crucial! See where it should be for each gesture.</p>
            </div>
          </div>
          <div className="tip-item-visual">
            <span className="tip-emoji">📖</span>
            <div>
              <h3>Read Description</h3>
              <p>Full description explains exactly how to form the sign correctly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisualReference;

