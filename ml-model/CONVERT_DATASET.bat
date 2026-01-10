@echo off
echo ========================================
echo ISL Dataset Converter
echo ========================================
echo.

REM Check if dataset path is provided
if "%1"=="" (
    echo Usage: CONVERT_DATASET.bat [dataset_path]
    echo.
    echo Example: CONVERT_DATASET.bat "dataset_extracted\Indian-Sign-Language-Detection-main"
    echo.
    echo If no path provided, will use default: dataset_extracted\Indian-Sign-Language-Detection-main
    echo.
    set DATASET_PATH=dataset_extracted\Indian-Sign-Language-Detection-main
) else (
    set DATASET_PATH=%1
)

echo Converting dataset from: %DATASET_PATH%
echo.

python convert_yolo_dataset.py --dataset "%DATASET_PATH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Conversion Complete!
    echo ========================================
    echo.
    echo Next step: Train the model
    echo   python real_isl_trainer.py
    echo.
) else (
    echo.
    echo ========================================
    echo Conversion Failed
    echo ========================================
    echo.
    echo Please check:
    echo   1. Dataset path is correct
    echo   2. Dataset contains train/val/test folders with images
    echo   3. Python and required packages are installed
    echo.
)

pause

