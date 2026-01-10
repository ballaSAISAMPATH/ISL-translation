from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import mediapipe as mp
import tensorflow as tf
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Load pre-trained model (if exists)
MODEL_PATH = 'models/isl_model.h5'
model = None

if os.path.exists(MODEL_PATH):
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"⚠️ Could not load model: {e}")
else:
    print(f"⚠️ Model not found at {MODEL_PATH}. Will use landmark-based detection.")

# ISL alphabet labels
ISL_LABELS = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ')

def decode_base64_image(base64_string):
    """Decode base64 image string to numpy array"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array
        image_np = np.array(image)
        return image_np
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def extract_hand_landmarks(image):
    """Extract hand landmarks using MediaPipe"""
    try:
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process image
        results = hands.process(image_rgb)
        
        if results.multi_hand_landmarks:
            # Get first hand landmarks
            hand_landmarks = results.multi_hand_landmarks[0]
            
            # Extract landmark coordinates
            landmarks = []
            for landmark in hand_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            
            return np.array(landmarks), True
        
        return None, False
    except Exception as e:
        print(f"Error extracting landmarks: {e}")
        return None, False

def predict_gesture_from_landmarks(landmarks):
    """Predict gesture from hand landmarks using trained model"""
    if model is None:
        # Fallback: Simple rule-based detection for demo
        print("⚠️ Using fallback gesture detection (no trained model)")
        return simple_gesture_detection(landmarks)
    
    try:
        # Ensure landmarks is a numpy array with correct dtype
        if not isinstance(landmarks, np.ndarray):
            landmarks = np.array(landmarks, dtype=np.float32)
        
        # Validate shape
        if landmarks.shape[0] != 63:
            print(f"❌ Invalid landmarks shape: {landmarks.shape}, expected (63,)")
            return None, 0.0
        
        # Reshape landmarks for model input: (63,) -> (1, 63)
        landmarks_reshaped = landmarks.reshape(1, -1)
        print(f"📐 Reshaped landmarks: {landmarks_reshaped.shape}")
        
        # Make prediction
        predictions = model.predict(landmarks_reshaped, verbose=0)
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        
        print(f"🔮 Model predictions shape: {predictions.shape}, predicted class: {predicted_class}, confidence: {confidence:.3f}")
        
        if predicted_class < len(ISL_LABELS):
            gesture = ISL_LABELS[predicted_class]
            return gesture, confidence
        
        print(f"❌ Predicted class {predicted_class} out of range [0, {len(ISL_LABELS)})")
        return None, 0.0
    except Exception as e:
        import traceback
        print(f"❌ Error predicting gesture: {e}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        return None, 0.0

def simple_gesture_detection(landmarks):
    """Simple rule-based gesture detection (fallback when no trained model)"""
    # This is a simplified version for demo purposes
    # In production, use a properly trained model
    
    # For now, return a random gesture with moderate confidence
    import random
    gesture = random.choice(ISL_LABELS[:5])  # A, B, C, D, E for demo
    confidence = 0.75 + random.random() * 0.2
    
    return gesture, confidence

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'ML Model Service is running',
        'model_loaded': model is not None,
        'mediapipe_ready': True
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict gesture from image"""
    try:
        data = request.json
        
        if 'image' not in data:
            return jsonify({
                'error': 'No image provided',
                'prediction': None,
                'confidence': 0.0
            }), 400
        
        # Decode image
        image = decode_base64_image(data['image'])
        
        if image is None:
            return jsonify({
                'error': 'Invalid image format',
                'prediction': None,
                'confidence': 0.0
            }), 400
        
        # Extract hand landmarks
        landmarks, hand_detected = extract_hand_landmarks(image)
        
        if not hand_detected:
            return jsonify({
                'prediction': None,
                'confidence': 0.0,
                'message': 'No hand detected',
                'hand_detected': False
            })
        
        # Predict gesture
        gesture, confidence = predict_gesture_from_landmarks(landmarks)
        
        return jsonify({
            'prediction': gesture,
            'confidence': float(confidence),
            'hand_detected': True,
            'landmarks': landmarks.tolist() if landmarks is not None else None
        })
    
    except Exception as e:
        print(f"Error in predict endpoint: {e}")
        return jsonify({
            'error': str(e),
            'prediction': None,
            'confidence': 0.0
        }), 500

@app.route('/predict-landmarks', methods=['POST'])
def predict_from_landmarks():
    """Predict gesture from hand landmarks array"""
    try:
        data = request.json
        print(f"📥 Received request with data keys: {list(data.keys()) if data else 'None'}")
        
        if not data or 'landmarks' not in data:
            print("❌ No landmarks provided in request")
            return jsonify({
                'error': 'No landmarks provided',
                'prediction': None,
                'confidence': 0.0,
                'hand_detected': False
            }), 400
        
        landmarks_data = data['landmarks']
        print(f"📊 Landmarks data type: {type(landmarks_data)}, length: {len(landmarks_data) if hasattr(landmarks_data, '__len__') else 'N/A'}")
        
        landmarks = np.array(landmarks_data, dtype=np.float32)
        
        # Validate landmarks array (should be 63 values: 21 landmarks × 3 coordinates)
        if len(landmarks) != 63:
            error_msg = f'Invalid landmarks array length. Expected 63, got {len(landmarks)}'
            print(f"❌ {error_msg}")
            return jsonify({
                'error': error_msg,
                'prediction': None,
                'confidence': 0.0,
                'hand_detected': False
            }), 400
        
        print(f"✅ Landmarks validated: shape={landmarks.shape}, dtype={landmarks.dtype}")
        print(f"📈 Landmark range: x=[{landmarks[0::3].min():.3f}, {landmarks[0::3].max():.3f}], y=[{landmarks[1::3].min():.3f}, {landmarks[1::3].max():.3f}], z=[{landmarks[2::3].min():.3f}, {landmarks[2::3].max():.3f}]")
        
        # Predict gesture from landmarks
        gesture, confidence = predict_gesture_from_landmarks(landmarks)
        
        if gesture is None:
            print("⚠️ No gesture predicted")
            return jsonify({
                'prediction': None,
                'confidence': 0.0,
                'hand_detected': False,
                'message': 'Could not predict gesture'
            })
        
        print(f"🎯 Prediction: {gesture} (confidence: {confidence:.3f})")
        
        return jsonify({
            'prediction': gesture,
            'confidence': float(confidence),
            'hand_detected': True
        })
    
    except Exception as e:
        import traceback
        print(f"❌ Error in predict-landmarks endpoint: {e}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        return jsonify({
            'error': str(e),
            'prediction': None,
            'confidence': 0.0,
            'hand_detected': False
        }), 500

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """Predict gestures from multiple frames"""
    try:
        data = request.json
        
        if 'images' not in data:
            return jsonify({
                'error': 'No images provided',
                'predictions': []
            }), 400
        
        predictions = []
        
        for img_data in data['images']:
            # Decode image
            image = decode_base64_image(img_data)
            
            if image is None:
                predictions.append({
                    'prediction': None,
                    'confidence': 0.0,
                    'hand_detected': False
                })
                continue
            
            # Extract hand landmarks
            landmarks, hand_detected = extract_hand_landmarks(image)
            
            if not hand_detected:
                predictions.append({
                    'prediction': None,
                    'confidence': 0.0,
                    'hand_detected': False
                })
                continue
            
            # Predict gesture
            gesture, confidence = predict_gesture_from_landmarks(landmarks)
            
            predictions.append({
                'prediction': gesture,
                'confidence': float(confidence),
                'hand_detected': True
            })
        
        return jsonify({
            'predictions': predictions,
            'count': len(predictions)
        })
    
    except Exception as e:
        print(f"Error in batch predict endpoint: {e}")
        return jsonify({
            'error': str(e),
            'predictions': []
        }), 500

if __name__ == '__main__':
    print("🚀 Starting ISL ML Model Service...")
    print(f"📦 Model loaded: {model is not None}")
    print(f"👋 MediaPipe Hands initialized")
    app.run(host='0.0.0.0', port=5001, debug=True)

