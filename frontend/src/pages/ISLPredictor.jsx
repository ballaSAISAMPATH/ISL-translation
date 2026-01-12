import React, {
  useRef,
  useEffect,
  useState,
  useCallback
} from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Hands } from "@mediapipe/hands";
import { FaVideoSlash } from "react-icons/fa";

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
  <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 m-0 p-0">

    {/* HERO SECTION */}
    <div className=" text-center animate-fade-up flex flex-col ">
      <h1 className="text-4xl md:text-5xl font-extrabold text-black bg-clip-text pt-10 ">
        ISL Gesture Predictor
      </h1>

      <p className="text-lg text-gray-700 text-center py-4 ">
        Real-time Indian Sign Language recognition powered by AI and MediaPipe
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
        {["Real-time Detection", "95%+ Accuracy", "Privacy First"].map((text) => (
          <div
            key={text}
            className="p-1 bg-linear-to-br text-white from-red-600 to-emerald-600 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 animate-scale-in"
          >
            <span className="font-semibold px-2 text-sm text-white">
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* MAIN SECTION */}
    <div className="px-6 md:px-12 pb-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* WEBCAM */}
        <div className="relative animate-scale-in">
          <div
            className={`rounded-3xl shadow-2xl overflow-hidden border-4 transition-all duration-500 ${
              isCameraOn
                ? "border-green-400 ring-4 ring-green-200/50"
                : "border-gray-200 bg-gray-100"
            }`}
          >
            {isCameraOn ? (
              <Webcam
                ref={webcamRef}
                mirrored
                audio={false}
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-125 object-cover"
              />
            ) : (
              <div className=" h-125 flex flex-col items-center justify-center p-10 bg-black">
                <FaVideoSlash className="text-gray-500 text-5xl"/>
                <p className="text-gray-400">Camera is off</p>
              </div>
            )}
          </div>

          {/* STATUS BADGE */}
          <div
            className={`absolute -top-3 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-sm font-semibold shadow-lg ${
              status.includes("successful") || status.includes("started")
                ? "bg-green-500 text-white"
                : status.includes("failed") || status.includes("stopped")
                ? "bg-red-500 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {status}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="space-y-8 animate-fade-up">

          {!isCameraOn ? (
            <button
              onClick={startCamera}
              className="w-full h-20 bg-linear-to-r from-green-500 to-green-600 text-white text-2xl font-bold rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="w-full h-20 bg-linear-to-r from-red-500 to-red-600 text-white text-2xl font-bold rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Stop Camera
            </button>
          )}

          {/* PREDICTION */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
               Current Prediction
            </h3>

            <div className="p-8 bg-gray-100 rounded-2xl text-center shadow-inner mb-6">
             
              <div className="text-4xl font-bold text-gray-800">
                {prediction || "No Gesture"}
              </div>
            </div>

            {/* CONFIDENCE */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Confidence</span>
                <span className="font-mono text-xl font-bold text-green-600">
                  {(confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-linear-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-700"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    {/* Instruction Section */}
    <div>
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
  </div>
);

}

export default ISLPredictor;
