import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import ImageWithFallback from '../components/ImageWithFallback';
import './Learn.css';

function Learn() {
  const [gestures, setGestures] = useState([]);
  const [filteredGestures, setFilteredGestures] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [loading, setLoading] = useState(true);
  const [selectedGesture, setSelectedGesture] = useState(null);

  useEffect(() => {
    fetchGestures();
  }, []);

  useEffect(() => {
    filterAndSortGestures();
  }, [gestures, category, searchTerm, sortOrder]);

  const fetchGestures = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/isl-data');
      if (response.data?.gestures?.length > 0) {
        setGestures(response.data.gestures);
      } else {
        throw new Error('Local Load');
      }
    } catch (err) {
      // Manual mapping of your local folders
      const alphabetList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(char => ({
        _id: `alpha-${char}`,
        letter: char,
        category: 'alphabet', // matching state
        imageUrl: `/assets/Alphabet/${char}.jpg`,
        difficulty: 'Easy'
      }));

      const numbersList = "0123456789".split("").map(num => ({
        _id: `num-${num}`,
        letter: num,
        category: 'number', // matching state
        imageUrl: `/assets/Numbers/${num}.jpg`,
        difficulty: 'Easy'
      }));

      setGestures([...alphabetList, ...numbersList]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGestures = () => {
    // We use a copy to avoid mutating the original state
    let filtered = [...gestures];

    // 1. Filter by Category (Strict Check)
    if (category !== 'all') {
      filtered = filtered.filter(g => g.category === category);
    }

    // 2. Filter by Search
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.letter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Sorting Logic
    filtered.sort((a, b) => {
      const valA = a.letter;
      const valB = b.letter;

      // Check if they are numbers for numeric sorting
      const isNumA = !isNaN(valA);
      const isNumB = !isNaN(valB);

      let comparison = 0;
      if (isNumA && isNumB) {
        comparison = parseInt(valA) - parseInt(valB);
      } else {
        comparison = valA.localeCompare(valB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredGestures(filtered);
  };

  return (
    <div className="learn-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1><FaBook /> Learn Indian Sign Language</h1>
        <p>Browse the ISL alphabet and numbers</p>
      </motion.div>

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
            
            {/* Sorting Toggle Button */}
            <button 
              className="category-btn sort-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title="Toggle Sort Order"
            >
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div><p>Loading gestures...</p></div>
        ) : filteredGestures.length === 0 ? (
          <div className="empty-state">
             <p>No results found for "{searchTerm}"</p>
          </div>
        ) : (
          <div className="gestures-grid">
            {filteredGestures.map((gesture, index) => (
              <motion.div
                key={gesture._id}
                className="gesture-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
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
                  <span className={`difficulty-badge difficulty-${gesture.difficulty}`}>
                    {gesture.difficulty}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedGesture && (
          <motion.div className="gesture-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGesture(null)}>
            <motion.div className="gesture-modal" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedGesture(null)}>×</button>
              <div className="media-container">
                <ImageWithFallback src={selectedGesture.imageUrl} alt={selectedGesture.letter} letter={selectedGesture.letter} className="modal-gesture-img" />
              </div>
              <div className="modal-content">
                <h2>{selectedGesture.letter}</h2>
                <div className="modal-meta">
                  <span className="category-badge">{selectedGesture.category}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Learn;