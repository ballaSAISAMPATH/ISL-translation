import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaKeyboard, FaPlay, FaPause, FaStepForward, FaStepBackward, FaSave, FaList, FaTh, FaInfoCircle, FaRobot, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ImageWithFallback from '../components/ImageWithFallback';
import './TextToISL.css';

function TextToISL() {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [gestures, setGestures] = useState([]);
  const [sequence, setSequence] = useState([]); // New sequence format
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'carousel'
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordGroups, setWordGroups] = useState([]);
  const [isPhrase, setIsPhrase] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [useSignMT, setUseSignMT] = useState(false);
  const [signMTData, setSignMTData] = useState(null);
  const [apiSource, setApiSource] = useState(null); // Track which API was used
  const [playbackSpeed, setPlaybackSpeed] = useState(1500); // milliseconds per sign
  const playIntervalRef = React.useRef(null);

  // Ensure token is included in requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [user]);

  const translateText = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text');
      return;
    }

    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to use this feature');
      return;
    }

    setLoading(true);
    setError('');
    setSequence([]);
    setGestures([]);
    setApiSource(null);
    
    try {
      // Ensure token is in headers
      const config = {
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Try text-to-sign-sequence endpoint first (uses local processing)
      try {
        const sequenceResponse = await axios.post('/api/translate/text-to-sign-sequence', {
          text: inputText
        }, config);

        if (sequenceResponse.data.sequence && Array.isArray(sequenceResponse.data.sequence)) {
          setSequence(sequenceResponse.data.sequence);
          setApiSource(sequenceResponse.data.source || 'local');
          setCurrentIndex(0);
          setIsPlaying(false);
          
          // Convert sequence to gestures format for compatibility
          const convertedGestures = sequenceResponse.data.sequence.map(item => ({
            label: item.label,
            letter: item.label,
            imageUrl: item.imageUrl,
            type: item.label === 'SPACE' ? 'space' : 'letter'
          }));
          setGestures(convertedGestures);
          
          if (sequenceResponse.data.message) {
            setExplanation(sequenceResponse.data.message);
          }
          return;
        }
      } catch (seqError) {
        console.warn('Sequence endpoint failed, falling back to standard translation:', seqError.message);
        // Fall through to standard translation
      }

      // Standard translation (fallback)
      const response = await axios.post('/api/translate/text-to-isl', {
        text: inputText,
        useSignMT: useSignMT
      }, config);

      setGestures(response.data.gestures || []);
      setIsPhrase(response.data.isPhrase || false);
      setExplanation(response.data.explanation || '');
      setSignMTData(response.data.signMTTranslation || null);
      setApiSource('standard');
      setCurrentIndex(0);
      setCurrentWordIndex(0);
      setIsPlaying(false);
      
      // Group gestures by words for better visualization
      if (response.data.gestures) {
        groupGesturesByWords(response.data.gestures);
      }
    } catch (err) {
      console.error('Translation error:', err);
      
      // Handle 401 authentication errors
      if (err.response?.status === 401) {
        setError('Authentication failed. Please logout and login again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your permissions.');
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to translate text. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const groupGesturesByWords = (gestureList) => {
    const groups = [];
    let currentGroup = [];
    
    gestureList.forEach((gesture, index) => {
      if (gesture.type === 'word-start') {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [gesture];
      } else if (gesture.type === 'space') {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
        }
        currentGroup = [];
      } else {
        currentGroup.push(gesture);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    setWordGroups(groups);
  };

  const startPlayback = () => {
    // Use sequence if available, otherwise use gestures
    const itemsToPlay = sequence.length > 0 ? sequence : gestures.filter(g => g.type !== 'word-start');
    if (itemsToPlay.length === 0) return;
    
    setIsPlaying(true);
    playIntervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = itemsToPlay.length - 1;
        if (prev >= maxIndex) {
          stopPlayback();
          return 0;
        }
        return prev + 1;
      });
    }, playbackSpeed);
  };

  // Get current word for the current gesture
  const getCurrentWord = () => {
    if (wordGroups.length === 0) return null;
    
    let gestureCount = 0;
    for (let i = 0; i < wordGroups.length; i++) {
      const wordGroup = wordGroups[i];
      const wordStartIndex = gestureCount;
      const wordEndIndex = gestureCount + wordGroup.length - 1;
      
      if (currentIndex >= wordStartIndex && currentIndex <= wordEndIndex) {
        const wordStart = wordGroup.find(g => g.type === 'word-start');
        return wordStart ? wordStart.word : `Word ${i + 1}`;
      }
      
      gestureCount += wordGroup.length;
    }
    
    return null;
  };

  // Get filtered gestures (excluding word-start markers for display)
  const displayGestures = React.useMemo(() => {
    return gestures.filter(g => g.type !== 'word-start');
  }, [gestures]);

  // Get display items (sequence or gestures)
  const displayItems = React.useMemo(() => {
    if (sequence.length > 0) {
      return sequence;
    }
    return displayGestures;
  }, [sequence, displayGestures]);

  const stopPlayback = () => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  };

  const nextGesture = () => {
    const itemsToPlay = sequence.length > 0 ? sequence : gestures.filter(g => g.type !== 'word-start');
    if (currentIndex < itemsToPlay.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousGesture = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const saveTranslation = async () => {
    if (gestures.length === 0 && sequence.length === 0) {
      setError('No translation to save');
      return;
    }

    setIsSaving(true);
    try {
      // Translation is already saved on the backend when translated
      const message = sequence.length > 0 
        ? 'Sign sequence saved successfully!' 
        : 'Translation saved successfully!';
      alert(message);
    } catch (err) {
      setError('Failed to save translation');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gestures.length > 0) {
      groupGesturesByWords(gestures);
    }
  }, [gestures]);

  // Get current item (from sequence or gestures)
  const currentItem = displayItems[currentIndex] || (sequence.length > 0 ? sequence[0] : displayGestures[0]);
  const currentGesture = currentItem;
  const currentWord = getCurrentWord();

  return (
    <div className="text-to-isl-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Text to ISL Translation</h1>
        <p>Type text and see the corresponding Indian Sign Language gestures</p>
      </motion.div>

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      <div className="translation-layout">
        <div className="input-section card">
          <h2><FaKeyboard /> Enter Text</h2>
          <textarea
            className="text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type text or sentence here... (e.g., 'HELLO', 'THANK YOU', 'MY NAME IS JOHN')"
            maxLength="200"
          />
          <div className="input-controls">
            <button 
              className="btn btn-primary" 
              onClick={translateText}
              disabled={loading || !inputText.trim()}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinning" /> Translating...
                </>
              ) : (
                <>
                  <FaRobot /> Translate to Sign Language
                </>
              )}
            </button>
            <span className="text-muted">
              {inputText.length}/200 characters | {inputText.trim().split(/\s+/).filter(w => w).length} words
            </span>
          </div>
          
          <div className="translation-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useSignMT}
                onChange={(e) => setUseSignMT(e.target.checked)}
                disabled={loading}
              />
              <span>Also use sign.mt/Nagish translation service</span>
            </label>
            <small className="text-muted">
              Integrates with <a href="https://sign.mt" target="_blank" rel="noopener noreferrer">sign.mt</a> (acquired by <a href="https://nagish.com" target="_blank" rel="noopener noreferrer">Nagish</a>) for additional translation options
            </small>
          </div>
          
          {apiSource && (
            <div className={`api-source-indicator ${apiSource === 'local' ? 'standard-source' : 'standard-source'}`}>
              <FaInfoCircle /> 
              {apiSource === 'local' ? (
                <span>Using local ISL database with text processing</span>
              ) : (
                <span>Using standard translation</span>
              )}
            </div>
          )}
          
          {explanation && displayItems.length > 0 && (
            <div className="explanation-box">
              <FaInfoCircle /> <strong>Tip:</strong> {explanation}
            </div>
          )}
          
          {signMTData && (
            <div className="signmt-box">
              <strong>🌐 sign.mt/Nagish Translation:</strong>
              {signMTData.translated_text && (
                <p>{signMTData.translated_text}</p>
              )}
              {signMTData.video_url && (
                <div className="signmt-video">
                  <video src={signMTData.video_url} controls muted>
                    Your browser doesn't support video.
                  </video>
                </div>
              )}
              {signMTData.note && (
                <small className="text-muted">{signMTData.note}</small>
              )}
            </div>
          )}
        </div>

        <div className="gesture-display-section card">
          <div className="gesture-header">
            <h2>ISL Gestures</h2>
            {gestures.length > 0 && (
              <div className="view-mode-toggle">
                <button
                  className={`view-btn ${viewMode === 'single' ? 'active' : ''}`}
                  onClick={() => setViewMode('single')}
                  title="Single View"
                >
                  <FaTh />
                </button>
                <button
                  className={`view-btn ${viewMode === 'carousel' ? 'active' : ''}`}
                  onClick={() => setViewMode('carousel')}
                  title="Carousel View"
                >
                  <FaList />
                </button>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="gesture-placeholder loading-state">
              <FaSpinner className="spinning" style={{ fontSize: '60px', marginBottom: '20px' }} />
              <p>Generating sign language sequence...</p>
              <span>This may take a few moments</span>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="gesture-placeholder">
              <FaKeyboard />
              <p>Sign sequence will be displayed here</p>
              <span>Enter text and click "Translate to Sign Language"</span>
            </div>
          ) : (
            <>
              {isPhrase && (
                <div className="phrase-indicator">
                  <strong>📝 Common Phrase Detected:</strong> {inputText.toUpperCase()}
                </div>
              )}
              
              {currentWord && (
                <div className="current-word-indicator">
                  Current Word: <strong>{currentWord}</strong>
                </div>
              )}

              {viewMode === 'single' ? (
                <div className="gesture-viewer">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      className="gesture-card"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentItem?.label === 'SPACE' || currentGesture?.type === 'space' ? (
                        <div className="space-indicator">
                          <div className="space-icon">⏸</div>
                          <p>Pause between words</p>
                        </div>
                      ) : (
                        <>
                          <ImageWithFallback
                            src={currentItem?.imageUrl || currentGesture?.imageUrl}
                            alt={currentItem?.label || currentGesture?.letter}
                            letter={currentItem?.label || currentGesture?.letter}
                            className="gesture-image"
                          />
                          
                          {currentGesture?.videoUrl && (
                            <video 
                              src={currentGesture.videoUrl} 
                              loop 
                              autoPlay 
                              muted
                              className="gesture-video-demo"
                            >
                              Your browser doesn't support video.
                            </video>
                          )}
                          
                          <div className="gesture-info">
                            <h3>{currentItem?.label || currentGesture?.letter}</h3>
                            {currentGesture?.description && (
                              <p>{currentGesture.description}</p>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="gesture-carousel">
                  <div className="carousel-container">
                    {displayItems.map((item, index) => {
                      const isSpace = item.label === 'SPACE' || item.type === 'space';
                      const label = item.label || item.letter;
                      const imageUrl = item.imageUrl;
                      
                      return (
                        <motion.div
                          key={index}
                          className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentIndex(index);
                            stopPlayback();
                          }}
                          whileHover={{ scale: 1.05 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          {isSpace ? (
                            <div className="carousel-space">
                              <div className="space-icon-small">⏸</div>
                              <span>Pause</span>
                            </div>
                          ) : (
                            <>
                              <ImageWithFallback
                                src={imageUrl}
                                alt={label}
                                letter={label}
                                className="carousel-image"
                              />
                              <div className="carousel-label">{label}</div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="playback-controls">
                <button 
                  className="btn btn-secondary"
                  onClick={previousGesture}
                  disabled={currentIndex === 0}
                  title="Previous sign"
                >
                  <FaStepBackward />
                </button>
                
                {!isPlaying ? (
                  <button 
                    className="btn btn-primary"
                    onClick={startPlayback}
                    title="Play sequence"
                  >
                    <FaPlay /> Play Sequence
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary"
                    onClick={stopPlayback}
                    title="Pause playback"
                  >
                    <FaPause /> Pause
                  </button>
                )}
                
                <button 
                  className="btn btn-secondary"
                  onClick={nextGesture}
                  disabled={currentIndex === displayItems.length - 1}
                  title="Next sign"
                >
                  <FaStepForward />
                </button>
                
                <div className="playback-speed-control">
                  <label>Speed:</label>
                  <select 
                    value={playbackSpeed} 
                    onChange={(e) => {
                      setPlaybackSpeed(Number(e.target.value));
                      if (isPlaying) {
                        stopPlayback();
                        startPlayback();
                      }
                    }}
                    disabled={isPlaying}
                  >
                    <option value={800}>Fast</option>
                    <option value={1500}>Normal</option>
                    <option value={2500}>Slow</option>
                  </select>
                </div>
              </div>

              <div className="progress-indicator">
                <span>Sign {currentIndex + 1} of {displayItems.length}</span>
                {wordGroups.length > 0 && !sequence.length && (
                  <span className="word-progress">
                    | Word {wordGroups.findIndex((group, idx) => {
                      let count = 0;
                      for (let i = 0; i < idx; i++) count += wordGroups[i].length;
                      return currentIndex >= count && currentIndex < count + group.length;
                    }) + 1} of {wordGroups.length}
                  </span>
                )}
              </div>

              {viewMode === 'single' && (
                <div className="gesture-strip">
                  {displayItems.map((item, index) => {
                    const isSpace = item.label === 'SPACE' || item.type === 'space';
                    const label = item.label || item.letter;
                    
                    return (
                      <div
                        key={index}
                        className={`gesture-thumb ${index === currentIndex ? 'active' : ''} ${isSpace ? 'space-thumb' : ''}`}
                        onClick={() => { setCurrentIndex(index); stopPlayback(); }}
                        title={item.description || label}
                      >
                        {isSpace ? '⏸' : label}
                      </div>
                    );
                  })}
                </div>
              )}

              <button 
                className="btn btn-success"
                onClick={saveTranslation}
                disabled={isSaving || (gestures.length === 0 && sequence.length === 0)}
              >
                <FaSave /> {isSaving ? 'Saving...' : 'Save Translation'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card instructions-card">
        <h3>How to Use</h3>
        <ol>
          <li>Type your text in the input box (supports letters, numbers, and common phrases)</li>
          <li>Click "Translate to Sign Language" to convert your text into sign language gestures</li>
          <li>Use the playback controls to view signs one by one or click "Play Sequence" for automatic playback</li>
          <li>Adjust playback speed (Fast/Normal/Slow) to match your learning pace</li>
          <li>Toggle between Single View (one sign at a time) and Carousel View (all signs visible)</li>
          <li>Click on any sign in the strip or carousel to jump to it</li>
          <li>Word boundaries are indicated with pause markers (⏸)</li>
          <li>Common phrases are detected automatically and shown as complete gestures</li>
          <li>The system uses dictionary-based mapping for common words, with letter-by-letter fallback</li>
          <li>Save your translation for future reference</li>
        </ol>
      </div>
    </div>
  );
}

export default TextToISL;

