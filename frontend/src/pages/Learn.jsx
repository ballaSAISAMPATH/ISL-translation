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
      setGestures(response.data.gestures);
    } catch (err) {
      setError('Failed to load ISL data');
      console.error('Gestures fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterGestures = () => {
    let filtered = gestures;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(g => g.category === category);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.letter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

      {error && (
        <div className="error-message">{error}</div>
      )}

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
                  {gesture.description && (
                    <p>{gesture.description}</p>
                  )}
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
          onClick={() => {
            setSelectedGesture(null);
            setIsPlaying(false);
            setIsMuted(true);
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }}
        >
          <motion.div
            className="gesture-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="modal-close"
              onClick={() => {
                setSelectedGesture(null);
                setIsPlaying(false);
                setIsMuted(true);
                if (videoRef.current) {
                  videoRef.current.pause();
                }
              }}
            >
              ×
            </button>

            <div className="media-container">
              <ImageWithFallback
                src={selectedGesture.imageUrl}
                alt={selectedGesture.letter}
                letter={selectedGesture.letter}
                className="modal-gesture-img"
              />
              {!selectedGesture.videoUrl && (
                <p className="image-instruction">
                  📸 Image showing the {selectedGesture.letter} sign position
                </p>
              )}
            </div>
            
            {selectedGesture.videoUrl && (
              <div className="video-demo-container">
                <div className="video-wrapper">
                  {selectedGesture.videoUrl.includes('youtube.com') || selectedGesture.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={selectedGesture.videoUrl}
                      title={`ISL ${selectedGesture.letter} Video`}
                      className="gesture-video-iframe"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <>
                      <video 
                        ref={videoRef}
                        src={selectedGesture.videoUrl} 
                        loop 
                        className="gesture-video"
                        muted={isMuted}
                        playsInline
                      >
                        Your browser doesn't support video.
                      </video>
                      <div className="video-controls">
                        <button 
                          className="video-control-btn"
                          onClick={() => {
                            if (videoRef.current) {
                              if (isPlaying) {
                                videoRef.current.pause();
                              } else {
                                videoRef.current.play();
                              }
                              setIsPlaying(!isPlaying);
                            }
                          }}
                        >
                          {isPlaying ? <FaPause /> : <FaPlay />}
                        </button>
                        <button 
                          className="video-control-btn"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.muted = !isMuted;
                              setIsMuted(!isMuted);
                            }
                          }}
                        >
                          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <p className="video-instruction">
                  👆 Watch the video to see how to make the {selectedGesture.letter} sign
                </p>
              </div>
            )}

            <div className="modal-content">
              <h2>{selectedGesture.letter}</h2>
              {selectedGesture.word && (
                <p className="gesture-word">Word: {selectedGesture.word}</p>
              )}
              {selectedGesture.description && (
                <p className="gesture-desc">{selectedGesture.description}</p>
              )}
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
        <p>
          Indian Sign Language is a visual-gestural language used by the deaf community in India. 
          It has its own grammar, syntax, and linguistic structure that differs from spoken languages.
        </p>
        <p>
          ISL uses a combination of hand shapes, hand movements, body language, and facial expressions 
          to convey meaning. Learning ISL helps create an inclusive society where everyone can communicate 
          effectively regardless of hearing ability.
        </p>
        <h3>Tips for Learning ISL:</h3>
        <ul>
          <li>Practice regularly - consistency is key to mastering sign language</li>
          <li>Pay attention to hand shape, position, and movement</li>
          <li>Facial expressions are crucial - they add context and emotion</li>
          <li>Start with the alphabet and common words</li>
          <li>Practice with others in the deaf community when possible</li>
        </ul>
      </div>
    </div>
  );
}

export default Learn;

