from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import joblib
import numpy as np
import csv
from datetime import datetime

# LangChain imports
from langchain.messages import HumanMessage, AIMessage, SystemMessage
from langchain_groq import ChatGroq

# ------------------ SETUP ------------------
load_dotenv()

app = Flask(__name__)
CORS(app)

MODEL_PATH = "./gesture_model.pkl"
DATASET_DIR = "dataset"

os.makedirs(DATASET_DIR, exist_ok=True)

# Load ML model
model = joblib.load(MODEL_PATH)

# System prompt (static)
SYSTEM_MESSAGE = SystemMessage(
    content="You are a helpful assistant that translates sign language gestures into text. Respond concisely and accurately."
)

# Groq LLM
chatModel = ChatGroq(
    model="llama-3.1-8b-instant",
    api_key=os.getenv("LANGCHAIN_API_KEY")
)

# ------------------ ROUTES ------------------

@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "ML service running"
    })


# ---------- CHATBOT ----------
@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    query = data.get("query")

    if not query:
        return jsonify({"error": "Query missing"}), 400

    # NEW chat per request (no shared memory bug)
    messages = [
        SYSTEM_MESSAGE,
        HumanMessage(content=query)
    ]

    response = chatModel.invoke(messages)

    return jsonify({
        "reply": response.content
    })


# ---------- GESTURE PREDICTION ----------
@app.route("/predict", methods=["POST"])
def predict_gesture():
    data = request.get_json()
    landmarks = data.get("landmarks")

    if not landmarks or len(landmarks) != 63:
        return jsonify({"error": "Invalid landmarks"}), 400

    X = np.array(landmarks).reshape(1, -1)

    probabilities = model.predict_proba(X)[0]
    confidence = float(max(probabilities))

    THRESHOLD = 0.70

    if confidence > THRESHOLD:
        prediction = model.predict(X)[0]
    else:
        prediction = "None"

    return jsonify({
        "prediction": prediction,
        "confidence": confidence
    })


# ---------- SAVE LANDMARKS ----------
@app.route("/landmarks", methods=["POST"])
def receive_landmarks():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    mode = data.get("mode")
    label = data.get("label")
    landmarks = data.get("landmarks")

    if mode != "train":
        return jsonify({"error": "Invalid mode"}), 400

    if not label:
        return jsonify({"error": "Label missing"}), 400

    if not landmarks or len(landmarks) != 63:
        return jsonify({"error": "Invalid landmarks"}), 400

    csv_path = os.path.join(DATASET_DIR, f"{label}.csv")
    file_exists = os.path.isfile(csv_path)

    with open(csv_path, "a", newline="") as f:
        writer = csv.writer(f)

        if not file_exists:
            header = [f"v{i}" for i in range(63)] + ["timestamp"]
            writer.writerow(header)

        writer.writerow(landmarks + [datetime.now().isoformat()])

    return jsonify({
        "success": True,
        "label": label,
        "samples": 1
    })


# ------------------ RUN ------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
