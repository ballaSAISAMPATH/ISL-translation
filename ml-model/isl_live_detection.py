from flask import Flask, render_template, Response, jsonify, request
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import json
import time
from collections import deque
import math
import threading
from io import BytesIO
import base64

app = Flask(__name__)
CORS(app)


class ISLGestureDetector:
    def __init__(self):
        # Initialize Mediapipe Hands
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,  # Allow detection of up to 2 hands
            min_detection_confidence=0.3,  # Lower threshold for better detection
            min_tracking_confidence=0.2   # Lower threshold for better tracking
        )

        # Gesture tracking
        self.gesture_history = deque(maxlen=10)
        self.current_gesture = "No Hand Detected"
        self.confidence = 0.0
        self.gesture_stats = {}
        self.lock = threading.Lock()

        # Landmark indices
        self.THUMB_TIP = 4
        self.THUMB_IP = 3
        self.INDEX_TIP = 8
        self.INDEX_PIP = 6
        self.INDEX_MCP = 5
        self.MIDDLE_TIP = 12
        self.MIDDLE_PIP = 10
        self.MIDDLE_MCP = 9
        self.RING_TIP = 16
        self.RING_PIP = 14
        self.RING_MCP = 13
        self.PINKY_TIP = 20
        self.PINKY_PIP = 18
        self.PINKY_MCP = 17
        self.WRIST = 0

        # ISL Alphabet and gesture mappings
        self.gesture_info = {
            # ISL Alphabet (A-Z)
            "A": {"emoji": "✊", "description": "Closed fist with thumb on side", "category": "alphabet"},
            "B": {"emoji": "✋", "description": "Flat hand, fingers together", "category": "alphabet"},
            "C": {"emoji": "👌", "description": "Curved hand forming C shape", "category": "alphabet"},
            "D": {"emoji": "☝️", "description": "Index finger up, thumb touching middle", "category": "alphabet"},
            "E": {"emoji": "✊", "description": "Closed fist, fingers curled", "category": "alphabet"},
            "F": {"emoji": "👌", "description": "OK sign, index and thumb touching", "category": "alphabet"},
            "G": {"emoji": "👈", "description": "Index finger and thumb extended sideways", "category": "alphabet"},
            "H": {"emoji": "✌️", "description": "Index and middle fingers extended sideways", "category": "alphabet"},
            "I": {"emoji": "🤙", "description": "Pinky finger extended upward", "category": "alphabet"},
            "J": {"emoji": "🤙", "description": "Pinky with motion", "category": "alphabet"},
            "K": {"emoji": "✌️", "description": "Index and middle up, thumb between", "category": "alphabet"},
            "L": {"emoji": "👍", "description": "L shape with thumb and index", "category": "alphabet"},
            "M": {"emoji": "✊", "description": "Fist with thumb under fingers", "category": "alphabet"},
            "N": {"emoji": "✊", "description": "Fist with thumb under two fingers", "category": "alphabet"},
            "O": {"emoji": "👌", "description": "Circle with all fingers", "category": "alphabet"},
            "P": {"emoji": "👇", "description": "Index and middle down, thumb out", "category": "alphabet"},
            "Q": {"emoji": "👇", "description": "Index and thumb pointing down", "category": "alphabet"},
            "R": {"emoji": "🤞", "description": "Index and middle crossed", "category": "alphabet"},
            "S": {"emoji": "✊", "description": "Fist with thumb across fingers", "category": "alphabet"},
            "T": {"emoji": "✊", "description": "Fist with thumb between fingers", "category": "alphabet"},
            "U": {"emoji": "✌️", "description": "Index and middle together pointing up", "category": "alphabet"},
            "V": {"emoji": "✌️", "description": "Index and middle apart, peace sign", "category": "alphabet"},
            "W": {"emoji": "🤟", "description": "Three fingers up", "category": "alphabet"},
            "X": {"emoji": "☝️", "description": "Index bent, hook shape", "category": "alphabet"},
            "Y": {"emoji": "🤙", "description": "Thumb and pinky extended", "category": "alphabet"},
            "Z": {"emoji": "☝️", "description": "Index traces Z in air", "category": "alphabet"},
            
            # Common ISL gestures
            "Namaste": {"emoji": "🙏", "description": "Palms together", "category": "common"},
            "Hello": {"emoji": "👋", "description": "Open hand waving", "category": "common"},
            "Thank You": {"emoji": "🙏", "description": "Hand from chin forward", "category": "common"},
            "Please": {"emoji": "🤲", "description": "Circular motion on chest", "category": "common"},
            "Yes": {"emoji": "👍", "description": "Thumbs up", "category": "common"},
            "No": {"emoji": "👎", "description": "Thumbs down or head shake", "category": "common"},
            "Help": {"emoji": "🆘", "description": "Fist on open palm", "category": "common"},
            "Sorry": {"emoji": "✊", "description": "Fist circling on chest", "category": "common"},
            "Good": {"emoji": "👍", "description": "Thumbs up", "category": "common"},
            "Bad": {"emoji": "👎", "description": "Thumbs down", "category": "common"},
            
            # Numbers
            "One": {"emoji": "☝️", "description": "Index finger extended", "category": "number"},
            "Two": {"emoji": "✌️", "description": "Two fingers extended", "category": "number"},
            "Three": {"emoji": "🤟", "description": "Three fingers extended", "category": "number"},
            "Four": {"emoji": "🖐️", "description": "Four fingers extended", "category": "number"},
            "Five": {"emoji": "🖐️", "description": "All fingers extended", "category": "number"},
            
            # Additional gestures
            "OK": {"emoji": "👌", "description": "Thumb and index finger touching", "category": "gesture"},
            "Peace": {"emoji": "✌️", "description": "Index and middle finger V", "category": "gesture"},
            "Rock On": {"emoji": "🤘", "description": "Index and pinky extended", "category": "gesture"},
            "Call Me": {"emoji": "🤙", "description": "Thumb and pinky extended", "category": "gesture"},
            "I Love You": {"emoji": "🤟", "description": "Thumb, index, and pinky up", "category": "gesture"},
            "Fist": {"emoji": "✊", "description": "All fingers closed", "category": "gesture"},
        }

        print("✅ ISL Gesture Detector initialized successfully!")
        print(f"📚 Loaded {len(self.gesture_info)} gestures")

    def calculate_distance(self, point1, point2):
        """Calculate Euclidean distance between two landmarks"""
        return math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2)

    def calculate_angle(self, p1, p2, p3):
        """Calculate angle between three points"""
        v1 = np.array([p1.x - p2.x, p1.y - p2.y])
        v2 = np.array([p3.x - p2.x, p3.y - p2.y])
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))
        return np.degrees(angle)

    def is_finger_extended(self, landmarks, tip_id, pip_id, mcp_id=None):
        """Check if finger is extended with more sensitive detection"""
        tip = landmarks[tip_id]
        pip = landmarks[pip_id]

        if mcp_id:
            mcp = landmarks[mcp_id]
            # More lenient detection - allow for slight variations
            return tip.y < pip.y + 0.02 and pip.y < mcp.y + 0.02
        else:
            return tip.y < pip.y + 0.02

    def is_thumb_extended(self, landmarks):
        """Special check for thumb extension with more sensitive detection"""
        thumb_tip = landmarks[self.THUMB_TIP]
        thumb_ip = landmarks[self.THUMB_IP]
        index_mcp = landmarks[self.INDEX_MCP]
        # More lenient thumb detection
        return (thumb_tip.x > thumb_ip.x - 0.02 and thumb_tip.y < index_mcp.y + 0.02)

    def classify_gesture(self, landmarks):
        """Enhanced ISL gesture classification"""
        try:
            # Get finger states with debugging
            thumb_up = self.is_thumb_extended(landmarks)
            index_up = self.is_finger_extended(landmarks, self.INDEX_TIP, self.INDEX_PIP, self.INDEX_MCP)
            middle_up = self.is_finger_extended(landmarks, self.MIDDLE_TIP, self.MIDDLE_PIP, self.MIDDLE_MCP)
            ring_up = self.is_finger_extended(landmarks, self.RING_TIP, self.RING_PIP, self.RING_MCP)
            pinky_up = self.is_finger_extended(landmarks, self.PINKY_TIP, self.PINKY_PIP, self.PINKY_MCP)
            
            # Debug finger states
            print(f"🔍 Finger states: Thumb={thumb_up}, Index={index_up}, Middle={middle_up}, Ring={ring_up}, Pinky={pinky_up}")

            # Calculate key distances
            thumb_index_dist = self.calculate_distance(landmarks[self.THUMB_TIP], landmarks[self.INDEX_TIP])
            thumb_middle_dist = self.calculate_distance(landmarks[self.THUMB_TIP], landmarks[self.MIDDLE_TIP])

            # ISL Alphabet Detection
            
            # A - Closed fist with thumb on side
            if not thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
                thumb_tip = landmarks[self.THUMB_TIP]
                index_mcp = landmarks[self.INDEX_MCP]
                if abs(thumb_tip.y - index_mcp.y) < 0.05:
                    return "A"
                return "Fist"

            # B - Flat hand, all fingers up, thumb closed
            if not thumb_up and index_up and middle_up and ring_up and pinky_up:
                # Check if fingers are together
                index_middle_dist = self.calculate_distance(landmarks[self.INDEX_TIP], landmarks[self.MIDDLE_TIP])
                if index_middle_dist < 0.05:
                    return "B"
                return "Four"

            # C - Curved hand forming C shape
            if thumb_up and index_up and middle_up and ring_up and pinky_up:
                # Check if hand is curved
                if thumb_index_dist > 0.1 and thumb_index_dist < 0.25:
                    return "C"
                return "Five"

            # D - Index finger up, thumb touching middle finger
            if not thumb_up and index_up and not middle_up and not ring_up and not pinky_up:
                thumb_middle_dist = self.calculate_distance(landmarks[self.THUMB_TIP], landmarks[self.MIDDLE_TIP])
                if thumb_middle_dist < 0.06:
                    return "D"
                return "One"

            # F / OK - Index and thumb touching (OK sign) - Enhanced detection
            if thumb_index_dist < 0.05 and middle_up and ring_up and pinky_up:
                # Additional check for OK sign - thumb and index should be close
                thumb_tip = landmarks[self.THUMB_TIP]
                index_tip = landmarks[self.INDEX_TIP]
                # Check if thumb and index are forming a circle
                if abs(thumb_tip.x - index_tip.x) < 0.03 and abs(thumb_tip.y - index_tip.y) < 0.03:
                    return "OK"
                return "F"

            # G - Index and thumb extended sideways
            if thumb_up and index_up and not middle_up and not ring_up and not pinky_up:
                # Check if pointing sideways
                index_angle = self.calculate_angle(landmarks[self.INDEX_TIP], landmarks[self.INDEX_PIP],
                                                   landmarks[self.INDEX_MCP])
                if index_angle > 160:
                    return "G"
                return "L"

            # H/Peace/V - Index and middle extended
            if not thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                index_middle_dist = self.calculate_distance(landmarks[self.INDEX_TIP], landmarks[self.MIDDLE_TIP])
                if index_middle_dist > 0.08:
                    return "V"
                return "H"

            # I / Y (Shaka) - Pinky and thumb extended
            if thumb_up and not index_up and not middle_up and not ring_up and pinky_up:
                thumb_pinky_dist = self.calculate_distance(landmarks[self.THUMB_TIP], landmarks[self.PINKY_TIP])
                if thumb_pinky_dist > 0.15:
                    return "Y"
                return "I"

            # L - L shape with thumb and index
            if thumb_up and index_up and not middle_up and not ring_up and not pinky_up:
                angle = self.calculate_angle(landmarks[self.THUMB_TIP], landmarks[self.WRIST], landmarks[self.INDEX_TIP])
                if 70 < angle < 110:
                    return "L"

            # R - Index and middle crossed
            if not thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                # Check if fingers are crossed
                index_middle_dist = self.calculate_distance(landmarks[self.INDEX_PIP], landmarks[self.MIDDLE_PIP])
                if index_middle_dist < 0.03:
                    return "R"

            # U - Index and middle together pointing up
            if not thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                index_middle_dist = self.calculate_distance(landmarks[self.INDEX_TIP], landmarks[self.MIDDLE_TIP])
                if index_middle_dist < 0.05:
                    return "U"

            # W - Three fingers up (thumb, index, middle)
            if thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                return "W"

            # I Love You - Thumb, index, and pinky up
            if thumb_up and index_up and not middle_up and not ring_up and pinky_up:
                return "I Love You"

            # Namaste - Palms together (detected by hand position)
            if thumb_up and index_up and middle_up and ring_up and pinky_up:
                wrist = landmarks[self.WRIST]
                middle_tip = landmarks[self.MIDDLE_TIP]
                if middle_tip.y < wrist.y - 0.2:
                    return "Namaste"

            # Numbers
            if not thumb_up and index_up and not middle_up and not ring_up and not pinky_up:
                return "One"
            
            if not thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                angle = self.calculate_angle(landmarks[self.INDEX_TIP], landmarks[self.INDEX_MCP],
                                             landmarks[self.MIDDLE_TIP])
                if 30 < angle < 90:
                    return "Two"

            if thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                return "Three"

            if not thumb_up and index_up and middle_up and ring_up and pinky_up:
                return "Four"

            if thumb_up and index_up and middle_up and ring_up and pinky_up:
                return "Five"

            # OK Sign - Enhanced detection with high confidence
            if thumb_index_dist < 0.06 and middle_up and ring_up and pinky_up:
                # Check if thumb and index are very close (forming a circle)
                thumb_tip = landmarks[self.THUMB_TIP]
                index_tip = landmarks[self.INDEX_TIP]
                distance = self.calculate_distance(thumb_tip, index_tip)
                if distance < 0.04:  # Very close thumb and index
                    return "OK"

            # Peace
            if not thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                return "Peace"

            # Rock On
            if not thumb_up and index_up and not middle_up and not ring_up and pinky_up:
                return "Rock On"

            # Yes (Thumbs Up)
            if thumb_up and not index_up and not middle_up and not ring_up and not pinky_up:
                thumb_tip = landmarks[self.THUMB_TIP]
                thumb_ip = landmarks[self.THUMB_IP]
                if thumb_tip.y < thumb_ip.y:
                    return "Yes"

            # No (Thumbs Down)
            thumb_tip = landmarks[self.THUMB_TIP]
            thumb_ip = landmarks[self.THUMB_IP]
            if (thumb_tip.y > thumb_ip.y and thumb_tip.x < thumb_ip.x and
                    not index_up and not middle_up and not ring_up and not pinky_up):
                return "No"

            # Fallback: Simple gesture detection
            # If we have any fingers up, try basic gestures
            fingers_up = sum([index_up, middle_up, ring_up, pinky_up])
            
            if thumb_up and fingers_up == 0:
                return "Thumbs Up"
            elif not thumb_up and index_up and not middle_up and not ring_up and not pinky_up:
                return "One"
            elif not thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                return "Two"
            elif thumb_up and index_up and middle_up and not ring_up and not pinky_up:
                return "Three"
            elif not thumb_up and index_up and middle_up and ring_up and pinky_up:
                return "Four"
            elif thumb_up and index_up and middle_up and ring_up and pinky_up:
                return "Five"
            elif fingers_up == 0:
                return "Fist"
            
            return "Unknown"

        except Exception as e:
            print(f"Error in gesture classification: {e}")
            return "Unknown"

    def smooth_gesture(self, gesture):
        """Smooth gesture detection using history"""
        with self.lock:
            self.gesture_history.append(gesture)

            gesture_counts = {}
            for g in self.gesture_history:
                gesture_counts[g] = gesture_counts.get(g, 0) + 1

            most_common = max(gesture_counts, key=gesture_counts.get)
            confidence = gesture_counts[most_common] / len(self.gesture_history)

            if gesture_counts[most_common] >= 2:
                self.confidence = confidence
                return most_common

            self.confidence = 0.0
            return "Unknown"

    def process_frame(self, frame):
        """Process frame for gesture detection"""
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = self.hands.process(rgb_frame)

            if result.multi_hand_landmarks:
                # Process the first (most confident) hand
                hand_landmarks = result.multi_hand_landmarks[0]
                
                # Draw landmarks
                self.mp_drawing.draw_landmarks(
                    frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(0, 255, 255), thickness=2, circle_radius=2),
                    self.mp_drawing.DrawingSpec(color=(255, 0, 255), thickness=2)
                )
                
                # Add bounding box and confidence display like reference image
                h, w, c = frame.shape
                x_coords = [landmark.x for landmark in hand_landmarks.landmark]
                y_coords = [landmark.y for landmark in hand_landmarks.landmark]
                
                # Calculate bounding box
                x_min, x_max = int(min(x_coords) * w), int(max(x_coords) * w)
                y_min, y_max = int(min(y_coords) * h), int(max(y_coords) * h)
                
                # Draw green bounding box (like reference)
                cv2.rectangle(frame, (x_min-10, y_min-10), (x_max+10, y_max+10), (0, 255, 0), 2)
                
                # Add confidence label above the box
                confidence_text = f"hand ({self.confidence:.2f})"
                cv2.putText(frame, confidence_text, (x_min-10, y_min-20), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                # Classify gesture with improved sensitivity
                raw_gesture = self.classify_gesture(hand_landmarks.landmark)
                self.current_gesture = self.smooth_gesture(raw_gesture)
                
                # Set confidence based on hand detection with high confidence for clear gestures
                if self.current_gesture == "OK":
                    self.confidence = 0.99  # High confidence for OK sign
                elif self.current_gesture in ["Thumbs Up", "One", "Two", "Three", "Four", "Five", "Fist"]:
                    self.confidence = 0.95  # Very high confidence for basic gestures
                elif self.current_gesture != "Unknown":
                    self.confidence = 0.85  # High confidence for other detected gestures
                else:
                    self.confidence = 0.3  # Low confidence for unknown

                # Update statistics
                if self.current_gesture != "Unknown" and self.current_gesture != "No Hand Detected":
                    with self.lock:
                        self.gesture_stats[self.current_gesture] = self.gesture_stats.get(
                            self.current_gesture, 0) + 1
            else:
                self.current_gesture = "No Hand Detected"
                self.confidence = 0.0

            return frame

        except Exception as e:
            print(f"Error processing frame: {e}")
            import traceback
            traceback.print_exc()
            return frame

    def process_image(self, image_data):
        """Process single image for gesture detection"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            img_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return None, False, 0.0
            
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = self.hands.process(rgb_frame)

            if result.multi_hand_landmarks:
                hand_landmarks = result.multi_hand_landmarks[0]
                raw_gesture = self.classify_gesture(hand_landmarks.landmark)
                gesture = self.smooth_gesture(raw_gesture)
                
                return gesture, True, self.confidence
            
            return None, False, 0.0

        except Exception as e:
            print(f"Error processing image: {e}")
            return None, False, 0.0

    def get_current_status(self):
        """Get current detection status"""
        with self.lock:
            hand_detected = self.current_gesture != "No Hand Detected"
            return {
                'current_gesture': self.current_gesture,
                'confidence': round(self.confidence, 3),
                'hand_detected': hand_detected,
                'stats': dict(self.gesture_stats)
            }

    def clear_statistics(self):
        """Clear detection statistics"""
        with self.lock:
            self.gesture_stats.clear()
            self.gesture_history.clear()
            print("Statistics cleared")


# Initialize detector
detector = ISLGestureDetector()


# Flask Routes
@app.route('/')
def index():
    """Render main page"""
    return render_template('isl_detection.html')


@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'ISL Detection Service is running',
        'gestures_loaded': len(detector.gesture_info)
    })


@app.route('/gestures')
def get_gestures():
    """Get available gestures information"""
    return jsonify(detector.gesture_info)


@app.route('/status')
def get_status():
    """Get current detection status"""
    return jsonify(detector.get_current_status())


@app.route('/clear_stats', methods=['POST'])
def clear_stats():
    """Clear detection statistics"""
    detector.clear_statistics()
    return jsonify({'success': True, 'message': 'Statistics cleared'})


@app.route('/process_frame', methods=['POST'])
def process_frame():
    """Process a single frame sent from the browser"""
    try:
        if 'frame' not in request.files:
            return jsonify({'error': 'No frame provided'}), 400
        
        file = request.files['frame']
        
        # Read image file
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Failed to decode frame'}), 400
        
        # Process frame for gesture detection
        detector.process_frame(frame)
        
        # Get current status
        status = detector.get_current_status()
        
        return jsonify(status)
        
    except Exception as e:
        print(f"Error processing frame: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/detect_gesture', methods=['POST'])
def detect_gesture():
    """Detect gesture from base64 image (for React frontend)"""
    try:
        data = request.json
        
        if 'imageData' not in data:
            return jsonify({
                'error': 'No image provided',
                'hand_detected': False
            }), 400
        
        # Process image
        gesture, hand_detected, confidence = detector.process_image(data['imageData'])
        
        if not hand_detected:
            return jsonify({
                'hand_detected': False,
                'message': 'No hand detected. Please show your hand clearly to the camera.',
                'gesture': None,
                'confidence': 0.0
            })
        
        # Map gesture to single character for alphabet
        gesture_char = gesture
        if len(gesture) == 1:  # Single letter
            gesture_char = gesture
        elif gesture in ["One", "Two", "Three", "Four", "Five"]:
            gesture_char = {"One": "1", "Two": "2", "Three": "3", "Four": "4", "Five": "5"}[gesture]
        elif gesture == "Yes":
            gesture_char = "👍"
        elif gesture == "No":
            gesture_char = "👎"
        else:
            gesture_char = gesture[0] if gesture else "?"
        
        return jsonify({
            'hand_detected': True,
            'gesture': gesture_char,
            'gesture_full': gesture,
            'confidence': float(confidence),
            'message': f'Detected: {gesture}'
        })
    
    except Exception as e:
        print(f"Error in detect_gesture: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'hand_detected': False
        }), 500


# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Page not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting ISL Live Detection Service")
    print("=" * 60)
    print(f"📚 Available gestures: {len(detector.gesture_info)}")
    print(f"🔤 Alphabets: {len([g for g in detector.gesture_info.values() if g.get('category') == 'alphabet'])}")
    print(f"🔢 Numbers: {len([g for g in detector.gesture_info.values() if g.get('category') == 'number'])}")
    print(f"🤝 Common: {len([g for g in detector.gesture_info.values() if g.get('category') == 'common'])}")
    print("=" * 60)
    print("🌐 Access the application at: http://localhost:5003")
    print("🎯 API Health Check: http://localhost:5003/health")
    print("📋 Available Gestures: http://localhost:5003/gestures")
    print("=" * 60)
    print("\n⚠️  IMPORTANT: Please allow camera access when prompted by your browser")
    print("\n💡 Tips for best results:")
    print("   • Ensure good lighting")
    print("   • Use plain background")
    print("   • Keep hand centered in frame")
    print("   • Hold gestures steady for 1-2 seconds")
    print("=" * 60)

    try:
        app.run(debug=True, threaded=True, host='0.0.0.0', port=5003)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down...")
    except Exception as e:
        print(f"\n❌ Error starting application: {e}")
    finally:
        print("👋 Application closed.")

