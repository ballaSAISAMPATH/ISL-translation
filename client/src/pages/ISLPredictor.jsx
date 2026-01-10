import React, {
  useRef,
  useEffect,
  useState,
  useCallback
} from "react";
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, []);

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

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: 20 }}>
      <h1>🤖 ISL Gesture Prediction</h1>

      <div style={{ marginBottom: 10 }}>
        {!isCameraOn ? (
          <button onClick={startCamera}>📷 Start Camera</button>
        ) : (
          <button onClick={stopCamera}>❌ Stop Camera</button>
        )}
      </div>

      <p>Status: {status}</p>

      <h2>
        Prediction:{" "}
        <span style={{ color: "green" }}>
          {prediction || "—"}
        </span>
      </h2>

      <p>
        Confidence:{" "}
        {(confidence * 100).toFixed(1)}%
      </p>

      {isCameraOn && (
        <Webcam
          ref={webcamRef}
          mirrored
          audio={false}
          videoConstraints={{ facingMode: "user" }}
          style={{ width: 420, marginTop: 20 }}
        />
      )}
    </div>
  );
}

export default ISLPredictor;
