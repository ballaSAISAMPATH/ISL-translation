"""
Download ISL dataset from Roboflow
This script helps download the Indian Sign Language dataset from Roboflow
and prepares it for conversion to MediaPipe landmark format.
"""

import os
import sys
from pathlib import Path

def download_roboflow_dataset():
    """
    Download dataset from Roboflow using roboflow library
    """
    try:
        from roboflow import Roboflow
    except ImportError:
        print("❌ roboflow library not installed.")
        print("   Install it with: pip install roboflow")
        return False
    
    print("📥 Downloading ISL dataset from Roboflow...")
    print("   Dataset: Indian-Sign-Language")
    print("   URL: https://universe.roboflow.com/school-fzizy/indian-sign-language-fkx1f")
    
    # You need to set your Roboflow API key
    api_key = os.getenv('ROBOFLOW_API_KEY')
    if not api_key:
        print("\n⚠️  ROBOFLOW_API_KEY environment variable not set.")
        print("   Get your API key from: https://app.roboflow.com/")
        print("   Then set it with: set ROBOFLOW_API_KEY=your_key_here (Windows)")
        print("   Or: export ROBOFLOW_API_KEY=your_key_here (Linux/Mac)")
        return False
    
    try:
        rf = Roboflow(api_key=api_key)
        project = rf.workspace("school-fzizy").project("indian-sign-language-fkx1f")
        dataset = project.version(1).download("yolov11")
        
        print(f"✅ Dataset downloaded to: {dataset.location}")
        print(f"\n📁 Dataset structure:")
        print(f"   {dataset.location}/train/images")
        print(f"   {dataset.location}/train/labels")
        print(f"   {dataset.location}/valid/images")
        print(f"   {dataset.location}/valid/labels")
        print(f"   {dataset.location}/test/images")
        print(f"   {dataset.location}/test/labels")
        
        print(f"\n🚀 Next step: Run convert_yolo_dataset.py")
        print(f"   python convert_yolo_dataset.py --dataset {dataset.location}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error downloading dataset: {e}")
        print("\n💡 Alternative: Download manually from Roboflow and extract to a folder")
        return False


def manual_download_instructions():
    """Print manual download instructions"""
    print("\n" + "="*60)
    print("MANUAL DOWNLOAD INSTRUCTIONS")
    print("="*60)
    print("\n1. Visit: https://universe.roboflow.com/school-fzizy/indian-sign-language-fkx1f")
    print("2. Click 'Download' and select 'YOLOv11' format")
    print("3. Extract the downloaded zip file")
    print("4. Run the converter:")
    print("   python convert_yolo_dataset.py --dataset <path_to_extracted_folder>")
    print("\n" + "="*60)


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Download ISL dataset from Roboflow')
    parser.add_argument('--manual', action='store_true',
                       help='Show manual download instructions')
    
    args = parser.parse_args()
    
    if args.manual:
        manual_download_instructions()
        return
    
    # Try to download
    success = download_roboflow_dataset()
    
    if not success:
        manual_download_instructions()


if __name__ == '__main__':
    main()

