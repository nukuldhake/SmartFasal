# Smart Fasal - Precision Farming Platform

## Project Overview

Smart Fasal is an AI-powered precision farming platform designed specifically for farmers in Maharashtra, India. The platform provides four core AI-powered features for agricultural optimization:

- **Yield Prediction Analytics**: AI-powered crop yield forecasting
- **Crop Health Analysis**: Real-time pest and disease detection using image analysis
- **Field Efficiency Analytics**: Resource usage benchmarking against regional averages
- **Smart Harvest Planning**: Optimal harvest timing using satellite data and weather forecasts

## Technologies Used

This project is built with:

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Charts**: Recharts for data visualization
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd precision-farm-pro-main

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Backend ML Services Setup

The Smart Fasal platform includes ML-powered backend services for crop disease detection:

### Prerequisites
- Python 3.8+
- TensorFlow 2.13.0
- Flask 2.3.3

### Quick Start

1. **Start Backend Services**:
   ```bash
   # On Windows
   start_backend.bat
   
   # On Linux/Mac
   chmod +x start_backend.sh
   ./start_backend.sh
   ```

2. **Manual Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Start Crop Disease Service (Port 5000)
   python api/crop_disease_api.py
   
   # Start Crop Health Service (Port 5001)
   python api/crop_health_api.py
   ```

3. **Test Services**:
   ```bash
   python test_backend.py
   ```

### API Endpoints

#### Crop Disease Prediction API (Port 5000)
- `GET /health` - Service health check
- `GET /model/info` - Model information
- `POST /predict` - Single image prediction
- `POST /predict/batch` - Batch image prediction
- `GET /classes` - Available disease classes

#### Crop Health Analysis API (Port 5001)
- `GET /health` - Service health check
- `POST /analyze` - Analyze crop health
- `GET /analyses` - Get user analyses
- `GET /statistics` - Get crop health statistics

### ML Model Details
- **Architecture**: MobileNet-based CNN
- **Dataset**: PlantVillage (38 classes)
- **Input Size**: 224x224x3
- **Accuracy**: ~90% validation accuracy
- **Inference Time**: ~100-200ms per image

## Environment Setup

You'll need to set up the following environment variables:

1. **Supabase Configuration**:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key

2. **AI API Configuration** (for Supabase Edge Functions):
   - `AI_API_KEY`: API key for AI services

3. **Backend ML Services** (for local development):
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key

## Features

### Core Functionality

#### 🌱 Crop Health Analysis
- **AI-Powered Disease Detection**: Upload crop images for instant disease and pest identification
- **38 Disease Classes**: Supports common Indian crops including Tomato, Potato, Corn, Apple, Grape, and more
- **Severity Assessment**: Automatic severity classification (low, medium, high)
- **Treatment Recommendations**: AI-generated treatment suggestions based on detected diseases
- **Health Statistics**: Track crop health trends and statistics over time
- **Field Integration**: Link analyses to specific fields for better tracking

#### 🔧 Backend ML Services
- **Crop Disease Prediction API**: Direct ML model inference service (Port 5000)
- **Crop Health Analysis API**: Higher-level analysis with database integration (Port 5001)
- **TensorFlow Model**: MobileNet-based CNN trained on PlantVillage dataset
- **Real-time Processing**: Fast image analysis with ~100-200ms inference time
- **Batch Processing**: Support for multiple image analysis
- **RESTful APIs**: Complete API documentation and health checks

- **User Authentication**: Complete signup/login system
- **Field Management**: Add and manage multiple agricultural fields
- **AI-Powered Analysis**: Real-time crop health analysis using Google Gemini AI
- **Predictive Analytics**: Yield forecasting and harvest timing
- **Efficiency Benchmarking**: Compare resource usage with regional averages
- **Responsive Design**: Mobile-friendly interface

### Database Schema

The application uses PostgreSQL with the following main tables:
- `profiles`: User profile information
- `fields`: Agricultural field data
- `crop_health_analysis`: Disease detection results
- `yield_predictions`: AI-generated yield forecasts
- `field_efficiency_metrics`: Resource usage analytics
- `harvest_schedules`: Optimal harvest timing data

## Deployment

### Local Development

```sh
npm run dev
```

### Production Build

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
