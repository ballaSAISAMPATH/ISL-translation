"""
Helper script to organize collected landmark data into dataset/<label>/ structure
for training the ISL recognition model.
"""

import json
import os
import shutil
from pathlib import Path
import numpy as np
from collections import Counter

def organize_from_collected_data(source_dir='collected_data/landmarks', target_dir='dataset'):
    """
    Organize JSON landmark files from collected_data into dataset/<label>/ structure
    
    Args:
        source_dir: Directory containing JSON landmark files
        target_dir: Target directory for organized dataset
    """
    source_path = Path(source_dir)
    target_path = Path(target_dir)
    
    if not source_path.exists():
        print(f"❌ Source directory not found: {source_path}")
        return
    
    print(f"📂 Organizing dataset from: {source_path}")
    print(f"📁 Target directory: {target_path}")
    
    # Get all JSON files
    json_files = list(source_path.glob("*.json"))
    
    if not json_files:
        print(f"⚠️  No JSON files found in {source_path}")
        return
    
    print(f"📊 Found {len(json_files)} landmark files")
    
    # Create target directory
    target_path.mkdir(exist_ok=True)
    
    label_counts = Counter()
    skipped = 0
    
    for json_file in json_files:
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
            
            # Get label/gesture
            label = data.get('gesture', 'UNKNOWN').upper()
            
            # Get landmarks
            landmarks = data.get('landmarks', [])
            
            # Validate landmarks (must be 63 features)
            if len(landmarks) != 63:
                print(f"⚠️  Skipping {json_file.name}: expected 63 features, got {len(landmarks)}")
                skipped += 1
                continue
            
            # Create label directory
            label_dir = target_path / label
            label_dir.mkdir(exist_ok=True)
            
            # Save as .npy file (more efficient for training)
            output_file = label_dir / f"{json_file.stem}.npy"
            np.save(output_file, np.array(landmarks, dtype=np.float32))
            
            label_counts[label] += 1
            
        except Exception as e:
            print(f"⚠️  Error processing {json_file.name}: {e}")
            skipped += 1
            continue
    
    print(f"\n✅ Dataset organized successfully!")
    print(f"📊 Files organized: {sum(label_counts.values())}")
    print(f"⚠️  Files skipped: {skipped}")
    print(f"\n📈 Files per label:")
    for label, count in sorted(label_counts.items()):
        print(f"   {label}: {count} files")
    
    print(f"\n💡 Next step: Run training script")
    print(f"   python train_isl_model.py --dataset {target_dir}")


def organize_from_npy_files(source_dir='dataset_raw', target_dir='dataset'):
    """
    Organize .npy files that are already named with labels
    Example: A_sample1.npy, B_sample2.npy -> dataset/A/, dataset/B/
    """
    source_path = Path(source_dir)
    target_path = Path(target_dir)
    
    if not source_path.exists():
        print(f"❌ Source directory not found: {source_path}")
        return
    
    print(f"📂 Organizing .npy files from: {source_path}")
    
    npy_files = list(source_path.glob("*.npy"))
    
    if not npy_files:
        print(f"⚠️  No .npy files found in {source_path}")
        return
    
    target_path.mkdir(exist_ok=True)
    label_counts = Counter()
    
    for npy_file in npy_files:
        try:
            # Extract label from filename (assumes format: LABEL_*.npy or LABEL.npy)
            parts = npy_file.stem.split('_')
            label = parts[0].upper()
            
            # Validate file has 63 features
            data = np.load(npy_file)
            if data.size != 63:
                print(f"⚠️  Skipping {npy_file.name}: expected 63 features, got {data.size}")
                continue
            
            # Create label directory and copy file
            label_dir = target_path / label
            label_dir.mkdir(exist_ok=True)
            
            shutil.copy2(npy_file, label_dir / npy_file.name)
            label_counts[label] += 1
            
        except Exception as e:
            print(f"⚠️  Error processing {npy_file.name}: {e}")
            continue
    
    print(f"\n✅ Dataset organized successfully!")
    print(f"📊 Files organized: {sum(label_counts.values())}")
    print(f"\n📈 Files per label:")
    for label, count in sorted(label_counts.items()):
        print(f"   {label}: {count} files")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Organize landmark data into dataset structure')
    parser.add_argument('--source', type=str, default='collected_data/landmarks',
                       help='Source directory with landmark files')
    parser.add_argument('--target', type=str, default='dataset',
                       help='Target directory for organized dataset')
    parser.add_argument('--format', type=str, choices=['json', 'npy'], default='json',
                       help='Source file format')
    
    args = parser.parse_args()
    
    if args.format == 'json':
        organize_from_collected_data(args.source, args.target)
    else:
        organize_from_npy_files(args.source, args.target)


