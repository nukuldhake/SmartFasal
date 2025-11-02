@echo off
REM Smart Fasal Backend Startup Script for Windows
REM This script starts both crop disease prediction and crop health analysis services

echo 🌾 Starting Smart Fasal Backend Services...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip is not installed. Please install pip first.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd /d "%~dp0backend"

REM Check if requirements.txt exists
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found in backend directory
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Check if model files exist
if not exist "models\plant_disease" (
    echo ❌ ML model not found. Please ensure the model files are in backend\models\
    pause
    exit /b 1
)

if not exist "models\class_indices.json" (
    echo ❌ Class indices file not found. Please ensure class_indices.json is in backend\models\
    pause
    exit /b 1
)

REM Set environment variables
set FLASK_ENV=development
set DEBUG=True
set PORT=5000
set CROP_DISEASE_API_URL=http://localhost:5000
set CROP_HEALTH_API_URL=http://localhost:5001

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo # Flask Configuration
        echo FLASK_ENV=development
        echo DEBUG=True
        echo PORT=5000
        echo.
        echo # ML Model Configuration
        echo MODEL_PATH=backend/models/plant_disease
        echo CLASS_INDICES_PATH=backend/models/class_indices.json
        echo.
        echo # API Configuration
        echo CROP_DISEASE_API_URL=http://localhost:5000
        echo CROP_HEALTH_API_URL=http://localhost:5001
        echo.
        echo # Database Configuration ^(Add your Supabase credentials^)
        echo SUPABASE_URL=your_supabase_url_here
        echo SUPABASE_SERVICE_KEY=your_supabase_service_key_here
        echo.
        echo # Logging Configuration
        echo LOG_LEVEL=INFO
    ) > .env
    echo ⚠️  Please update .env file with your Supabase credentials
)

echo.
echo 🚀 Starting Crop Disease Prediction Service on port 5000...
start "Crop Disease Service" python api\crop_disease_api.py

echo 🚀 Starting Crop Health Analysis Service on port 5001...
start "Crop Health Service" python api\crop_health_api.py

echo.
echo 🎉 Smart Fasal Backend Services are starting!
echo.
echo 📊 Service URLs:
echo    Crop Disease API: http://localhost:5000
echo    Crop Health API:  http://localhost:5001
echo.
echo 📚 API Documentation:
echo    GET  http://localhost:5000/health          - Crop Disease Service Health
echo    GET  http://localhost:5000/model/info     - Model Information
echo    POST http://localhost:5000/predict        - Single Image Prediction
echo    POST http://localhost:5000/predict/batch  - Batch Image Prediction
echo    GET  http://localhost:5000/classes        - Available Disease Classes
echo.
echo    GET  http://localhost:5001/health         - Crop Health Service Health
echo    POST http://localhost:5001/analyze        - Analyze Crop Health
echo    GET  http://localhost:5001/analyses       - Get User Analyses
echo    GET  http://localhost:5001/statistics     - Get Crop Health Statistics
echo.
echo 🔄 Services are running in separate windows. Close those windows to stop services.
echo.
pause
