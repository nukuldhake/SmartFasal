#!/bin/bash

# Smart Fasal Backend Startup Script
# This script starts both crop disease prediction and crop health analysis services

echo "🌾 Starting Smart Fasal Backend Services..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found in backend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if model files exist
if [ ! -d "models/plant_disease" ]; then
    echo "❌ ML model not found. Please ensure the model files are in backend/models/"
    exit 1
fi

if [ ! -f "models/class_indices.json" ]; then
    echo "❌ Class indices file not found. Please ensure class_indices.json is in backend/models/"
    exit 1
fi

# Set environment variables
export FLASK_ENV=development
export DEBUG=True
export PORT=5000
export CROP_DISEASE_API_URL=http://localhost:5000
export CROP_HEALTH_API_URL=http://localhost:5001

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Flask Configuration
FLASK_ENV=development
DEBUG=True
PORT=5000

# ML Model Configuration
MODEL_PATH=backend/models/plant_disease
CLASS_INDICES_PATH=backend/models/class_indices.json

# API Configuration
CROP_DISEASE_API_URL=http://localhost:5000
CROP_HEALTH_API_URL=http://localhost:5001

# Database Configuration (Add your Supabase credentials)
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# Logging Configuration
LOG_LEVEL=INFO
EOF
    echo "⚠️  Please update .env file with your Supabase credentials"
fi

# Function to start crop disease service
start_crop_disease_service() {
    echo "🚀 Starting Crop Disease Prediction Service on port 5000..."
    python3 api/crop_disease_api.py &
    CROP_DISEASE_PID=$!
    echo "✅ Crop Disease Service started with PID: $CROP_DISEASE_PID"
}

# Function to start crop health service
start_crop_health_service() {
    echo "🚀 Starting Crop Health Analysis Service on port 5001..."
    python3 api/crop_health_api.py &
    CROP_HEALTH_PID=$!
    echo "✅ Crop Health Service started with PID: $CROP_HEALTH_PID"
}

# Function to check if services are running
check_services() {
    echo "🔍 Checking service health..."
    
    # Wait a moment for services to start
    sleep 3
    
    # Check crop disease service
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "✅ Crop Disease Service is healthy"
    else
        echo "❌ Crop Disease Service is not responding"
    fi
    
    # Check crop health service
    if curl -s http://localhost:5001/health > /dev/null; then
        echo "✅ Crop Health Service is healthy"
    else
        echo "❌ Crop Health Service is not responding"
    fi
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping services..."
    if [ ! -z "$CROP_DISEASE_PID" ]; then
        kill $CROP_DISEASE_PID 2>/dev/null
        echo "✅ Crop Disease Service stopped"
    fi
    if [ ! -z "$CROP_HEALTH_PID" ]; then
        kill $CROP_HEALTH_PID 2>/dev/null
        echo "✅ Crop Health Service stopped"
    fi
}

# Trap to stop services on script exit
trap stop_services EXIT

# Start services
start_crop_disease_service
start_crop_health_service

# Check services
check_services

echo ""
echo "🎉 Smart Fasal Backend Services are running!"
echo ""
echo "📊 Service URLs:"
echo "   Crop Disease API: http://localhost:5000"
echo "   Crop Health API:  http://localhost:5001"
echo ""
echo "📚 API Documentation:"
echo "   GET  http://localhost:5000/health          - Crop Disease Service Health"
echo "   GET  http://localhost:5000/model/info     - Model Information"
echo "   POST http://localhost:5000/predict        - Single Image Prediction"
echo "   POST http://localhost:5000/predict/batch  - Batch Image Prediction"
echo "   GET  http://localhost:5000/classes        - Available Disease Classes"
echo ""
echo "   GET  http://localhost:5001/health         - Crop Health Service Health"
echo "   POST http://localhost:5001/analyze        - Analyze Crop Health"
echo "   GET  http://localhost:5001/analyses       - Get User Analyses"
echo "   GET  http://localhost:5001/statistics     - Get Crop Health Statistics"
echo ""
echo "🔄 Press Ctrl+C to stop all services"

# Keep script running
wait
