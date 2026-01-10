"""
TensorFlow Training Script for Indian Sign Language Recognition
Loads MediaPipe hand landmark datasets from dataset/<label>/ folders
Trains a dense neural network for ISL gesture classification
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import os
import json
import pickle
from pathlib import Path
from collections import Counter
import matplotlib.pyplot as plt
from datetime import datetime

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

class ISLModelTrainer:
    def __init__(self, dataset_dir='dataset', models_dir='models'):
        """
        Initialize the ISL Model Trainer
        
        Args:
            dataset_dir: Directory containing label subdirectories (e.g., dataset/A/, dataset/B/)
            models_dir: Directory to save trained models
        """
        self.dataset_dir = Path(dataset_dir)
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(exist_ok=True)
        
        self.X = []
        self.y = []
        self.label_encoder = LabelEncoder()
        
    def load_dataset(self):
        """
        Load MediaPipe hand landmark datasets from dataset/<label>/ folders
        Each sample should have 63 features (21 landmarks × 3 coordinates)
        
        Supports:
        - .npy files (NumPy arrays)
        - .json files (JSON arrays)
        - .txt files (space/comma-separated values)
        """
        print("📂 Loading dataset from:", self.dataset_dir)
        
        if not self.dataset_dir.exists():
            raise FileNotFoundError(f"Dataset directory not found: {self.dataset_dir}")
        
        # Get all label directories
        label_dirs = [d for d in self.dataset_dir.iterdir() if d.is_dir()]
        
        if not label_dirs:
            raise ValueError(f"No label directories found in {self.dataset_dir}")
        
        print(f"📊 Found {len(label_dirs)} label directories")
        
        total_samples = 0
        label_counts = {}
        
        for label_dir in sorted(label_dirs):
            label = label_dir.name.upper()  # Use directory name as label
            label_counts[label] = 0
            
            # Find all data files in this label directory
            data_files = []
            
            # Look for .npy files
            data_files.extend(list(label_dir.glob("*.npy")))
            
            # Look for .json files
            data_files.extend(list(label_dir.glob("*.json")))
            
            # Look for .txt files
            data_files.extend(list(label_dir.glob("*.txt")))
            
            if not data_files:
                print(f"⚠️  No data files found in {label_dir}")
                continue
            
            print(f"📁 Loading {len(data_files)} samples from '{label}'...")
            
            for file_path in data_files:
                try:
                    landmarks = self._load_landmark_file(file_path)
                    
                    if landmarks is not None:
                        # Validate shape: must be 63 features
                        if len(landmarks) != 63:
                            print(f"⚠️  Skipping {file_path.name}: expected 63 features, got {len(landmarks)}")
                            continue
                        
                        self.X.append(landmarks)
                        self.y.append(label)
                        label_counts[label] += 1
                        total_samples += 1
                        
                except Exception as e:
                    print(f"⚠️  Error loading {file_path.name}: {e}")
                    continue
        
        if total_samples == 0:
            raise ValueError("No valid samples loaded from dataset!")
        
        # Convert to numpy arrays
        self.X = np.array(self.X, dtype=np.float32)
        self.y = np.array(self.y)
        
        print(f"\n✅ Dataset loaded successfully!")
        print(f"📊 Total samples: {total_samples}")
        print(f"📊 Features per sample: {self.X.shape[1]} (should be 63)")
        print(f"📊 Number of classes: {len(set(self.y))}")
        print(f"\n📈 Samples per class:")
        for label, count in sorted(label_counts.items()):
            print(f"   {label}: {count} samples")
        
        return self.X, self.y
    
    def _load_landmark_file(self, file_path):
        """Load landmarks from a single file (supports .npy, .json, .txt)"""
        suffix = file_path.suffix.lower()
        
        if suffix == '.npy':
            # NumPy array file
            landmarks = np.load(file_path)
            return landmarks.flatten() if landmarks.ndim > 1 else landmarks
            
        elif suffix == '.json':
            # JSON file
            with open(file_path, 'r') as f:
                data = json.load(f)
                # Handle different JSON structures
                if isinstance(data, list):
                    landmarks = np.array(data, dtype=np.float32)
                elif isinstance(data, dict) and 'landmarks' in data:
                    landmarks = np.array(data['landmarks'], dtype=np.float32)
                else:
                    return None
                return landmarks.flatten() if landmarks.ndim > 1 else landmarks
                
        elif suffix == '.txt':
            # Text file (space or comma separated)
            with open(file_path, 'r') as f:
                content = f.read().strip()
                # Try comma-separated first, then space-separated
                if ',' in content:
                    values = [float(x.strip()) for x in content.split(',')]
                else:
                    values = [float(x) for x in content.split()]
                return np.array(values, dtype=np.float32)
        
        return None
    
    def create_model(self, input_shape=(63,), num_classes=None):
        """
        Create a dense neural network model for ISL gesture classification
        
        Architecture:
        - Input: 63 features (21 landmarks × 3 coordinates)
        - Dense layers with dropout for regularization
        - Output: Softmax for multi-class classification
        """
        if num_classes is None:
            num_classes = len(set(self.y))
        
        print(f"\n📐 Creating model architecture...")
        print(f"   Input shape: {input_shape}")
        print(f"   Number of classes: {num_classes}")
        
        model = keras.Sequential([
            keras.layers.Input(shape=input_shape, name='input_layer'),
            
            # First dense layer
            keras.layers.Dense(256, activation='relu', name='dense_1'),
            keras.layers.BatchNormalization(name='bn_1'),
            keras.layers.Dropout(0.4, name='dropout_1'),
            
            # Second dense layer
            keras.layers.Dense(128, activation='relu', name='dense_2'),
            keras.layers.BatchNormalization(name='bn_2'),
            keras.layers.Dropout(0.3, name='dropout_2'),
            
            # Third dense layer
            keras.layers.Dense(64, activation='relu', name='dense_3'),
            keras.layers.Dropout(0.2, name='dropout_3'),
            
            # Output layer
            keras.layers.Dense(num_classes, activation='softmax', name='output_layer')
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        return model
    
    def train(self, test_size=0.2, validation_split=0.2, epochs=100, batch_size=32):
        """
        Train the ISL recognition model
        
        Args:
            test_size: Proportion of data to use for testing
            validation_split: Proportion of training data to use for validation
            epochs: Number of training epochs
            batch_size: Batch size for training
        """
        print("\n🚀 Starting ISL Model Training...")
        
        # Load dataset
        X, y = self.load_dataset()
        
        # Encode labels
        y_encoded = self.label_encoder.fit_transform(y)
        num_classes = len(self.label_encoder.classes_)
        
        print(f"\n📊 Label encoding:")
        print(f"   Classes: {self.label_encoder.classes_}")
        print(f"   Number of classes: {num_classes}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded,
            test_size=test_size,
            random_state=42,
            stratify=y_encoded
        )
        
        print(f"\n📊 Data split:")
        print(f"   Training set: {len(X_train)} samples")
        print(f"   Test set: {len(X_test)} samples")
        print(f"   Validation split: {validation_split * 100}% of training data")
        
        # Create model
        model = self.create_model(input_shape=(X.shape[1],), num_classes=num_classes)
        
        print("\n📐 Model Architecture:")
        model.summary()
        
        # Training callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True,
                verbose=1
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=8,
                min_lr=1e-7,
                verbose=1
            ),
            keras.callbacks.ModelCheckpoint(
                filepath=str(self.models_dir / 'best_model.h5'),
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Train model
        print("\n🏋️  Training model...")
        history = model.fit(
            X_train, y_train,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        # Evaluate on test set
        print("\n📊 Evaluating on test set...")
        test_loss, test_accuracy, test_top3_accuracy = model.evaluate(
            X_test, y_test, verbose=0
        )
        
        print(f"✅ Test Accuracy: {test_accuracy * 100:.2f}%")
        print(f"✅ Test Top-3 Accuracy: {test_top3_accuracy * 100:.2f}%")
        print(f"✅ Test Loss: {test_loss:.4f}")
        
        # Generate predictions for detailed analysis
        y_pred = model.predict(X_test, verbose=0)
        y_pred_classes = np.argmax(y_pred, axis=1)
        
        # Classification report
        print("\n📈 Detailed Classification Report:")
        print(classification_report(
            y_test, y_pred_classes,
            target_names=self.label_encoder.classes_
        ))
        
        # Save model and metadata
        self._save_model_and_metadata(model, history, test_accuracy, test_loss)
        
        return model, history
    
    def _save_model_and_metadata(self, model, history, test_accuracy, test_loss):
        """Save trained model and training metadata"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save model
        model_path = self.models_dir / 'isl_model.h5'
        model.save(str(model_path))
        print(f"\n💾 Model saved to: {model_path}")
        
        # Save label encoder
        label_encoder_path = self.models_dir / 'label_encoder.json'
        with open(label_encoder_path, 'w') as f:
            json.dump({
                'classes': self.label_encoder.classes_.tolist(),
                'class_to_index': {
                    cls: int(idx) for idx, cls in enumerate(self.label_encoder.classes_)
                },
                'index_to_class': {
                    int(idx): cls for idx, cls in enumerate(self.label_encoder.classes_)
                }
            }, f, indent=2)
        print(f"💾 Label encoder saved to: {label_encoder_path}")
        
        # Save training history
        history_path = self.models_dir / 'training_history.json'
        with open(history_path, 'w') as f:
            json.dump({
                'accuracy': [float(x) for x in history.history['accuracy']],
                'val_accuracy': [float(x) for x in history.history['val_accuracy']],
                'loss': [float(x) for x in history.history['loss']],
                'val_loss': [float(x) for x in history.history['val_loss']],
                'top_3_accuracy': [float(x) for x in history.history.get('top_3_accuracy', [])],
                'val_top_3_accuracy': [float(x) for x in history.history.get('val_top_3_accuracy', [])]
            }, f, indent=2)
        print(f"💾 Training history saved to: {history_path}")
        
        # Save training metadata
        metadata_path = self.models_dir / 'training_metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump({
                'timestamp': timestamp,
                'dataset_dir': str(self.dataset_dir),
                'model_info': {
                    'input_shape': model.input_shape,
                    'output_shape': model.output_shape,
                    'total_params': int(model.count_params()),
                    'architecture': 'Dense Neural Network'
                },
                'training_info': {
                    'total_samples': len(self.X),
                    'num_classes': len(self.label_encoder.classes_),
                    'classes': self.label_encoder.classes_.tolist(),
                    'test_accuracy': float(test_accuracy),
                    'test_loss': float(test_loss)
                },
                'dataset_stats': {
                    'samples_per_class': dict(Counter(self.y))
                }
            }, f, indent=2)
        print(f"💾 Training metadata saved to: {metadata_path}")
        
        print("\n🎉 Training complete! All files saved to:", self.models_dir)


def main():
    """Main training function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train ISL recognition model from MediaPipe landmarks')
    parser.add_argument('--dataset', type=str, default='dataset',
                       help='Directory containing label subdirectories (default: dataset)')
    parser.add_argument('--models', type=str, default='models',
                       help='Directory to save trained models (default: models)')
    parser.add_argument('--epochs', type=int, default=100,
                       help='Number of training epochs (default: 100)')
    parser.add_argument('--batch-size', type=int, default=32,
                       help='Batch size for training (default: 32)')
    parser.add_argument('--test-size', type=float, default=0.2,
                       help='Proportion of data for testing (default: 0.2)')
    parser.add_argument('--val-split', type=float, default=0.2,
                       help='Proportion of training data for validation (default: 0.2)')
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = ISLModelTrainer(dataset_dir=args.dataset, models_dir=args.models)
    
    # Train model
    model, history = trainer.train(
        test_size=args.test_size,
        validation_split=args.val_split,
        epochs=args.epochs,
        batch_size=args.batch_size
    )
    
    print("\n✅ Training completed successfully!")
    print(f"📁 Model saved to: {args.models}/isl_model.h5")
    print(f"📁 Labels saved to: {args.models}/label_encoder.json")


if __name__ == '__main__':
    main()


