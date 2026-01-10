import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaVideo, FaVideoSlash, FaPlay, FaStop, FaVolumeUp, FaTrash, FaSave } from 'react-icons/fa';
import { Hands } from '@mediapipe/hands';
import './ISLToText.css';

function ISLToText() {
  const webcamRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedGestures, setCapturedGestures] = useState([]);
  const [translatedText, setTranslatedText] = useState('');
  const [currentGesture, setCurrentGesture] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [webcamError, setWebcamError] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const captureIntervalRef = useRef(null);
  const handsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastAPICallRef = useRef(0);
  const isProcessingRef = useRef(false);

  const sendLandmarksToAPI = useCallback(async (landmarks) => {
    // Step 1: Validate landmarks array length
    if (!landmarks || !Array.isArray(landmarks)) {
      console.error(`❌ Invalid landmarks: not an array`, landmarks);
      return;
    }

    if (landmarks.length !== 63) {
      console.error(`❌ Invalid landmarks array length: ${landmarks.length}, expected 63`);
      return;
    }

    // Validate all values are numbers
    const invalidValues = landmarks.filter(v => typeof v !== 'number' || isNaN(v));
    if (invalidValues.length > 0) {
      console.error(`❌ Invalid landmark values found: ${invalidValues.length} NaN or non-number values`);
      return;
    }

    console.log(`✅ Step 1: Landmarks validated - ${landmarks.length} values (21 landmarks × 3 coordinates)`);
    console.log(`📊 Landmark sample: x=${landmarks[0].toFixed(3)}, y=${landmarks[1].toFixed(3)}, z=${landmarks[2].toFixed(3)}`);

    // Throttle API calls to at most once every 300ms
    const now = Date.now();
    if (now - lastAPICallRef.current < 300 || isProcessingRef.current) {
      return;
    }
    
    lastAPICallRef.current = now;
    isProcessingRef.current = true;
    
    try {
      console.log('📤 Step 2: Sending landmarks to API:', {
        count: landmarks.length,
        endpoint: '/api/ml/predict-landmarks',
        sample: landmarks.slice(0, 6)
      });

      const response = await axios.post('/api/ml/predict-landmarks', {
        landmarks: landmarks
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Step 3: API Response received:', {
        status: response.status,
        data: response.data,
        hasPrediction: !!response.data.prediction,
        hasHandDetected: response.data.hand_detected !== undefined
      });

      // Step 4: Handle response - ML service returns 'prediction' not 'gesture'
      const prediction = response.data.prediction;
      const handDetected = response.data.hand_detected !== false; // Default to true if not specified
      const confidence = response.data.confidence || 0;

      if (handDetected && prediction) {
        console.log(`🎯 Step 4: Prediction successful - ${prediction} (${(confidence * 100).toFixed(1)}% confidence)`);
        
        // Step 5: Update UI with prediction results
        setCurrentGesture(prediction);
        setConfidence(confidence);
        setError('');

        // Add to captured gestures with threshold
        if (confidence > 0.1) {
          setCapturedGestures(prev => {
            const lastGesture = prev[prev.length - 1];
            const now = new Date();
            // Only add if different from last gesture or if 1.5 seconds have passed
            if (!lastGesture || lastGesture.gesture !== prediction || 
                (now - new Date(lastGesture.timestamp)) > 1500) {
              console.log(`📝 Adding gesture to captured list: ${prediction}`);
              return [...prev, {
                gesture: prediction,
                confidence: confidence,
                timestamp: now
              }];
            }
            return prev;
          });
        } else {
          console.log(`⚠️ Confidence too low (${(confidence * 100).toFixed(1)}%), not adding to captured gestures`);
        }
      } else {
        console.log('⚠️ Step 4: No valid prediction from API:', {
          handDetected,
          prediction,
          message: response.data.message || response.data.error
        });
        setCurrentGesture(null);
        setConfidence(0);
        // Don't set error for no hand detected - just show "Detecting..."
        if (response.data.error) {
          setError(response.data.error);
        }
      }
    } catch (err) {
      console.error('❌ Step 3: Error sending landmarks to API:', err);
      console.error('❌ Error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          method: err.config?.method
        }
      });
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        setError('ML service is not running. Please start the ML service on port 5001.');
      } else if (err.response?.status === 503) {
        setError('ML service unavailable. Please check if the service is running on port 5001.');
      } else if (err.response?.data?.error) {
        setError(`API Error: ${err.response.data.error}`);
      } else {
        setError(`Failed to predict gesture: ${err.message}`);
      }
      setCurrentGesture(null);
      setConfidence(0);
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // Step 1: Initialize MediaPipe Hands
  useEffect(() => {
    if (!isWebcamActive) {
      console.log('⏸️ Webcam not active, skipping MediaPipe initialization');
      return;
    }

    console.log('🤚 Step 1: Initializing MediaPipe Hands...');
    
    try {
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      console.log('✅ Step 1: MediaPipe Hands options set:', {
        maxNumHands: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      const onResults = (results) => {
        if (!isCapturing) {
          return;
        }

        // Step 2: Extract and validate hand landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const handLandmarks = results.multiHandLandmarks[0];
          
          // Validate we have exactly 21 landmarks
          if (handLandmarks.length !== 21) {
            console.error(`❌ Step 2: Expected 21 landmarks, got ${handLandmarks.length}`);
            return;
          }

          console.log(`✅ Step 2: Detected ${handLandmarks.length} hand landmarks`);

          // Step 3: Flatten landmarks into 63-length array (21 × 3)
          const landmarksArray = [];
          
          for (let i = 0; i < handLandmarks.length; i++) {
            const landmark = handLandmarks[i];
            
            // Validate landmark has x, y, z properties
            if (typeof landmark.x !== 'number' || typeof landmark.y !== 'number' || typeof landmark.z !== 'number') {
              console.error(`❌ Step 3: Invalid landmark at index ${i}:`, landmark);
              return;
            }

            // Check for NaN values
            if (isNaN(landmark.x) || isNaN(landmark.y) || isNaN(landmark.z)) {
              console.error(`❌ Step 3: NaN values in landmark at index ${i}:`, landmark);
              return;
            }

            landmarksArray.push(landmark.x, landmark.y, landmark.z);
          }

          // Step 4: Verify array length is exactly 63
          if (landmarksArray.length !== 63) {
            console.error(`❌ Step 4: Expected 63 values (21×3), got ${landmarksArray.length}`);
            return;
          }

          console.log(`✅ Step 3 & 4: Successfully created 63-length array`);
          console.log(`📊 Landmark range: x=[${Math.min(...landmarksArray.filter((_, i) => i % 3 === 0)).toFixed(3)}, ${Math.max(...landmarksArray.filter((_, i) => i % 3 === 0)).toFixed(3)}], y=[${Math.min(...landmarksArray.filter((_, i) => i % 3 === 1)).toFixed(3)}, ${Math.max(...landmarksArray.filter((_, i) => i % 3 === 1)).toFixed(3)}], z=[${Math.min(...landmarksArray.filter((_, i) => i % 3 === 2)).toFixed(3)}, ${Math.max(...landmarksArray.filter((_, i) => i % 3 === 2)).toFixed(3)}]`);
          
          // Step 5: Send landmarks to API
          sendLandmarksToAPI(landmarksArray);
        } else if (isCapturing) {
          // No hand detected
          console.log('👋 No hand detected in frame');
          setCurrentGesture(null);
          setConfidence(0);
        }
      };

      hands.onResults(onResults);

      handsRef.current = hands;
      console.log('✅ Step 1: MediaPipe Hands initialized successfully');

    } catch (error) {
      console.error('❌ Step 1: Error initializing MediaPipe Hands:', error);
      setError(`Failed to initialize MediaPipe: ${error.message}`);
    }

    return () => {
      console.log('🧹 Cleaning up MediaPipe Hands');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (e) {
          console.error('Error closing MediaPipe:', e);
        }
        handsRef.current = null;
      }
    };
  }, [isWebcamActive, isCapturing, sendLandmarksToAPI]);

  // Process frames when capturing
  useEffect(() => {
    if (!isCapturing || !isWebcamActive || !handsRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Wait for video element to be ready
    const checkVideoReady = () => {
      const video = webcamRef.current?.video;
      if (!video) {
        console.log('⏳ Waiting for video element...');
        setTimeout(checkVideoReady, 100);
        return;
      }

      if (video.readyState < video.HAVE_METADATA) {
        console.log('⏳ Waiting for video metadata...');
        video.addEventListener('loadedmetadata', () => {
          startFrameProcessing();
        }, { once: true });
        return;
      }

      startFrameProcessing();
    };

    const startFrameProcessing = () => {
      console.log('🎬 Starting frame processing');
      
      let frameCount = 0;
      const processFrame = async () => {
        if (!isCapturing || !isWebcamActive || !handsRef.current) {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          return;
        }

        const video = webcamRef.current?.video;
        if (video && video.readyState >= video.HAVE_ENOUGH_DATA && handsRef.current) {
          try {
            frameCount++;
            if (frameCount % 30 === 0) {
              console.log(`📹 Processing frame ${frameCount}, video readyState: ${video.readyState}`);
            }
            await handsRef.current.send({ image: video });
          } catch (err) {
            console.error('❌ Error processing frame:', err);
            // Don't stop processing on single frame error
          }
        } else {
          if (frameCount % 60 === 0) {
            console.log('⏳ Waiting for video to be ready:', {
              hasVideo: !!video,
              readyState: video?.readyState,
              hasHands: !!handsRef.current
            });
          }
        }
        
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };
      
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    checkVideoReady();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isCapturing, isWebcamActive]);

  const startWebcam = () => {
    setIsWebcamActive(true);
    setError('');
    setWebcamError('');
  };

  const stopWebcam = () => {
    setIsWebcamActive(false);
    setIsCapturing(false);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
  };



  const startCapturing = () => {
    setIsCapturing(true);
    setCapturedGestures([]);
    setTranslatedText('');
    setError('');
    setCurrentGesture(null);
  };

  const stopCapturing = async () => {
    setIsCapturing(false);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    // Convert gestures to text
    if (capturedGestures.length > 0) {
      const text = capturedGestures.map(g => g.gesture).join('');
      setTranslatedText(text);
    }
  };

  const speakText = () => {
    if (translatedText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearGestures = () => {
    setCapturedGestures([]);
    setTranslatedText('');
    setCurrentGesture(null);
    setConfidence(0);
  };

  const saveTranslation = async () => {
    if (capturedGestures.length === 0) {
      setError('No gestures to save');
      return;
    }

    setIsSaving(true);
    try {
      await axios.post('/api/translate/isl-to-text', {
        gestures: capturedGestures,
        sessionId: Date.now().toString()
      });

      alert('Translation saved successfully!');
    } catch (err) {
      setError('Failed to save translation');
    } finally {
      setIsSaving(false);
    }
  };

  // Get available camera devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting devices:', err);
      }
    };
    getDevices();
  }, []);


  return (
    <div className="isl-to-text-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>ISL to Text Translation</h1>
        <p>Use your webcam to show sign language gestures and convert them to text</p>
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

      {webcamError && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
        >
          <strong>Camera Issue:</strong> {webcamError}
          <br />
          <small>Try: Allow camera permission, close other apps using camera, or try a different browser.</small>
        </motion.div>
      )}

      <div className="translation-layout">
        <div className="webcam-section card">
          <h2>Camera Feed</h2>
          <div className="webcam-wrapper">
            {isWebcamActive ? (
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="webcam-feed"
                mirrored={true}
                onUserMedia={(stream) => {
                  console.log('✅ Webcam stream started:', stream);
                  console.log('📹 Stream tracks:', stream.getTracks());
                  console.log('📹 Video tracks:', stream.getVideoTracks());
                  
                  // Check if video track is active
                  const videoTracks = stream.getVideoTracks();
                  if (videoTracks.length > 0) {
                    const videoTrack = videoTracks[0];
                    console.log('📹 Video track settings:', videoTrack.getSettings());
                    console.log('📹 Video track constraints:', videoTrack.getConstraints());
                    console.log('📹 Video track ready state:', videoTrack.readyState);
                    console.log('📹 Video track enabled:', videoTrack.enabled);
                    console.log('📹 Video track muted:', videoTrack.muted);
                  }
                  
                  setWebcamError('');
                  
                  // Debug video element after a short delay
                  setTimeout(() => {
                    if (webcamRef.current && webcamRef.current.video) {
                      const video = webcamRef.current.video;
                      console.log('📹 Video element debug:', {
                        videoWidth: video.videoWidth,
                        videoHeight: video.videoHeight,
                        readyState: video.readyState,
                        paused: video.paused,
                        ended: video.ended,
                        currentTime: video.currentTime,
                        duration: video.duration,
                        src: video.src,
                        srcObject: !!video.srcObject
                      });
                    }
                  }, 1000);
                }}
                onUserMediaError={(err) => {
                  console.error('❌ Webcam error:', err);
                  console.error('❌ Error details:', {
                    name: err.name,
                    message: err.message,
                    constraint: err.constraint
                  });
                  setWebcamError(`Camera error: ${err.name} - ${err.message}`);
                }}
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
                  facingMode: selectedDevice ? undefined : 'user',
                  frameRate: 30
                }}
              />
            ) : (
              <div className="webcam-placeholder">
                <FaVideoSlash />
                <p>Camera is off</p>
              </div>
            )}
            
            
            {/* Gesture Detection Overlay */}
            {isCapturing && (
              <div className="gesture-overlay">
                {currentGesture ? (
                  <div className="detected-gesture">
                    <span className="gesture-letter">{currentGesture}</span>
                    <span className="gesture-confidence">
                      {(confidence * 100).toFixed(0)}% confident
                    </span>
                    <div className="detection-debug">
                      <small>✅ Gesture detected - Keep hand steady</small>
                    </div>
                  </div>
                ) : (
                  <div className="detecting-gesture">
                    <div className="detecting-spinner"></div>
                    <span>Detecting gesture...</span>
                    <div className="detection-tips">
                      <small>💡 Tips: Good lighting, clear background, steady hand</small>
                    </div>
                    {error && !error.includes('ML service') && (
                      <div className="detection-error-hint">
                        <small>⚠️ {error}</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
          </div>

          {/* Camera Selection */}
          {availableDevices.length > 1 && (
            <div className="camera-selection">
              <label htmlFor="camera-select">Select Camera:</label>
              <select 
                id="camera-select"
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="camera-dropdown"
              >
                {availableDevices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="webcam-controls">
            {!isWebcamActive ? (
              <button className="btn btn-primary" onClick={startWebcam}>
                <FaVideo /> Start Camera
              </button>
            ) : (
              <>
                <button className="btn btn-danger" onClick={stopWebcam}>
                  <FaVideoSlash /> Stop Camera
                </button>
                {!isCapturing ? (
                  <button className="btn btn-success" onClick={startCapturing}>
                    <FaPlay /> Start Capturing
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={stopCapturing}>
                    <FaStop /> Stop Capturing
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="results-section">
          <div className="card">
            <h2>Captured Gestures</h2>
            <div className="gestures-list">
              {capturedGestures.length === 0 ? (
                <p className="text-muted">No gestures captured yet</p>
              ) : (
                <div className="gesture-items">
                  {capturedGestures.map((g, index) => (
                    <div key={index} className="gesture-item">
                      <span className="gesture-letter-small">{g.gesture}</span>
                      <span className="gesture-conf">{(g.confidence * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2>Translated Text</h2>
            <div className="translated-text-box">
              {translatedText || <span className="text-muted">Text will appear here...</span>}
            </div>
            
            <div className="text-controls">
              <button 
                className="btn btn-primary" 
                onClick={speakText}
                disabled={!translatedText}
              >
                <FaVolumeUp /> Speak
              </button>
              <button 
                className="btn btn-success" 
                onClick={saveTranslation}
                disabled={!translatedText || isSaving}
              >
                <FaSave /> {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button 
                className="btn btn-danger" 
                onClick={clearGestures}
                disabled={capturedGestures.length === 0}
              >
                <FaTrash /> Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card instructions-card">
        <h3>📖 Instructions for Best Results</h3>
        <ol>
          <li><strong>Good Lighting:</strong> Ensure bright, even lighting on your hand</li>
          <li><strong>Plain Background:</strong> Use a plain wall behind you (white or solid color)</li>
          <li><strong>Camera Position:</strong> Position camera at chest level, hand clearly visible</li>
          <li><strong>Start Camera:</strong> Click "Start Camera" to activate webcam</li>
          <li><strong>Center Hand:</strong> Keep your hand in the center of the frame</li>
          <li><strong>Start Capturing:</strong> Click "Start Capturing" to begin</li>
          <li><strong>Make Signs Slowly:</strong> Hold each gesture for 1-2 seconds</li>
          <li><strong>Clear Gestures:</strong> Make distinct, clear hand shapes</li>
          <li><strong>Check Confidence:</strong> Wait for 60%+ confidence score</li>
          <li><strong>Build Sentence:</strong> Each gesture will be captured automatically</li>
          <li><strong>Stop & Review:</strong> Click "Stop Capturing" when done</li>
          <li><strong>Hear & Save:</strong> Use "Speak" and "Save" buttons</li>
        </ol>
      </div>

      <div className="card tips-card">
        <h3>💡 Pro Tips for Accurate Detection</h3>
        <div className="tips-grid-isl">
          <div className="tip-box-isl">
            <span className="tip-icon-big">💡</span>
            <h4>Lighting</h4>
            <p>Natural daylight or bright white light works best. Avoid shadows on your hand.</p>
          </div>
          <div className="tip-box-isl">
            <span className="tip-icon-big">🖐️</span>
            <h4>Hand Position</h4>
            <p>Keep your hand flat facing the camera. Don't angle it sideways.</p>
          </div>
          <div className="tip-box-isl">
            <span className="tip-icon-big">🎯</span>
            <h4>Background</h4>
            <p>Plain white wall or solid color background helps detection significantly.</p>
          </div>
          <div className="tip-box-isl">
            <span className="tip-icon-big">⏱️</span>
            <h4>Timing</h4>
            <p>Hold each sign steady for 1-2 seconds before moving to the next one.</p>
          </div>
          <div className="tip-box-isl">
            <span className="tip-icon-big">🎬</span>
            <h4>Distance</h4>
            <p>Keep your hand 1-2 feet from camera. Entire hand should be visible.</p>
          </div>
          <div className="tip-box-isl">
            <span className="tip-icon-big">✨</span>
            <h4>Clarity</h4>
            <p>Make distinct finger positions. Spread fingers clearly for better recognition.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ISLToText;

