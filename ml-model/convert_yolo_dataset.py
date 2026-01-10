"""
Convert YOLO format ISL dataset to MediaPipe landmark format
This script processes images from the Indian Sign Language YOLO dataset
and extracts hand landmarks for training the ISL recognition model.
"""

import cv2
import numpy as np
import json
import os
import mediapipe as mp
from pathlib import Path
from tqdm import tqdm
import shutil
from datetime import datetime

class YOLODatasetConverter:
    def __init__(self, yolo_dataset_path, output_dir="collected_data"):
        """
        Initialize converter
        
        Args:
            yolo_dataset_path: Path to YOLO dataset directory (should contain train/val/test folders with images/ and labels/ subfolders)
            output_dir: Output directory for converted landmark data
        """
        self.yolo_dataset_path = Path(yolo_dataset_path)
        self.output_dir = Path(output_dir)
        
        # Create output directories
        self.landmarks_dir = self.output_dir / "landmarks"
        self.metadata_dir = self.output_dir / "metadata"
        self.raw_images_dir = self.output_dir / "raw_images"
        
        for dir_path in [self.landmarks_dir, self.metadata_dir, self.raw_images_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize MediaPipe
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Load class names from data.yaml
        self.class_names = self.load_class_names()
        
        # Statistics
        self.stats = {
            'total_images': 0,
            'processed_images': 0,
            'failed_images': 0,
            'gesture_counts': {},
            'no_hand_detected': 0
        }
    
    def load_class_names(self):
        """Load class names from data.yaml or use default"""
        yaml_path = self.yolo_dataset_path / "data.yaml"
        
        if yaml_path.exists():
            try:
                import yaml
                with open(yaml_path, 'r') as f:
                    data = yaml.safe_load(f)
                    if 'names' in data:
                        return data['names']
            except Exception as e:
                print(f"⚠️ Could not load data.yaml: {e}")
        
        # Default class names from the dataset
        return ['Bad', 'Brother', 'Father', 'Food', 'Friend', 'Good', 'Hello', 'Help', 
                'House', 'I', 'Indian', 'Loud', 'Mummy', 'Namaste', 'Name', 'No', 
                'Place', 'Please', 'Quiet', 'Sleeping', 'Sorry', 'Strong', 'Thank-you', 
                'Time', 'Today', 'Water', 'What', 'Yes', 'Your', 'language', 'sign', 'you']
    
    def extract_hand_landmarks(self, image_path):
        """
        Extract hand landmarks from image using MediaPipe
        
        Returns:
            landmarks: Array of 63 values (21 landmarks × 3 coordinates) or None
            success: Boolean indicating if hand was detected
        """
        try:
            # Read image
            image = cv2.imread(str(image_path))
            if image is None:
                return None, False
            
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.hands.process(image_rgb)
            
            if results.multi_hand_landmarks:
                # Get first hand landmarks
                hand_landmarks = results.multi_hand_landmarks[0]
                
                # Extract landmark coordinates
                landmarks = []
                for landmark in hand_landmarks.landmark:
                    landmarks.extend([landmark.x, landmark.y, landmark.z])
                
                return np.array(landmarks), True
            else:
                return None, False
                
        except Exception as e:
            print(f"Error processing {image_path}: {e}")
            return None, False
    
    def get_label_from_yolo(self, label_path, image_width, image_height):
        """
        Read YOLO format label file and return the class name
        
        YOLO format: class_id center_x center_y width height (normalized)
        """
        try:
            if not label_path.exists():
                return None
            
            with open(label_path, 'r') as f:
                lines = f.readlines()
                if not lines:
                    return None
                
                # Get first label (assuming single hand per image)
                line = lines[0].strip().split()
                if len(line) < 5:
                    return None
                
                class_id = int(line[0])
                if 0 <= class_id < len(self.class_names):
                    return self.class_names[class_id]
                else:
                    return f"class_{class_id}"
                    
        except Exception as e:
            print(f"Error reading label {label_path}: {e}")
            return None
    
    def process_dataset_split(self, split_name='train'):
        """
        Process a dataset split (train/val/test)
        
        Args:
            split_name: Name of the split to process
        """
        print(f"\n📂 Processing {split_name} split...")
        
        # Look for images directory
        images_dir = self.yolo_dataset_path / split_name / "images"
        if not images_dir.exists():
            # Try alternative structure
            images_dir = self.yolo_dataset_path / f"{split_name}_images"
            if not images_dir.exists():
                print(f"⚠️ {split_name} images directory not found")
                return
        
        # Look for labels directory
        labels_dir = self.yolo_dataset_path / split_name / "labels"
        if not labels_dir.exists():
            labels_dir = self.yolo_dataset_path / f"{split_name}_labels"
            if not labels_dir.exists():
                print(f"⚠️ {split_name} labels directory not found, processing images without labels")
                labels_dir = None
        
        # Get all image files
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
        image_files = []
        for ext in image_extensions:
            image_files.extend(list(images_dir.glob(f"*{ext}")))
            image_files.extend(list(images_dir.glob(f"*{ext.upper()}")))
        
        if not image_files:
            print(f"⚠️ No images found in {images_dir}")
            return
        
        print(f"Found {len(image_files)} images")
        
        # Process each image
        for image_path in tqdm(image_files, desc=f"Processing {split_name}"):
            self.stats['total_images'] += 1
            
            # Get corresponding label
            label_name = image_path.stem + '.txt'
            label_path = labels_dir / label_name if labels_dir else None
            
            # Get gesture name from label
            gesture_name = None
            if label_path and label_path.exists():
                # Read image to get dimensions
                image = cv2.imread(str(image_path))
                if image is not None:
                    h, w = image.shape[:2]
                    gesture_name = self.get_label_from_yolo(label_path, w, h)
            
            # If no label, try to infer from filename or use 'unknown'
            if not gesture_name:
                # Try to extract gesture from filename
                filename_lower = image_path.stem.lower()
                for class_name in self.class_names:
                    if class_name.lower() in filename_lower:
                        gesture_name = class_name
                        break
                
                if not gesture_name:
                    gesture_name = 'unknown'
            
            # Extract hand landmarks
            landmarks, success = self.extract_hand_landmarks(image_path)
            
            if success and landmarks is not None:
                # Save landmark data
                sample_id = f"{split_name}_{image_path.stem}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                
                # Copy image to raw_images
                output_image_path = self.raw_images_dir / f"{sample_id}.jpg"
                shutil.copy2(image_path, output_image_path)
                
                # Save landmarks
                landmark_data = {
                    'landmarks': landmarks.tolist(),
                    'gesture': gesture_name,
                    'category': 'common_words' if gesture_name in self.class_names else 'other',
                    'signer_id': 'yolo_dataset',
                    'timestamp': datetime.now().isoformat(),
                    'image_path': str(output_image_path),
                    'source': split_name,
                    'original_path': str(image_path)
                }
                
                landmark_file = self.landmarks_dir / f"{sample_id}.json"
                with open(landmark_file, 'w') as f:
                    json.dump(landmark_data, f, indent=2)
                
                self.stats['processed_images'] += 1
                self.stats['gesture_counts'][gesture_name] = self.stats['gesture_counts'].get(gesture_name, 0) + 1
            else:
                self.stats['failed_images'] += 1
                if not success:
                    self.stats['no_hand_detected'] += 1
    
    def process_all_splits(self):
        """Process all dataset splits"""
        print("🚀 Starting YOLO Dataset Conversion...")
        print(f"📁 Dataset path: {self.yolo_dataset_path}")
        print(f"📁 Output path: {self.output_dir}")
        print(f"📊 Class names: {len(self.class_names)} classes")
        
        # Process train, val, and test splits
        for split in ['train', 'val', 'test']:
            self.process_dataset_split(split)
        
        # Save statistics
        self.save_statistics()
        
        print("\n✅ Conversion Complete!")
        print(f"📊 Total images: {self.stats['total_images']}")
        print(f"✅ Processed: {self.stats['processed_images']}")
        print(f"❌ Failed: {self.stats['failed_images']}")
        print(f"👋 No hand detected: {self.stats['no_hand_detected']}")
        print(f"📈 Gesture distribution:")
        for gesture, count in sorted(self.stats['gesture_counts'].items(), key=lambda x: x[1], reverse=True):
            print(f"  {gesture}: {count}")
    
    def save_statistics(self):
        """Save conversion statistics"""
        stats_data = {
            'conversion_date': datetime.now().isoformat(),
            'source_dataset': str(self.yolo_dataset_path),
            'statistics': self.stats,
            'class_names': self.class_names,
            'output_directory': str(self.output_dir)
        }
        
        stats_file = self.metadata_dir / "conversion_stats.json"
        with open(stats_file, 'w') as f:
            json.dump(stats_data, f, indent=2)
        
        print(f"\n📊 Statistics saved to {stats_file}")


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert YOLO ISL dataset to MediaPipe landmark format')
    parser.add_argument('--dataset', type=str, 
                       default='dataset_extracted/Indian-Sign-Language-Detection-main',
                       help='Path to YOLO dataset directory')
    parser.add_argument('--output', type=str, 
                       default='collected_data',
                       help='Output directory for converted data')
    
    args = parser.parse_args()
    
    # Check if dataset path exists
    dataset_path = Path(args.dataset)
    if not dataset_path.exists():
        print(f"❌ Dataset path not found: {dataset_path}")
        print("\n💡 Note: The YOLO dataset zip file contains metadata but not the actual images.")
        print("   You need to download the dataset from Roboflow:")
        print("   https://universe.roboflow.com/school-fzizy/indian-sign-language-fkx1f")
        print("\n   Or provide the path to a local YOLO dataset with train/val/test folders.")
        return
    
    # Initialize converter
    converter = YOLODatasetConverter(dataset_path, args.output)
    
    # Process dataset
    converter.process_all_splits()


if __name__ == '__main__':
    main()

