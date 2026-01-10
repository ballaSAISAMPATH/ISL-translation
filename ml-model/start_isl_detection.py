"""
ISL Live Detection Launcher
Quick launcher script for ISL detection service
"""

import webbrowser
import time
import sys
import subprocess
import os
import platform

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = ['flask', 'cv2', 'mediapipe', 'numpy']
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'cv2':
                __import__('cv2')
            else:
                __import__(package)
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print("\n⚠️  Missing dependencies detected!")
        print("\n📦 To install missing packages, run:")
        print("   pip install -r requirements_isl.txt")
        return False
    
    print("\n✅ All dependencies are installed!")
    return True

def check_port(port=5001):
    """Check if port is available"""
    import socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result != 0  # True if port is available
    except:
        return True

def main():
    print("=" * 70)
    print("🤟 ISL LIVE DETECTION - Launcher")
    print("=" * 70)
    print()
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Cannot start - dependencies missing")
        print("\n📝 Installation steps:")
        print("   1. Open terminal in the ml-model folder")
        print("   2. Run: pip install -r requirements_isl.txt")
        print("   3. Run this script again")
        input("\nPress Enter to exit...")
        return
    
    print()
    print("=" * 70)
    print("🚀 Starting ISL Detection Service...")
    print("=" * 70)
    
    # Check if port is available
    if not check_port(5001):
        print("\n⚠️  Port 5001 is already in use!")
        print("   There might already be a service running.")
        print("\n   Options:")
        print("   1. Stop the existing service on port 5001")
        print("   2. Edit isl_live_detection.py to use a different port")
        input("\nPress Enter to exit...")
        return
    
    print("\n📍 Service will run on: http://localhost:5001")
    print("📹 Camera: Will request permission when you open the page")
    print("\n💡 Tips:")
    print("   • Ensure good lighting")
    print("   • Use a plain background")
    print("   • Keep your hand centered in frame")
    print("   • Hold gestures steady for 1-2 seconds")
    print("\n" + "=" * 70)
    print("\n⏳ Starting server (this may take a moment)...")
    
    # Wait a bit
    time.sleep(2)
    
    # Start the Flask app
    try:
        # Change to ml-model directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        
        print("\n🌐 Opening browser in 3 seconds...")
        print("   URL: http://localhost:5001")
        
        # Open browser after a delay
        def open_browser():
            time.sleep(3)
            print("\n✅ Opening browser...")
            webbrowser.open('http://localhost:5001')
            print("\n📖 If browser doesn't open automatically, go to: http://localhost:5001")
            print("\n" + "=" * 70)
            print("✨ ISL Detection is now running!")
            print("=" * 70)
            print("\n🎯 Available Gestures:")
            print("   • ISL Alphabet (A-Z)")
            print("   • Numbers (1-5)")
            print("   • Common signs (Hello, Thank You, Yes, No, etc.)")
            print("\n⚠️  To stop the server: Press Ctrl+C")
            print("=" * 70)
        
        import threading
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        # Run Flask app
        print("\n🔄 Starting Flask server...")
        print()
        
        from isl_live_detection import app
        app.run(debug=False, threaded=True, host='0.0.0.0', port=5001)
        
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print("🛑 Shutting down ISL Detection Service...")
        print("=" * 70)
        print("✅ Server stopped successfully")
        print("👋 Thank you for using ISL Live Detection!")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n\n❌ Error starting server: {e}")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure you're in the ml-model directory")
        print("   2. Check if all dependencies are installed")
        print("   3. Check if port 5001 is available")
        print("   4. Try running directly: python isl_live_detection.py")
        input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()

