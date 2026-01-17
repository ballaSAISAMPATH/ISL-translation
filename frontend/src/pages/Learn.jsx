import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaBook, FaSearch, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import ImageWithFallback from '../components/ImageWithFallback';
import './Learn.css';

function Learn() {
  const [gestures, setGestures] = useState([]);
  const [filteredGestures, setFilteredGestures] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGesture, setSelectedGesture] = useState(null);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchGestures();
  }, []);

  useEffect(() => {
    filterGestures();
  }, [gestures, category, searchTerm]);

  const fetchGestures = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/isl-data');
      
      if (response.data && response.data.gestures.length > 0) {
        setGestures(response.data.gestures);
      } else {
        throw new Error('Empty API data');
      }
    } catch (err) {
      console.log('API fetch failed or empty, loading local photos...');
      
      // MAPPING LOCAL FOLDERS
      // Assuming images are in public/assets/Alphabet/A.jpg etc.
      const alphabetList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char => ({
        _id: `alpha-${char}`,
        letter: char,
        category: 'alphabet',
        imageUrl: `/assets/Alphabet/${char}.jpg`, // Path to your Alphabet folder
        difficulty: 'Easy'
      }));

      const numbersList = "0123456789".split("").map(num => ({
        _id: `num-${num}`,
        letter: num,
        category: 'number',
        imageUrl: `/assets/Numbers/${num}.jpg`, // Path to your Numbers folder
        difficulty: 'Easy'
      }));

      setGestures([...alphabetList, ...numbersList]);
    } finally {
      setLoading(false);
    }
  };

  const filterGestures = () => {
    let filtered = gestures;

    if (category !== 'all') {
      filtered = filtered.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.letter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGestures(filtered);
  };

  return (
    <div className="learn-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1><FaBook /> Learn Indian Sign Language</h1>
        <p>Browse the ISL alphabet and numbers</p>
      </motion.div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="learn-controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search gestures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <button
              className={`category-btn ${category === 'all' ? 'active' : ''}`}
              onClick={() => setCategory('all')}
            >
              All
            </button>
            <button
              className={`category-btn ${category === 'alphabet' ? 'active' : ''}`}
              onClick={() => setCategory('alphabet')}
            >
              Alphabet
            </button>
            <button
              className={`category-btn ${category === 'number' ? 'active' : ''}`}
              onClick={() => setCategory('number')}
            >
              Numbers
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading gestures...</p>
          </div>
        ) : filteredGestures.length === 0 ? (
          <div className="empty-state">
            <FaBook />
            <p>No gestures found</p>
            <span>Try adjusting your search or filters</span>
          </div>
        ) : (
          <div className="gestures-grid">
            {filteredGestures.map((gesture, index) => (
              <motion.div
                key={gesture._id}
                className="gesture-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedGesture(gesture)}
              >
                <ImageWithFallback
                  src={gesture.imageUrl}
                  alt={gesture.letter}
                  letter={gesture.letter}
                  className="gesture-img"
                />
                
                <div className="gesture-card-info">
                  <h3>{gesture.letter}</h3>
                  {gesture.description && <p>{gesture.description}</p>}
                  <span className={`difficulty-badge difficulty-${gesture.difficulty}`}>
                    {gesture.difficulty}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedGesture && (
        <motion.div
          className="gesture-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedGesture(null)}
        >
          <motion.div
            className="gesture-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setSelectedGesture(null)}>×</button>

            <div className="media-container">
              <ImageWithFallback
                src={selectedGesture.imageUrl}
                alt={selectedGesture.letter}
                letter={selectedGesture.letter}
                className="modal-gesture-img"
              />
            </div>
            
            <div className="modal-content">
              <h2>{selectedGesture.letter}</h2>
              <div className="modal-meta">
                <span className={`difficulty-badge difficulty-${selectedGesture.difficulty}`}>
                  {selectedGesture.difficulty}
                </span>
                <span className="category-badge">
                  {selectedGesture.category}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="card info-card">
        <h2>About Indian Sign Language (ISL)</h2>
        <p>Indian Sign Language is a visual-gestural language used by the deaf community in India.</p>
        <h3>Tips for Learning ISL:</h3>
        <ul>
          <li>Practice regularly - consistency is key to mastering sign language</li>
          <li>Pay attention to hand shape, position, and movement</li>
        </ul>
      </div>
    </div>
  );
}

export default Learn;