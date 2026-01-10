@echo off
echo ========================================
echo   ISL Hand Landmark Data Collection
echo ========================================
echo.
echo Starting data collection script...
echo.
echo Instructions:
echo   - Press A-Z to set label (gesture letter)
echo   - Press SPACE to collect sample
echo   - Press C to clear label
echo   - Press Q to quit
echo.
python collect_isl_landmarks.py
pause



