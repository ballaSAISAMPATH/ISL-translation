from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import numpy as np
import csv
from datetime import datetime

app = Flask(__name__)
CORS(app)
MODEL_PATH = "./gesture_model.pkl"
model = joblib.load(MODEL_PATH)

DATASET_DIR = "dataset"
os.makedirs(DATASET_DIR, exist_ok=True)

@app.route("/predict", methods=["POST"])
def predict_gesture():
    print("hiiii")
    data = request.get_json()
    print("RAW DATA:", data)
    landmarks = data.get("landmarks")
    print("Incoming landmarks length:", len(landmarks) if landmarks else None)
    print("Incoming landmarks sample:", landmarks[:6] if landmarks else None)

    if not landmarks or len(landmarks) != 63:
        return jsonify({"error": "Invalid landmarks"}), 400

    X = np.array(landmarks).reshape(1, -1)

    prediction = model.predict(X)[0]
    confidence = max(model.predict_proba(X)[0])

    return jsonify({
        "prediction": prediction,
        "confidence": float(confidence)
    })


@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "ML service running"
    })

@app.route("/landmarks", methods=["POST"])
def receive_landmarks():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    mode = data.get("mode")
    label = data.get("label")
    landmarks = data.get("landmarks")

    # -------- validation --------
    if mode != "train":
        return jsonify({"error": "Invalid mode"}), 400

    if not label:
        return jsonify({"error": "Label missing"}), 400

    if not landmarks or len(landmarks) != 63:
        return jsonify({"error": "Invalid landmarks"}), 400

    # -------- save to CSV --------
    csv_path = os.path.join(DATASET_DIR, f"{label}.csv")
    file_exists = os.path.isfile(csv_path)

    with open(csv_path, "a", newline="") as f:
        writer = csv.writer(f)

        # optional header
        if not file_exists:
            header = [f"v{i}" for i in range(63)] + ["timestamp"]
            writer.writerow(header)

        writer.writerow(landmarks + [datetime.now().isoformat()])

    return jsonify({
        "success": True,
        "label": label,
        "samples": 1
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
