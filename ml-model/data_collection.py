"""
Real ISL Data Collection System
Collects authentic Indian Sign Language gestures from diverse signers
"""

import cv2
import numpy as np
import json
import os
import time
from datetime import datetime
import mediapipe as mp
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

class ISLDataCollector:
    def __init__(self):
        # Initialize MediaPipe
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Data collection settings
        self.collection_dir = "collected_data"
        self.samples_per_gesture = 50  # Minimum samples per gesture
        self.current_gesture = None
        self.current_signer = None
        self.sample_count = 0
        
        # Create directories
        os.makedirs(self.collection_dir, exist_ok=True)
        os.makedirs(f"{self.collection_dir}/raw_images", exist_ok=True)
        os.makedirs(f"{self.collection_dir}/landmarks", exist_ok=True)
        os.makedirs(f"{self.collection_dir}/metadata", exist_ok=True)
        
        # ISL gestures to collect
        self.isl_gestures = {
            'alphabet': list('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
            'numbers': list('0123456789'),
            'common_words': ['HELLO', 'THANK_YOU', 'YES', 'NO', 'PLEASE', 'SORRY', 'GOOD', 'BAD', 'HAPPY', 'SAD']
        }
        
        # Signer demographics tracking
        self.signer_demographics = {}
        
    def start_collection_session(self, signer_id, demographics):
        """Start a new data collection session for a signer"""
        self.current_signer = signer_id
        self.signer_demographics[signer_id] = {
            'age': demographics.get('age'),
            'gender': demographics.get('gender'),
            'signing_experience': demographics.get('signing_experience', 'beginner'),
            'hearing_status': demographics.get('hearing_status', 'deaf'),
            'region': demographics.get('region', 'India'),
            'collection_date': datetime.now().isoformat(),
            'gestures_collected': []
        }
        
        return {
            'status': 'session_started',
            'signer_id': signer_id,
            'gestures_to_collect': self.isl_gestures
        }
    
    def collect_gesture_sample(self, image_data, gesture, category='alphabet'):
        """Collect a single gesture sample with validation"""
        try:
            # Decode image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(BytesIO(image_bytes))
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            img_array = np.array(image)
            
            # Process with MediaPipe
            rgb_image = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            results = self.hands.process(cv2.cvtColor(rgb_image, cv2.COLOR_BGR2RGB))
            
            if results.multi_hand_landmarks:
                # Extract landmarks
                landmarks = results.multi_hand_landmarks[0]
                landmark_data = []
                
                for landmark in landmarks.landmark:
                    landmark_data.extend([landmark.x, landmark.y, landmark.z])
                
                # Save sample
                sample_id = f"{self.current_signer}_{gesture}_{category}_{int(time.time())}"
                
                # Save raw image
                image_path = f"{self.collection_dir}/raw_images/{sample_id}.jpg"
                cv2.imwrite(image_path, rgb_image)
                
                # Save landmarks
                landmark_path = f"{self.collection_dir}/landmarks/{sample_id}.json"
                with open(landmark_path, 'w') as f:
                    json.dump({
                        'landmarks': landmark_data,
                        'gesture': gesture,
                        'category': category,
                        'signer_id': self.current_signer,
                        'timestamp': datetime.now().isoformat(),
                        'image_path': image_path
                    }, f)
                
                # Update signer data
                if gesture not in self.signer_demographics[self.current_signer]['gestures_collected']:
                    self.signer_demographics[self.current_signer]['gestures_collected'].append(gesture)
                
                self.sample_count += 1
                
                return {
                    'status': 'sample_collected',
                    'sample_id': sample_id,
                    'gesture': gesture,
                    'signer_id': self.current_signer,
                    'sample_count': self.sample_count,
                    'landmarks_detected': True
                }
            else:
                return {
                    'status': 'no_hand_detected',
                    'message': 'Please ensure your hand is clearly visible in the frame'
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def validate_gesture_quality(self, landmarks, gesture):
        """Validate gesture quality and authenticity"""
        quality_score = 0
        issues = []
        
        # Check landmark completeness
        if len(landmarks) != 63:  # 21 landmarks * 3 coordinates
            issues.append("Incomplete landmark data")
            return 0, issues
        
        # Check for reasonable hand position
        wrist_y = landmarks[1]  # Y coordinate of wrist
        finger_tips = [landmarks[i] for i in [4, 8, 12, 16, 20]]  # Finger tip Y coordinates
        
        # Fingers should generally be above wrist
        for i, tip_y in enumerate(finger_tips):
            if tip_y > wrist_y + 0.1:  # Allow some tolerance
                issues.append(f"Finger {i+1} appears below wrist")
        
        # Calculate quality score
        if not issues:
            quality_score = 1.0
        elif len(issues) == 1:
            quality_score = 0.7
        else:
            quality_score = 0.3
        
        return quality_score, issues
    
    def get_collection_progress(self):
        """Get current collection progress"""
        if not self.current_signer:
            return {'status': 'no_active_session'}
        
        total_gestures = len(self.isl_gestures['alphabet']) + len(self.isl_gestures['numbers']) + len(self.isl_gestures['common_words'])
        collected_gestures = len(self.signer_demographics[self.current_signer]['gestures_collected'])
        
        return {
            'signer_id': self.current_signer,
            'total_gestures': total_gestures,
            'collected_gestures': collected_gestures,
            'progress_percentage': (collected_gestures / total_gestures) * 100,
            'gestures_collected': self.signer_demographics[self.current_signer]['gestures_collected']
        }
    
    def export_collected_data(self):
        """Export all collected data for training"""
        export_data = {
            'collection_metadata': {
                'total_signers': len(self.signer_demographics),
                'collection_period': {
                    'start': min([data['collection_date'] for data in self.signer_demographics.values()]),
                    'end': max([data['collection_date'] for data in self.signer_demographics.values()])
                },
                'total_samples': len(os.listdir(f"{self.collection_dir}/landmarks"))
            },
            'signer_demographics': self.signer_demographics,
            'gesture_categories': self.isl_gestures
        }
        
        # Save metadata
        with open(f"{self.collection_dir}/metadata/collection_summary.json", 'w') as f:
            json.dump(export_data, f, indent=2)
        
        return export_data

# Initialize collector
collector = ISLDataCollector()

@app.route('/')
def index():
    return render_template('data_collection.html')

@app.route('/api/start_session', methods=['POST'])
def start_session():
    data = request.json
    signer_id = data.get('signer_id')
    demographics = data.get('demographics', {})
    
    result = collector.start_collection_session(signer_id, demographics)
    return jsonify(result)

@app.route('/api/collect_sample', methods=['POST'])
def collect_sample():
    data = request.json
    image_data = data.get('image_data')
    gesture = data.get('gesture')
    category = data.get('category', 'alphabet')
    
    result = collector.collect_gesture_sample(image_data, gesture, category)
    return jsonify(result)

@app.route('/api/progress', methods=['GET'])
def get_progress():
    result = collector.get_collection_progress()
    return jsonify(result)

@app.route('/api/export_data', methods=['GET'])
def export_data():
    result = collector.export_collected_data()
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5002)
