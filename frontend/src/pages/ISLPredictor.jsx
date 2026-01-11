import React, {
  useRef,
  useEffect,
  useState,
  useCallback
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import axios from "axios";
import { Hands } from "@mediapipe/hands";

const FRAME_INTERVAL_MS = 200; // 5 FPS

function ISLPredictor() {
  const webcamRef = useRef(null);
  const handsRef = useRef(null);
  const frameTimerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState("Idle");

  /* ---------- send landmarks for prediction ---------- */
  const sendForPrediction = useCallback(async (landmarks) => {
    try {
      const res = await axios.post("http://localhost:5001/predict", { landmarks: landmarks });
      setPrediction(res.data.prediction);
      setConfidence(res.data.confidence);
      setStatus("Prediction successful");
    } catch (err) {
      console.error(err);
      setStatus("❌ Prediction failed");
    }
  }, []);

  /* ---------- init MediaPipe ---------- */
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
      selfieMode: true
    });

    hands.onResults((results) => {
      if (!results.multiHandLandmarks) return;

      const hand = results.multiHandLandmarks[0];
      if (!hand || hand.length !== 21) return;

      const landmarks = [];
      for (let i = 0; i < hand.length; i++) {
        landmarks.push(hand[i].x, hand[i].y, hand[i].z);
      }

      if (landmarks.length === 63) {
        sendForPrediction(landmarks);
      }
    });

    handsRef.current = hands;
    return () => hands.close();
  }, [sendForPrediction]);

  /* ---------- frame loop ---------- */
  useEffect(() => {
    if (!isCameraOn) return;

    frameTimerRef.current = setInterval(async () => {
      const video = webcamRef.current?.video;

      if (
        !video ||
        video.readyState < 4 ||
        !handsRef.current ||
        isProcessingRef.current
      ) return;

      try {
        isProcessingRef.current = true;
        await handsRef.current.send({ image: video });
      } finally {
        isProcessingRef.current = false;
      }
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(frameTimerRef.current);
  }, [isCameraOn]);

  /* ---------- controls ---------- */
  const startCamera = () => {
    setIsCameraOn(true);
    setStatus("Camera started");
  };

  const stopCamera = () => {
    setIsCameraOn(false);
    setPrediction("");
    setConfidence(0);
    setStatus("Camera stopped");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Hero Section */}
      <motion.div
        className="hero-section pt-12 pb-20 px-6 md:px-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block mb-6"
        >
          <div className="text-6xl md:text-8xl">🤟</div>
        </motion.div>
        
        <h1 className="hero-title text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
          ISL Gesture Predictor
        </h1>
        <p className="hero-subtitle text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
          Real-time Indian Sign Language recognition powered by AI and MediaPipe
        </p>
        
        <div className="hero-features max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div className="hero-feature flex flex-col items-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50" 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}>
            <div className="text-4xl mb-4">⚡</div>
            <span className="font-semibold text-lg text-gray-800">Real-time Detection</span>
          </motion.div>
          <motion.div className="hero-feature flex flex-col items-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50" 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}>
            <div className="text-4xl mb-4">🎯</div>
            <span className="font-semibold text-lg text-gray-800">95%+ Accuracy</span>
          </motion.div>
          <motion.div className="hero-feature flex flex-col items-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50" 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}>
            <div className="text-4xl mb-4">🔒</div>
            <span className="font-semibold text-lg text-gray-800">Privacy First</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Control Section */}
      <motion.div
        className="main-section px-6 md:px-12 pb-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Webcam & Controls */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Webcam Container */}
          <motion.div className="webcam-container relative group"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}>
            <div className={`webcam-wrapper rounded-3xl shadow-2xl overflow-hidden border-4 transition-all duration-500 ${
              isCameraOn 
                ? 'border-green-400 bg-green-50/50 ring-4 ring-green-200/50' 
                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'
            }`}>
              <AnimatePresence mode="wait">
                {isCameraOn ? (
                  <motion.div
                    key="webcam"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Webcam
                      ref={webcamRef}
                      mirrored
                      audio={false}
                      videoConstraints={{ facingMode: "user" }}
                      className="w-full h-[500px] md:h-[600px] object-cover"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-[500px] md:h-[600px] bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col items-center justify-center text-white p-12"
                  >
                    <div className="text-8xl mb-8 animate-pulse">📷</div>
                    <h3 className="text-3xl font-bold mb-4">Camera Ready</h3>
                    <p className="text-xl opacity-90">Click Start to begin gesture detection</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Status Badge */}
            <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full text-sm font-semibold shadow-lg ${
              status.includes('successful') || status.includes('started')
                ? 'bg-green-500 text-white'
                : status.includes('failed') || status.includes('stopped')
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-white'
            }`}>
              {status}
            </div>
          </motion.div>

          {/* Controls & Results */}
          <motion.div className="controls-section space-y-8"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}>
            
            {/* Control Buttons */}
            <div className="control-buttons space-y-4">
              <AnimatePresence mode="wait">
                {!isCameraOn ? (
                  <motion.button
                    key="start"
                    onClick={startCamera}
                    className="w-full h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 text-shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-3xl">📷</span>
                    Start Camera
                  </motion.button>
                ) : (
                  <motion.button
                    key="stop"
                    onClick={stopCamera}
                    className="w-full h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 text-shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-3xl">⏹️</span>
                    Stop Camera
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Prediction Results */}
            <div className="prediction-card bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                Current Prediction
              </h3>
              
              <div className="space-y-6">
                <div className="prediction-display p-8 bg-gradient-to-br rounded-2xl text-center shadow-xl border-4 border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  <div className="text-6xl mb-4 animate-pulse">
                    {prediction || '👋'}
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent tracking-wide">
                    {prediction || 'No Gesture'}
                  </div>
                </div>
                
                <div className="confidence-bar">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg text-gray-700">Confidence</span>
                    <span className="font-mono text-2xl font-bold text-green-600">
                      {(confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <motion.div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="features-section px-6 md:px-12 pb-20 pt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              🚀 How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Advanced AI detects hand landmarks in real-time and translates Indian Sign Language gestures instantly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div className="feature-card bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}>
              <div className="card-icon text-5xl group-hover:scale-110 transition-transform duration-300 mb-6">📹</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Camera Capture</h3>
              <p className="text-gray-600 leading-relaxed">High-precision webcam feed captures hand movements at 5 FPS</p>
            </motion.div>

            <motion.div className="feature-card bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}>
              <div className="card-icon text-5xl group-hover:scale-110 transition-transform duration-300 mb-6">🤖</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">AI Processing</h3>
              <p className="text-gray-600 leading-relaxed">MediaPipe extracts 63 hand landmarks (x,y,z) for gesture analysis</p>
            </motion.div>

            <motion.div className="feature-card bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}>
              <div className="card-icon text-5xl group-hover:scale-110 transition-transform duration-300 mb-6">✨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Instant Results</h3>
              <p className="text-gray-600 leading-relaxed">Backend ML model delivers predictions with confidence scores in milliseconds</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ISLPredictor;
