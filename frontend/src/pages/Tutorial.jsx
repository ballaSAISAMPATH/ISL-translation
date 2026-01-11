import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlayCircle, FaCheckCircle, FaLightbulb, FaVideo, FaBook } from 'react-icons/fa';
import './Tutorial.css';

function Tutorial() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);

  const lessons = [
    {
      title: "Introduction to ISL",
      description: "Learn about Indian Sign Language and its importance",
      content: [
        "Indian Sign Language (ISL) is the predominant sign language used by the deaf community in India.",
        "ISL has its own grammar and syntax, different from spoken languages.",
        "Over 2.7 million deaf individuals in India use ISL for communication.",
        "Learning ISL promotes inclusivity and breaks communication barriers."
      ],
      tips: [
        "Always maintain eye contact when signing",
        "Facial expressions are crucial for conveying meaning",
        "Practice regularly for better fluency"
      ]
    },
    {
      title: "Hand Shapes and Positions",
      description: "Understanding basic hand formations",
      content: [
        "Hand shape refers to the configuration of fingers and palm.",
        "Position indicates where the hand is placed relative to the body.",
        "Movement describes how the hand transitions during a sign.",
        "Orientation shows which direction the palm faces."
      ],
      tips: [
        "Keep movements clear and deliberate",
        "Don't rush through signs",
        "Ensure proper hand positioning for accuracy"
      ]
    },
    {
      title: "ISL Alphabet (A-Z)",
      description: "Master the finger spelling alphabet",
      content: [
        "The ISL alphabet consists of 26 hand signs representing A-Z.",
        "Each letter has a unique hand shape and position.",
        "Finger spelling is used for names, places, and technical terms.",
        "Practice each letter slowly before combining them."
      ],
      tips: [
        "Start with vowels: A, E, I, O, U",
        "Practice common letter combinations",
        "Use the 'Learn ISL' page to see each letter"
      ]
    },
    {
      title: "Numbers in ISL",
      description: "Learn to sign numbers 0-9 and beyond",
      content: [
        "Numbers 0-9 have specific hand configurations.",
        "Numbers are signed with one hand for 0-9.",
        "Larger numbers use combinations and special techniques.",
        "Numbers are essential for dates, quantities, and measurements."
      ],
      tips: [
        "Practice counting from 1-10 daily",
        "Learn to sign your age and phone number",
        "Numbers are often combined with other signs"
      ]
    },
    {
      title: "Common ISL Phrases",
      description: "Essential phrases for daily communication",
      content: [
        "Hello: Wave hand with open palm",
        "Thank you: Touch chin and move hand forward",
        "Sorry: Circle fist on chest",
        "Help: Place fist on flat palm and raise together"
      ],
      tips: [
        "Learn greetings first",
        "Practice phrases in context",
        "Combine with facial expressions"
      ]
    },
    {
      title: "Using the ISL Translator",
      description: "How to use this application effectively",
      content: [
        "ISL to Text: Use webcam to show signs, system converts to text",
        "Text to ISL: Type text, see corresponding signs",
        "Learn ISL: Browse complete alphabet and numbers library",
        "History: Track your progress and review translations"
      ],
      tips: [
        "Ensure good lighting for webcam",
        "Keep hand in frame and visible",
        "Practice one letter at a time",
        "Review history to track improvement"
      ]
    }
  ];

  const practiceExercises = [
    {
      title: "Exercise 1: Your Name",
      instruction: "Spell your name using ISL alphabet",
      difficulty: "Beginner"
    },
    {
      title: "Exercise 2: Greetings",
      instruction: "Learn to say Hello, Thank you, and Goodbye",
      difficulty: "Beginner"
    },
    {
      title: "Exercise 3: Numbers",
      instruction: "Count from 1 to 10 using ISL numbers",
      difficulty: "Beginner"
    },
    {
      title: "Exercise 4: Common Words",
      instruction: "Practice signing: HELP, SORRY, PLEASE",
      difficulty: "Intermediate"
    },
    {
      title: "Exercise 5: Simple Sentences",
      instruction: "Combine signs to make basic sentences",
      difficulty: "Advanced"
    }
  ];

  const markLessonComplete = () => {
    if (!completedLessons.includes(currentLesson)) {
      setCompletedLessons([...completedLessons, currentLesson]);
    }
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const currentLessonData = lessons[currentLesson];
  const progress = (completedLessons.length / lessons.length) * 100;

  return (
    <div className="tutorial-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1><FaBook /> ISL Learning Tutorial</h1>
        <p>Step-by-step guide to master Indian Sign Language</p>
      </motion.div>

      <div className="progress-section card">
        <div className="progress-header">
          <h3>Your Progress</h3>
          <span className="progress-text">{completedLessons.length}/{lessons.length} Lessons Completed</span>
        </div>
        <div className="progress-bar-container">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="tutorial-layout">
        <div className="lessons-sidebar card">
          <h3>Lessons</h3>
          <div className="lessons-list">
            {lessons.map((lesson, index) => (
              <div
                key={index}
                className={`lesson-item ${index === currentLesson ? 'active' : ''} ${completedLessons.includes(index) ? 'completed' : ''}`}
                onClick={() => setCurrentLesson(index)}
              >
                <div className="lesson-icon">
                  {completedLessons.includes(index) ? (
                    <FaCheckCircle className="check-icon" />
                  ) : (
                    <span className="lesson-number">{index + 1}</span>
                  )}
                </div>
                <div className="lesson-info">
                  <h4>{lesson.title}</h4>
                  <p>{lesson.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lesson-content-area">
          <motion.div
            className="card lesson-card"
            key={currentLesson}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="lesson-header">
              <h2>
                <FaPlayCircle /> Lesson {currentLesson + 1}: {currentLessonData.title}
              </h2>
              <p className="lesson-description">{currentLessonData.description}</p>
            </div>

            <div className="lesson-body">
              <h3>Key Points</h3>
              <ul className="content-list">
                {currentLessonData.content.map((point, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {point}
                  </motion.li>
                ))}
              </ul>

              <div className="tips-section">
                <h3><FaLightbulb /> Pro Tips</h3>
                <div className="tips-grid">
                  {currentLessonData.tips.map((tip, index) => (
                    <div key={index} className="tip-card">
                      <FaLightbulb className="tip-icon" />
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lesson-actions">
              {currentLesson > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentLesson(currentLesson - 1)}
                >
                  ← Previous Lesson
                </button>
              )}
              <button
                className="btn btn-success"
                onClick={markLessonComplete}
              >
                {completedLessons.includes(currentLesson) 
                  ? 'Next Lesson →' 
                  : 'Complete & Continue →'}
              </button>
            </div>
          </motion.div>

          <div className="card practice-section">
            <h3><FaVideo /> Practice Exercises</h3>
            <div className="exercises-grid">
              {practiceExercises.map((exercise, index) => (
                <motion.div
                  key={index}
                  className="exercise-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="exercise-header">
                    <h4>{exercise.title}</h4>
                    <span className={`difficulty-badge difficulty-${exercise.difficulty.toLowerCase()}`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  <p>{exercise.instruction}</p>
                  <button className="btn btn-primary btn-sm">
                    Start Practice
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card resources-section">
        <h2>Additional Resources</h2>
        <div className="resources-grid">
          <div className="resource-card">
            <FaBook />
            <h3>ISL Dictionary</h3>
            <p>Comprehensive dictionary with 1000+ signs</p>
            <button className="btn btn-secondary btn-sm">Browse Dictionary</button>
          </div>
          <div className="resource-card">
            <FaVideo />
            <h3>Video Tutorials</h3>
            <p>Watch detailed video demonstrations</p>
            <button className="btn btn-secondary btn-sm">Watch Videos</button>
          </div>
          <div className="resource-card">
            <FaLightbulb />
            <h3>Practice Tests</h3>
            <p>Test your knowledge with quizzes</p>
            <button className="btn btn-secondary btn-sm">Take Quiz</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tutorial;
