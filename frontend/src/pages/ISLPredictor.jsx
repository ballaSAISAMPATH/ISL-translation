import React, {
  useRef,
  useEffect,
  useState,
  useCallback
} from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Hands } from "@mediapipe/hands";
import { FaVideoSlash, FaPlay, FaStop, FaCamera, FaCameraRetro } from "react-icons/fa";

const FRAME_INTERVAL_MS = 200; // 5 FPS

function ISLPredictor() {
  const webcamRef = useRef(null);
  const handsRef = useRef(null);
  const frameTimerRef = useRef(null);
  const isProcessingRef = useRef(false);
  
  // State Management
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState("Idle");

  /* ---------- send landmarks for prediction ---------- */
  const sendForPrediction = useCallback(async (landmarks) => {
    try {
      const res = await axios.post("http://localhost:5001/predict", { landmarks: landmarks });
      setPrediction(res.data.prediction);
      setConfidence(res.data.confidence);
      setStatus("Predicting...");
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
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        return;
      }

      const hand = results.multiHandLandmarks[0];
      if (hand.length !== 21) return;

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
    // Only run the interval if BOTH camera is on and prediction is active
    if (!isCameraOn || !isPredicting) {
        if (frameTimerRef.current) clearInterval(frameTimerRef.current);
        return;
    }

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
      } catch (err) {
        console.error("MediaPipe Error:", err);
      } finally {
        isProcessingRef.current = false;
      }
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(frameTimerRef.current);
  }, [isCameraOn, isPredicting]);

  /* ---------- controls ---------- */
  const startCamera = () => {
    setIsCameraOn(true);
    setStatus("Camera active");
  };

  const stopCamera = () => {
    setIsCameraOn(false);
    setIsPredicting(false);
    setPrediction("");
    setConfidence(0);
    setStatus("System stopped");
  };

  const togglePrediction = () => {
    if (!isCameraOn) return;
    const nextState = !isPredicting;
    setIsPredicting(nextState);
    setStatus(nextState ? "Prediction started" : "Prediction paused");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-800 mb-2">ISL Gesture Predictor</h1>
          <p className="text-slate-500">Enable camera to start, then trigger AI prediction.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto  mb-16">
          {["Real-time Detection", "95%+ Accuracy", "Privacy First"].map((text) => (
            <div
              key={text}
              className="p-1 bg-linear-to-br text-white text-center from-red-600 to-emerald-600 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 animate-scale-in"
            >
              <span className="font-semibold px-2 text-sm text-white">
                {text}
              </span>
            </div>
          ))}
      </div> 

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* LEFT: VIDEO FEED */}
          <div className="relative">
            <div className={`aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-300 ${isPredicting ? 'border-green-500' : 'border-slate-200'}`}>
              {isCameraOn ? (
                <Webcam
                  ref={webcamRef}
                  mirrored
                  audio={false}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                  <FaVideoSlash size={48} className="mb-4" />
                  <p>Camera is currently offline</p>
                </div>
              )}
            </div>

            {/* STATUS OVERLAY */}
            <div className={`absolute top-4 left-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-lg ${isPredicting ? 'bg-green-600 animate-pulse' : 'bg-slate-700'}`}>
              {status}
            </div>
          </div>

          {/* RIGHT: INTERFACE */}
          <div className="space-y-6">
            
            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={isCameraOn ? stopCamera : startCamera}
                className={`flex items-center justify-center gap-3 h-16 rounded-2xl font-bold transition-all shadow-lg ${
                    isCameraOn 
                    ? "bg-white text-red-600 border-2 border-red-100 hover:bg-red-50" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isCameraOn ? <FaStop /> : <FaCamera />}
                {isCameraOn ? "Stop Camera" : "Start Camera"}
              </button>

              <button
                onClick={togglePrediction}
                disabled={!isCameraOn}
                className={`flex items-center justify-center gap-3 h-16 rounded-2xl font-bold transition-all shadow-lg ${
                  !isCameraOn 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : isPredicting 
                      ? "bg-amber-500 text-white hover:bg-amber-600" 
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {isPredicting ? <FaStop /> : <FaPlay />}
                {isPredicting ? "Pause Prediction" : "Start Prediction"}
              </button>
            </div>

            {/* PREDICTION CARD */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-6">AI Output</h3>
              
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-6">
                <span className="text-5xl font-black text-slate-800 tracking-tighter">
                  {prediction || "---"}
                </span>
                <span className="text-slate-400 text-sm mt-2">Detected Gesture</span>
              </div>

              {/* CONFIDENCE BAR */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-600">Confidence</span>
                  <span className="text-2xl font-black text-emerald-600">{(confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* INFO FOOTER */}
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs text-indigo-700 leading-relaxed">
                    <strong>Note:</strong> Ensure your hand is fully visible within the frame. Prediction starts only after clicking "Start Prediction".
                </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ISLPredictor;