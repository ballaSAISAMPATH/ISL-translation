#!/bin/bash

echo "============================================================"
echo "ISL LIVE DETECTION - Linux/Mac Launcher"
echo "============================================================"
echo

cd "$(dirname "$0")"

python3 start_isl_detection.py

echo
echo "============================================================"
echo
read -p "Press Enter to exit..."

