# Smart Fasal FastAPI Backend

## Overview

This is the FastAPI backend for the Smart Fasal precision farming platform. It provides AI-powered crop disease detection using a trained TensorFlow model.

## Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **Crop Disease Detection**: AI-powered disease identification using TensorFlow
- **Image Processing**: Support for multiple image formats (JPEG, PNG, etc.)
- **Base64 Support**: Accept images as base64 encoded strings
- **File Upload**: Direct file upload support
- **CORS Support**: Cross-origin resource sharing enabled
- **Auto Documentation**: Interactive API docs at `/docs`

## Installation

### Prerequisites
- Python 3.8+
- TensorFlow 2.16.1
- FastAPI 0.104.1
- Uvicorn 0.24.0

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python start.py
```

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Health check

### Crop Analysis
- `POST /analyze` - Analyze crop health from uploaded image
- `POST /analyze-base64` - Analyze crop health from base64 image

### Model Information
- `GET /model/info` - Get model information
- `GET /classes` - Get all available disease classes
- `GET /statistics` - Get crop health statistics

## Usage Examples

### Upload Image File
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@crop_image.jpg" \
  -F "crop_type=Tomato" \
  -F "field_id=field_123"
```

### Base64 Image
```bash
curl -X POST "http://localhost:8000/analyze-base64" \
  -H "Content-Type: application/json" \
  -d '{
    "image_data": "base64_encoded_image_data",
    "crop_type": "Tomato",
    "field_id": "field_123"
  }'
```

### Get Model Info
```bash
curl -X GET "http://localhost:8000/model/info"
```

## Response Format

### Successful Analysis
```json
{
  "success": true,
  "analysis": {
    "predictions": [
      {
        "crop": "Tomato",
        "disease": "Bacterial_spot",
        "confidence": 0.95,
        "class_name": "Tomato___Bacterial_spot"
      }
    ],
    "top_prediction": {
      "crop": "Tomato",
      "disease": "Bacterial_spot",
      "confidence": 0.95,
      "class_name": "Tomato___Bacterial_spot"
    },
    "severity": "high",
    "recommendations": [
      "Remove infected plant parts immediately",
      "Apply copper-based fungicide",
      "Improve air circulation",
      "Avoid overhead watering"
    ],
    "model_info": {
      "model_name": "PlantVillage MobileNet",
      "total_classes": 38,
      "confidence_threshold": 0.5
    },
    "metadata": {
      "filename": "crop_image.jpg",
      "field_id": "field_123",
      "crop_type": "Tomato",
      "image_size": [224, 224],
      "image_format": "JPEG",
      "file_size": 1024000,
      "timestamp": "2025-01-10T12:00:00Z"
    }
  },
  "timestamp": "2025-01-10T12:00:00Z"
}
```

## Configuration

### Environment Variables
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `RELOAD`: Enable auto-reload (default: true)
- `LOG_LEVEL`: Logging level (default: info)

### Model Configuration
- Model path: `models/` directory
- Class indices: `models/class_indices.json`
- Supported formats: SavedModel, TFLite

## File Structure

```
backend/
├── app/
│   ├── __init__.py
│   └── main.py              # FastAPI application
├── services/
│   ├── __init__.py
│   └── crop_disease_service.py  # ML service
├── utils/
│   ├── __init__.py
│   └── helpers.py           # Utility functions
├── models/
│   ├── plant_disease/        # TensorFlow model files
│   ├── model.tflite        # TFLite model
│   └── class_indices.json   # Class mapping
├── requirements.txt         # Python dependencies
├── start.py                # Startup script
└── README.md              # This file
```

## Development

### Running in Development Mode
```bash
# Start with auto-reload
python start.py

# Or use uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI schema: http://localhost:8000/openapi.json

## Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Model Info
```bash
curl http://localhost:8000/model/info
```

### Classes
```bash
curl http://localhost:8000/classes
```

## Performance

- **Inference Time**: ~100-200ms per image
- **Memory Usage**: ~500MB for model loading
- **Throughput**: ~10-20 images/second
- **Accuracy**: ~90% on validation set

## Supported Crops and Diseases

### 38 Disease Classes
- **Apple**: Apple scab, Black rot, Cedar apple rust, Healthy
- **Blueberry**: Healthy
- **Cherry**: Powdery mildew, Healthy
- **Corn (Maize)**: Cercospora leaf spot, Common rust, Northern Leaf Blight, Healthy
- **Grape**: Black rot, Esca, Leaf blight, Healthy
- **Orange**: Huanglongbing (Citrus greening)
- **Peach**: Bacterial spot, Healthy
- **Pepper**: Bacterial spot, Healthy
- **Potato**: Early blight, Late blight, Healthy
- **Raspberry**: Healthy
- **Soybean**: Healthy
- **Squash**: Powdery mildew
- **Strawberry**: Leaf scorch, Healthy
- **Tomato**: Bacterial spot, Early blight, Late blight, Leaf Mold, Septoria leaf spot, Spider mites, Target Spot, Yellow Leaf Curl Virus, Mosaic virus, Healthy

## Troubleshooting

### Common Issues

1. **Model Loading Error**
   - Check model path in `models/` directory
   - Verify TensorFlow version compatibility
   - Ensure model files are present

2. **Memory Issues**
   - Reduce batch size
   - Use TFLite model for lower memory usage
   - Increase system memory

3. **API Timeout**
   - Check image size limits (10MB)
   - Optimize model inference
   - Use async processing for batch requests

### Debug Mode
```bash
export LOG_LEVEL=debug
python start.py
```

## License

This project is licensed under the MIT License.




