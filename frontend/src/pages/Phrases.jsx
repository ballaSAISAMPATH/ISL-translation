import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaBook, FaSearch, FaInfoCircle, FaLightbulb } from 'react-icons/fa';
import './Phrases.css';

function Phrases() {
  const [phrases, setPhrases] = useState([]);
  const [filteredPhrases, setFilteredPhrases] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPhrases();
  }, []);

  useEffect(() => {
    filterPhrases();
    // eslint-disable-next-line
  }, [phrases, category, searchTerm]);

  const fetchPhrases = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/phrases');
      setPhrases(response.data.phrases);
    } catch (err) {
      setError('Failed to load phrases');
      console.error('Phrases fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPhrases = () => {
    let filtered = phrases;

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.phrase.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPhrases(filtered);
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: '📚' },
    { value: 'greeting', label: 'Greetings', icon: '👋' },
    { value: 'polite', label: 'Polite Expressions', icon: '🙏' },
    { value: 'daily', label: 'Daily Life', icon: '🏠' },
    { value: 'question', label: 'Questions', icon: '❓' },
    { value: 'emotion', label: 'Emotions', icon: '😊' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' }
  ];

  return (
    <div className="phrases-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1><FaBook /> Common ISL Phrases & Sentences</h1>
        <p>Learn everyday phrases and sentences in Indian Sign Language</p>
      </motion.div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="card">
        <div className="phrases-controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search phrases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters-grid">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`category-btn-modern ${category === cat.value ? 'active' : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading phrases...</p>
          </div>
        ) : filteredPhrases.length === 0 ? (
          <div className="empty-state">
            <FaBook />
            <p>No phrases found</p>
            <span>Try adjusting your search or filters</span>
          </div>
        ) : (
          <div className="phrases-grid">
            {filteredPhrases.map((phrase, index) => (
              <motion.div
                key={phrase._id}
                className="phrase-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPhrase(phrase)}
              >
                <div className="phrase-header">
                  <h3>{phrase.phrase}</h3>
                  <span className={`category-badge cat-${phrase.category}`}>
                    {phrase.category}
                  </span>
                </div>
                <p className="phrase-explanation">{phrase.explanation}</p>
                <div className="phrase-meta">
                  <span className={`difficulty-badge difficulty-${phrase.difficulty}`}>
                    {phrase.difficulty}
                  </span>
                  <span className="signs-count">
                    {phrase.signs.length} {phrase.signs.length === 1 ? 'sign' : 'signs'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedPhrase && (
        <motion.div
          className="phrase-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedPhrase(null)}
        >
          <motion.div
            className="phrase-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close"
              onClick={() => setSelectedPhrase(null)}
            >
              ×
            </button>

            <div className="modal-header-phrase">
              <h2>{selectedPhrase.phrase}</h2>
              <span className={`category-badge cat-${selectedPhrase.category}`}>
                {selectedPhrase.category}
              </span>
            </div>

            <div className="modal-body-phrase">
              <div className="info-section-phrase">
                <FaInfoCircle className="section-icon" />
                <div>
                  <h3>Explanation</h3>
                  <p>{selectedPhrase.explanation}</p>
                </div>
              </div>

              <div className="info-section-phrase">
                <FaLightbulb className="section-icon" />
                <div>
                  <h3>When to Use</h3>
                  <p>{selectedPhrase.usage}</p>
                </div>
              </div>

              <div className="signs-breakdown">
                <h3>Signs Breakdown</h3>
                <div className="signs-list">
                  {selectedPhrase.signs.map((sign, index) => (
                    <div key={index} className="sign-item-breakdown">
                      <div className="sign-number">{index + 1}</div>
                      <div className="sign-details">
                        <h4>{sign.word}</h4>
                        <p>{sign.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="phrase-difficulty-info">
                <span className={`difficulty-badge difficulty-${selectedPhrase.difficulty}`}>
                  Difficulty: {selectedPhrase.difficulty}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="card info-card-phrases">
        <h2>Tips for Learning Phrases</h2>
        <div className="tips-grid-phrases">
          <div className="tip-box">
            <h3>🎭 Facial Expressions</h3>
            <p>Your face is as important as your hands. Use appropriate expressions for each phrase.</p>
          </div>
          <div className="tip-box">
            <h3>⏱️ Timing & Flow</h3>
            <p>Maintain natural rhythm. Don't rush through signs; smooth transitions are key.</p>
          </div>
          <div className="tip-box">
            <h3>👀 Eye Contact</h3>
            <p>Maintain eye contact when signing, especially for questions and expressions of emotion.</p>
          </div>
          <div className="tip-box">
            <h3>📖 Context Matters</h3>
            <p>The same sign can mean different things based on context and facial expressions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Phrases;



