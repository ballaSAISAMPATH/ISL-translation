import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Hands } from "@mediapipe/hands";
import { FaVideoSlash, FaPlay, FaStop, FaCamera, FaVolumeUp, FaTrashAlt } from "react-icons/fa";

const FRAME_INTERVAL_MS = 200; 

function ISLPredictor() {
  const webcamRef = useRef(null);
  const handsRef = useRef(null);
  const frameTimerRef = useRef(null);
  const isProcessingRef = useRef(false);
  
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState("Idle");
  
  // Sentence State
  const [sentence, setSentence] = useState("");
  const [lastAddedWord, setLastAddedWord] = useState("");

  /* ---------- Text to Speech ---------- */
  const speakSentence = () => {
    if ("speechSynthesis" in window && sentence) {
      const utterance = new SpeechSynthesisUtterance(sentence);
      window.speechSynthesis.speak(utterance);
    }
  };

  /* ---------- send landmarks for prediction ---------- */
  const sendForPrediction = useCallback(async (landmarks) => {
    try {
      const res = await axios.post("http://localhost:5001/predict", { landmarks });
      const currentWord = res.data.prediction;
      const currentConf = res.data.confidence;

      setPrediction(currentWord);
      setConfidence(currentConf);
      setStatus("Predicting...");

      // Logical Word Addition: Only add if confidence > 90% and it's not the same as the last word
      if (currentConf > 0.90 && currentWord !== lastAddedWord) {
        setSentence((prev) => prev + (prev ? " " : "") + currentWord);
        setLastAddedWord(currentWord);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Prediction failed");
    }
  }, [lastAddedWord]);

  /* ---------- init MediaPipe ---------- */
  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
      selfieMode: true
    });

    hands.onResults((results) => {
      if (!results.multiHandLandmarks?.length) {
        // Clear last word if no hand is detected so we can repeat a word if needed
        setLastAddedWord("");
        return;
      }

      const hand = results.multiHandLandmarks[0];
      const landmarks = hand.flatMap(l => [l.x, l.y, l.z]);
      if (landmarks.length === 63) sendForPrediction(landmarks);
    });

    handsRef.current = hands;
    return () => hands.close();
  }, [sendForPrediction]);

  /* ---------- frame loop ---------- */
  useEffect(() => {
    if (!isCameraOn || !isPredicting) {
        if (frameTimerRef.current) clearInterval(frameTimerRef.current);
        return;
    }
    frameTimerRef.current = setInterval(async () => {
      const video = webcamRef.current?.video;
      if (!video || video.readyState < 4 || isProcessingRef.current) return;
      try {
        isProcessingRef.current = true;
        await handsRef.current.send({ image: video });
      } finally {
        isProcessingRef.current = false;
      }
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(frameTimerRef.current);
  }, [isCameraOn, isPredicting]);

  /* ---------- controls ---------- */
  const startCamera = () => { setIsCameraOn(true); setStatus("Camera active"); };
  const stopCamera = () => {
    setIsCameraOn(false);
    setIsPredicting(false);
    setPrediction("");
    setConfidence(0);
    setStatus("System stopped");
  };
  const togglePrediction = () => {
    if (!isCameraOn) return;
    setIsPredicting(!isPredicting);
    setStatus(!isPredicting ? "Prediction started" : "Prediction paused");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">ISL Gesture Predictor</h1>
          <p className="text-gray-500">Bridge the communication gap with AI-powered Indian Sign Language recognition.</p>
        </header>

        {/* TOP BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
          {["Real-time Detection", "Text-to-Speech", "Sentence Builder"].map((text) => (
            <div key={text} className="py-2 px-4 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
              <span className="text-sm font-semibold text-gray-600">{text}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* LEFT: VIDEO FEED */}
          <div className="relative">
            <div className={`aspect-video rounded-3xl shadow-2xl border-4 transition-all duration-300 ${isPredicting ? 'border-green-500' : 'border-white'}`}>
              {isCameraOn ? (
                <Webcam ref={webcamRef} mirrored audio={false} className="w-full h-115 rounded-3xl object-cover" />
              ) : (
                <div className="w-full h-115 rounded-3xl bg-gray-900 flex flex-col items-center justify-center text-gray-500">
                  <FaVideoSlash size={48} className="mb-4" />
                  <p>Camera is currently offline</p>
                </div>
              )}
            </div>
            <div className={`absolute top-4 left-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-lg ${isPredicting ? 'bg-green-600 animate-pulse' : 'bg-gray-800'}`}>
              {status}
            </div>
          </div>

          {/* RIGHT: INTERFACE */}
          <div className="space-y-6">
            
            {/* ACTION BUTTONS (Kept side-by-side as requested) */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={isCameraOn ? stopCamera : startCamera}
                className={`flex items-center justify-center gap-3 h-16 rounded-2xl font-bold transition-all shadow-lg ${
                    isCameraOn 
                    ? "bg-red-600 text-white border-2 border-red-600 hover:bg-white hover:text-red-500" 
                    : "bg-green-600 text-white hover:bg-green-700"
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

            {/* SENTENCE DISPLAY AREA */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400 uppercase text-xs font-black tracking-widest">Sentence Output</h3>
                <div className="flex gap-2">
                    <button onClick={speakSentence} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Speak Sentence">
                        <FaVolumeUp size={20}/>
                    </button>
                    <button onClick={() => setSentence("")} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Clear Sentence">
                        <FaTrashAlt size={18}/>
                    </button>
                </div>
              </div>
              <div className="min-h-[100px] p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-2xl font-medium text-gray-800 leading-relaxed">
                    {sentence || <span className="text-gray-400 italic text-lg font-normal">Your sentence will appear here...</span>}
                </p>
              </div>
            </div>

            {/* LIVE PREDICTION & CONFIDENCE */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex items-center justify-between">
                <div className="text-center flex-1 border-r border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Current Sign</p>
                    <p className="text-3xl font-black text-gray-800">{prediction || "---"}</p>
                </div>
                <div className="flex-1 pl-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Confidence</span>
                        <span className="text-lg font-bold text-emerald-600">{(confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${confidence * 100}%` }} />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* INSTRUCTIONS & TIPS SECTION */}
        <div className="max-w-6xl mx-auto mt-16 space-y-12 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><span className="text-xl">📖</span></div>
                <h3 className="text-xl font-bold text-gray-800">How to use</h3>
              </div>
              <div className="space-y-6">
                {[
                  { title: "Camera Access", desc: "Turn on your webcam and allow access." },
                  { title: "Form Signs", desc: "Make signs clearly in front of the camera." },
                  { title: "Wait for Accuracy", desc: "The AI adds words to the sentence at 90% confidence." },
                  { title: "Speak & Share", desc: "Click the volume icon to hear your sentence." },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs shrink-0">{idx + 1}</div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: "☀️", label: "Lighting", text: "Bright, front-facing light ensures the best hand tracking.", color: "bg-orange-50" },
                { icon: "🎯", label: "Background", text: "A plain background helps the AI focus on your fingers.", color: "bg-blue-50" },
                { icon: "⏱️", label: "Steady Hand", text: "Hold your gesture for a split second to register the word.", color: "bg-emerald-50" },
                { icon: "📏", label: "Distance", text: "Keep your hand about 1-2 feet away from the lens.", color: "bg-purple-50" },
              ].map((tip, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border border-white shadow-sm ${tip.color}`}>
                  <div className="text-2xl mb-3">{tip.icon}</div>
                  <h4 className="font-bold text-gray-800 mb-1">{tip.label}</h4>
                  <p className="text-sm text-gray-600">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ISLPredictor;