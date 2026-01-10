import React, {
  useRef,
  useEffect,
  useState,
  useCallback
} from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Hands } from "@mediapipe/hands";

const MAX_SAMPLES = 20;
const SAMPLE_INTERVAL_MS = 1000; // 1 sample/sec
const FRAME_INTERVAL_MS = 200;   // 5 FPS (checks for hands 5 times a second)

function ISLTrainer() {
  const webcamRef = useRef(null);
  const handsRef = useRef(null);
  const frameTimerRef = useRef(null);

  const lastSampleTimeRef = useRef(0);
  const isProcessingRef = useRef(false);
  const isCapturingRef = useRef(false);

  const [label, setLabel] = useState("");
  const [samples, setSamples] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState("Idle");

  /* ---------- FIX: SYNC CALLBACK REF ---------- */
  // This ref allows the MediaPipe loop to always use the latest 'label' 
  // without needing to restart the whole MediaPipe engine.
  const sendSampleRef = useRef(null);

  /* ---------- send training sample ---------- */
  const sendTrainingSample = useCallback(async (landmarks) => {
    try {
      // Note: Update URL if your Flask port is different
      await axios.post("http://localhost:5001/landmarks", {
        mode: "train",
        label,
        landmarks
      });

      setSamples((prev) => {
        const next = prev + 1;
        setStatus(`Saved ${next} / ${MAX_SAMPLES}`);
        return next;
      });
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to save sample (Check Flask Server)");
    }
  }, [label]);

  // Keep the ref updated with the latest version of the function
  useEffect(() => {
    sendSampleRef.current = sendTrainingSample;
  }, [sendTrainingSample]);

  /* ---------- keep capture state synced ---------- */
  useEffect(() => {
    isCapturingRef.current = isCapturing;
  }, [isCapturing]);

  /* ---------- INIT MEDIAPIPE (ONCE ONLY) ---------- */
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
      // Check if we are currently clicking "Start Capture"
      if (!isCapturingRef.current) return;
      if (!results.multiHandLandmarks) return;

      const now = Date.now();
      // Throttling: only save 1 sample per second
      if (now - lastSampleTimeRef.current < SAMPLE_INTERVAL_MS) return;

      const hand = results.multiHandLandmarks[0];
      if (!hand || hand.length !== 21) return;

      // Flatten 21 landmarks (x, y, z) into a 63-element array
      const landmarks = [];
      for (let i = 0; i < hand.length; i++) {
        landmarks.push(hand[i].x, hand[i].y, hand[i].z);
      }

      if (landmarks.length === 63) {
        lastSampleTimeRef.current = now;
        // Call the current version of our send function
        if (sendSampleRef.current) {
          sendSampleRef.current(landmarks);
        }
      }
    });

    handsRef.current = hands;

    return () => {
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []); // Empty dependency array ensures this only runs once

  /* ---------- FRAME LOOP (only while capturing) ---------- */
  useEffect(() => {
    if (!isCameraOn || !isCapturing) return;

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
        console.warn("MediaPipe Frame Error:", err);
      } finally {
        isProcessingRef.current = false;
      }
    }, FRAME_INTERVAL_MS);

    return () => {
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
      }
    };
  }, [isCameraOn, isCapturing]);

  /* ---------- CONTROLS ---------- */
  const startCamera = () => {
    setIsCameraOn(true);
    setStatus("Camera started");
  };

  const stopCamera = () => {
    setIsCameraOn(false);
    setIsCapturing(false);
    setStatus("Camera stopped");
  };

  const startCapture = () => {
    if (!label) {
      setStatus("❌ Select a gesture first");
      return;
    }
    setSamples(0);
    lastSampleTimeRef.current = 0;
    setIsCapturing(true);
    setStatus("Capturing started...");
  };

  const stopCapture = () => {
    setIsCapturing(false);
    setStatus("Capturing stopped");
  };

  /* ---------- AUTO STOP ---------- */
  useEffect(() => {
    if (samples >= MAX_SAMPLES && isCapturing) {
      setIsCapturing(false);
      setStatus(`✅ Training completed for ${label}`);
    }
  }, [samples, label, isCapturing]);

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🧠 ISL Gesture Trainer</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>Select Gesture: </label>
        <select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={isCapturing}
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          <option value="">-- Select Gesture --</option>
          <option value="THANKS">THANKS</option>
          <option value="SORRY">SORRY</option>
          <option value="IAMFINE">IAMFINE</option>
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        {!isCameraOn ? (
          <button onClick={startCamera} style={btnStyle}>📷 Start Camera</button>
        ) : (
          <button onClick={stopCamera} style={{ ...btnStyle, backgroundColor: "#ff4d4d" }}>❌ Stop Camera</button>
        )}
        &nbsp;
        <button 
          onClick={startCapture} 
          disabled={!isCameraOn || isCapturing || !label}
          style={btnStyle}
        >
          ▶ Start Capture
        </button>
        &nbsp;
        <button 
          onClick={stopCapture} 
          disabled={!isCapturing}
          style={btnStyle}
        >
          ⏹ Stop Capture
        </button>
      </div>

      <div style={{ backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "8px" }}>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Progress:</strong> {samples} / {MAX_SAMPLES}</p>
        <progress value={samples} max={MAX_SAMPLES} style={{ width: "100%" }} />
      </div>

      {isCameraOn && (
        <div style={{ marginTop: "20px" }}>
          <Webcam
            ref={webcamRef}
            mirrored
            audio={false}
            videoConstraints={{ facingMode: "user" }}
            style={{ 
              width: "100%", 
              maxWidth: "500px", 
              borderRadius: "10px",
              border: "4px solid #333" 
            }}
          />
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: "10px 15px",
  cursor: "pointer",
  borderRadius: "5px",
  border: "none",
  backgroundColor: "#007bff",
  color: "white",
  fontWeight: "bold"
};

export default ISLTrainer;