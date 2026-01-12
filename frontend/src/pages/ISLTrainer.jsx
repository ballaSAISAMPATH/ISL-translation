import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Hands } from "@mediapipe/hands";
import { FaVideoSlash, FaCamera, FaStop, FaPlus, FaTrash, FaMicrochip, FaDatabase } from "react-icons/fa";

const MAX_SAMPLES = 20;
const SAMPLE_INTERVAL_MS = 1000; 
const FRAME_INTERVAL_MS = 200;  

function ISLTrainer() {
  const webcamRef = useRef(null);
  const handsRef = useRef(null);
  const frameTimerRef = useRef(null);
  const lastSampleTimeRef = useRef(0);
  const isProcessingRef = useRef(false);
  const isCapturingRef = useRef(false);
  const sendSampleRef = useRef(null);

  // States
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState("System Ready");
  const [samples, setSamples] = useState(0);
  
  // Dynamic Label Management
  const [gestures, setGestures] = useState(["THANKS", "SORRY", "IAMFINE"]);
  const [newGestureInput, setNewGestureInput] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  /* ---------- send training sample ---------- */
  const sendTrainingSample = useCallback(async (landmarks) => {
    try {
      await axios.post("http://localhost:5001/landmarks", {
        mode: "train",
        label: selectedLabel,
        landmarks
      });

      setSamples((prev) => {
        const next = prev + 1;
        setStatus(`Recording: Sample ${next}/${MAX_SAMPLES}`);
        return next;
      });
    } catch (err) {
      setStatus("❌ Server Error (Check Flask)");
    }
  }, [selectedLabel]);

  useEffect(() => { sendSampleRef.current = sendTrainingSample; }, [sendTrainingSample]);
  useEffect(() => { isCapturingRef.current = isCapturing; }, [isCapturing]);

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
      if (!isCapturingRef.current || !results.multiHandLandmarks) return;

      const now = Date.now();
      if (now - lastSampleTimeRef.current < SAMPLE_INTERVAL_MS) return;

      const hand = results.multiHandLandmarks[0];
      if (!hand || hand.length !== 21) return;

      const landmarks = hand.flatMap(l => [l.x, l.y, l.z]);
      if (landmarks.length === 63) {
        lastSampleTimeRef.current = now;
        if (sendSampleRef.current) sendSampleRef.current(landmarks);
      }
    });

    handsRef.current = hands;
    return () => hands.current?.close();
  }, []);

  /* ---------- frame loop ---------- */
  useEffect(() => {
    if (!isCameraOn || !isCapturing) return;

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
  }, [isCameraOn, isCapturing]);

  /* ---------- UI CONTROLS ---------- */
  const handleAddGesture = () => {
    const formatted = newGestureInput.toUpperCase().trim();
    if (formatted && !gestures.includes(formatted)) {
      setGestures([...gestures, formatted]);
      setNewGestureInput("");
    }
  };

  const removeGesture = (g) => {
    setGestures(gestures.filter(item => item !== g));
    if (selectedLabel === g) setSelectedLabel("");
  };

  const startCapture = () => {
    if (!selectedLabel) return setStatus("⚠️ Select a label first");
    setSamples(0);
    setIsCapturing(true);
  };

  useEffect(() => {
    if (samples >= MAX_SAMPLES && isCapturing) {
      setIsCapturing(false);
      setStatus(`✅ Success: ${selectedLabel} Trained`);
    }
  }, [samples, selectedLabel, isCapturing]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HEADER */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <FaMicrochip />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">ISL Trainer <span className="text-indigo-600 underline decoration-2">PRO</span></span>
          </div>
          <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isCapturing ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
            {status}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: CAMERA WORKSPACE */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group">
              <div className={`aspect-video bg-slate-900 rounded-[2.5rem]  shadow-3xl border-[6px] transition-all duration-500 ${isCapturing ? 'border-red-500/30 ring-8 ring-red-500/10' : 'border-white'}`}>
                {isCameraOn ? (
                  <Webcam ref={webcamRef} mirrored audio={false} className="w-full h-115 rounded-3xl object-cover" />
                ) : (
                  <div className="w-full h-115 rounded-3xl flex flex-col items-center justify-center text-slate-500">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4"><FaVideoSlash size={32} /></div>
                    <p className="font-medium">Camera Feed Offline</p>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                <button 
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    className={`px-8 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transition-all active:scale-95 ${isCameraOn ? 'bg-white text-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                    {isCameraOn ? <><FaStop /> Stop Camera</> : <><FaCamera /> Start Camera</>}
                </button>
              </div>
            </div>

            {/* TRAINING PROGRESS CARD */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Dataset Progress</h3>
                        <p className="text-slate-800 font-bold">{selectedLabel || "No Label Selected"}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-indigo-600">{samples}</span>
                        <span className="text-slate-400 font-bold"> / {MAX_SAMPLES}</span>
                    </div>
                </div>
                <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden p-1.5 border border-slate-200">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(samples / MAX_SAMPLES) * 100}%` }}
                    />
                </div>
                <p className="mt-4 text-xs text-slate-400 italic text-center">Capturing 1 sample every second automatically...</p>
            </div>
          </div>

          {/* RIGHT: LABEL MANAGER */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* ADD NEW GESTURE */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Add New Gesture</h3>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newGestureInput}
                        onChange={(e) => setNewGestureInput(e.target.value)}
                        placeholder="E.g. HELLO"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold uppercase"
                    />
                    <button onClick={handleAddGesture} className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"><FaPlus /></button>
                </div>
            </div>

            {/* GESTURE LIST */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 flex-1">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Training Labels</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {gestures.map((g) => (
                        <div 
                            key={g} 
                            onClick={() => !isCapturing && setSelectedLabel(g)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedLabel === g ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                            <span className={`font-bold ${selectedLabel === g ? 'text-indigo-700' : 'text-slate-600'}`}>{g}</span>
                            <div className="flex items-center gap-3">
                                {selectedLabel === g && <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />}
                                <button onClick={(e) => { e.stopPropagation(); removeGesture(g); }} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={isCapturing ? () => setIsCapturing(false) : startCapture}
                    disabled={!isCameraOn || !selectedLabel}
                    className={`w-full mt-8 py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                        isCapturing 
                        ? 'bg-red-500 text-white shadow-red-200' 
                        : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isCapturing ? <><FaStop /> Stop Recording</> : <><FaDatabase /> Start Recording</>}
                </button>
            </div>

            {/* TIPS CARD */}
            <div className="bg-slate-800 rounded-[2rem] p-8 text-white">
                <div className="flex items-center gap-3 mb-4 text-indigo-400">
                    <span className="text-2xl">💡</span>
                    <h4 className="font-bold uppercase tracking-widest text-xs">Training Tip</h4>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Vary your hand position slightly between samples (tilt, distance, angle). This makes the AI model much more robust.
                </p>
            </div>

          </div>
        </div>
      </main>

      <footer className="mt-12 py-8 text-center text-slate-400 text-xs border-t border-slate-200">
          DATASET BUILDER v2.0 • ENSURE BACKEND IS RUNNING ON PORT 5001
      </footer>
    </div>
  );
}

export default ISLTrainer;