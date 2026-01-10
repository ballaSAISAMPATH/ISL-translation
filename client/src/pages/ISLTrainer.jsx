import React, { useState } from "react";
import axios from "axios";

function ISLTrainer() {
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("");
  const [sampleCount, setSampleCount] = useState(0);

  // This function will be called when landmarks are ready
  const sendTrainingSample = async (landmarks) => {
    if (!label) {
      setStatus("❌ Please select a gesture label first");
      return;
    }

    try {
      await axios.post("/api/ml/landmarks", {
        mode: "train",
        label: label,
        landmarks: landmarks
      });

      setSampleCount((prev) => prev + 1);
      setStatus(`✅ Saved sample ${sampleCount + 1} for ${label}`);
    } catch (err) {
      setStatus("❌ Failed to save training data");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🧠 ISL Gesture Training</h1>

      <label>
        Select Gesture:
        <select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="THANKS">THANKS</option>
          <option value="SORRY">SORRY</option>
          <option value="ILOVEYOU">ILOVEYOU</option>
        </select>
      </label>

      <p>Samples collected: <b>{sampleCount}</b></p>
      <p>{status}</p>

      {/* 
        MediaPipe logic will call:
        sendTrainingSample(landmarksArray)
      */}
    </div>
  );
}

export default ISLTrainer;
