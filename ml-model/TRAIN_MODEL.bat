@echo off
echo ========================================
echo   ISL Model Training Script
echo ========================================
echo.

REM Check if dataset directory exists
if not exist "dataset" (
    echo [ERROR] Dataset directory not found!
    echo.
    echo Please organize your data into dataset/<label>/ folders
    echo Example structure:
    echo   dataset/
    echo   ├── A/
    echo   │   ├── sample1.npy
    echo   │   └── sample2.npy
    echo   ├── B/
    echo   │   └── ...
    echo.
    echo You can use organize_dataset.py to organize collected data:
    echo   python organize_dataset.py
    echo.
    pause
    exit /b 1
)

echo Starting training...
echo.

python train_isl_model.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Training Complete!
    echo ========================================
    echo.
    echo Model saved to: models/isl_model.h5
    echo Labels saved to: models/label_encoder.json
    echo.
) else (
    echo.
    echo ========================================
    echo   Training Failed
    echo ========================================
    echo.
    echo Please check:
    echo   1. Dataset structure is correct
    echo   2. Each sample has 63 features
    echo   3. Python and TensorFlow are installed
    echo.
)

pause


