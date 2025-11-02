from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import base64
import io
from PIL import Image
import json
from datetime import datetime, date
from typing import Optional, Dict, Any
import logging

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.crop_disease_service import CropDiseaseService
from services.crop_recommendation_service import CropRecommendationService
from services.field_efficiency_service import FieldEfficiencyService
from services.harvest_planning_service import HarvestPlanningService
from app.models import (
    CropAnalysisRequest, 
    CropAnalysisResponse, 
    HealthResponse,
    ModelInfoResponse,
    ClassesResponse,
    StatisticsResponse,
    CropRecommendationRequest,
    CropRecommendationResponse,
    FieldEfficiencyRequest,
    FieldEfficiencyResponse,
    FieldComparisonRequest,
    FieldComparisonResponse,
    HarvestPlanningRequest,
    HarvestPlanningResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Fasal API",
    description="AI-powered precision farming platform",
    version="1.0.0"
)

# Add CORS middleware
# Allow localhost for development and production URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:3000",
        # Add your production URLs here
        # "https://your-frontend.vercel.app",
        # "https://your-frontend.netlify.app",
        # "https://your-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
crop_disease_service = CropDiseaseService()
crop_recommendation_service = CropRecommendationService()
field_efficiency_service = FieldEfficiencyService()
harvest_planning_service = HarvestPlanningService()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Smart Fasal API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="smart-fasal-api",
        timestamp=datetime.now().isoformat()
    )

@app.post("/analyze")
async def analyze_crop_health(
    image: UploadFile = File(...),
    field_id: Optional[str] = Form(None),
    crop_type: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None)
):
    """
    Analyze crop health from uploaded image
    
    Args:
        image: Image file (JPEG, PNG, etc.)
        field_id: Optional field ID
        crop_type: Optional crop type
        user_id: Optional user ID
    
    Returns:
        Analysis results with predictions and recommendations
    """
    try:
        # Validate image file
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await image.read()
        
        # Validate image size (10MB limit)
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size must be less than 10MB")
        
        # Validate image format
        try:
            img = Image.open(io.BytesIO(image_data))
            if img.mode not in ['RGB', 'RGBA', 'L']:
                raise HTTPException(status_code=400, detail="Unsupported image format")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        logger.info(f"Analyzing image: {image.filename}, size: {len(image_data)} bytes")
        
        # Analyze crop health
        analysis_result = crop_disease_service.predict(image_data)
        
        # Add metadata
        analysis_result['metadata'] = {
            'filename': image.filename,
            'field_id': field_id,
            'crop_type': crop_type,
            'user_id': user_id,
            'image_size': img.size,
            'image_format': img.format,
            'file_size': len(image_data),
            'timestamp': datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "analysis": analysis_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in crop health analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-base64", response_model=CropAnalysisResponse)
async def analyze_crop_health_base64(request: CropAnalysisRequest):
    """
    Analyze crop health from base64 encoded image
    
    Args:
        request: CropAnalysisRequest containing image_data and optional fields
    
    Returns:
        Analysis results with predictions and recommendations
    """
    try:
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(request.image_data)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")
        
        # Validate image size (10MB limit)
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size must be less than 10MB")
        
        # Validate image format
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode not in ['RGB', 'RGBA', 'L']:
                raise HTTPException(status_code=400, detail="Unsupported image format")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        logger.info(f"Analyzing base64 image, size: {len(image_bytes)} bytes")
        
        # Analyze crop health
        analysis_result = crop_disease_service.predict(image_bytes)
        
        # Add metadata
        analysis_result['metadata'] = {
            'field_id': request.field_id,
            'crop_type': request.crop_type,
            'user_id': request.user_id,
            'image_size': img.size,
            'image_format': img.format,
            'file_size': len(image_bytes),
            'timestamp': datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "analysis": analysis_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in crop health analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    """Get model information"""
    try:
        model_info = crop_disease_service.get_model_info()
        return ModelInfoResponse(
            success=True,
            model_info=model_info,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")

@app.get("/classes", response_model=ClassesResponse)
async def get_classes():
    """Get all available disease classes"""
    try:
        classes = crop_disease_service.get_classes()
        return ClassesResponse(
            success=True,
            classes=classes,
            total_classes=len(classes),
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error getting classes: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get classes: {str(e)}")

@app.get("/statistics", response_model=StatisticsResponse)
async def get_statistics(user_id: Optional[str] = None):
    """Get crop health statistics"""
    try:
        # For now, return mock statistics
        # In a real implementation, this would query a database
        statistics = {
            "total_analyses": 0,
            "healthy_count": 0,
            "disease_count": 0,
            "health_percentage": 0,
            "severity_distribution": {"low": 0, "medium": 0, "high": 0},
            "crop_distribution": {},
            "recent_analyses": []
        }
        
        return StatisticsResponse(
            success=True,
            statistics=statistics,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

@app.post("/recommend-crop", response_model=CropRecommendationResponse)
async def recommend_crop(request: CropRecommendationRequest):
    """Get crop recommendations based on soil and weather parameters using ML model"""
    try:
        logger.info(f"Getting crop recommendations for N={request.N}, P={request.P}, K={request.K}, pH={request.ph}, temp={request.temperature}")
        
        # Get ML predictions
        predictions = crop_recommendation_service.predict_top_n(
            N=request.N,
            P=request.P,
            K=request.K,
            temperature=request.temperature,
            humidity=request.humidity,
            ph=request.ph,
            rainfall=request.rainfall,
            n=5  # Get top 5 recommendations
        )
        
        # Format recommendations with additional details
        recommendations = []
        for pred in predictions:
            crop_name = pred['crop']
            details = crop_recommendation_service.get_crop_details(crop_name)
            
            recommendations.append({
                "crop": crop_name.capitalize(),
                "confidence": pred['confidence'],
                "suitability": pred['suitability'],
                "expected_yield": details['expected_yield'],
                "profit_potential": details['profit_potential'],
                "market_demand": details['market_demand'],
                "reasons": [
                    f"{details['description']}",
                    f"Ideal for {details['season']} season",
                    f"Water requirement: {details['water_requirement']}",
                    f"Expected yield: {details['expected_yield']} quintals per acre"
                ]
            })
        
        return CropRecommendationResponse(
            success=True,
            recommendations=recommendations,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error getting crop recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get crop recommendations: {str(e)}")

@app.post("/calculate-field-efficiency", response_model=FieldEfficiencyResponse)
async def calculate_field_efficiency(request: FieldEfficiencyRequest):
    """Calculate field efficiency metrics using algorithmic approach"""
    try:
        logger.info(f"Calculating efficiency for {request.crop_type} crop")
        
        # Convert request to field data dict
        field_data = {
            'crop_type': request.crop_type,
            'area_acres': request.area_acres,
            'name': request.name,
            'actual_yield': request.actual_yield,
            'water_used_liters': request.water_used_liters,
            'fertilizer_n_kg': request.fertilizer_n_kg,
            'fertilizer_p_kg': request.fertilizer_p_kg,
            'fertilizer_k_kg': request.fertilizer_k_kg,
            'cost_per_acre': request.cost_per_acre,
            'labor_hours': request.labor_hours,
            'fuel_liters': request.fuel_liters
        }
        
        # Calculate efficiency
        efficiency = field_efficiency_service.calculate_efficiency(field_data)
        
        return FieldEfficiencyResponse(
            success=True,
            efficiency=efficiency,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error calculating field efficiency: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate field efficiency: {str(e)}")

@app.post("/compare-fields", response_model=FieldComparisonResponse)
async def compare_fields(request: FieldComparisonRequest):
    """Compare efficiency across multiple fields"""
    try:
        logger.info(f"Comparing efficiency for {len(request.fields)} fields")
        
        # Convert request to field data dicts
        fields_data = []
        for field_req in request.fields:
            fields_data.append({
                'crop_type': field_req.crop_type,
                'area_acres': field_req.area_acres,
                'name': field_req.name,
                'actual_yield': field_req.actual_yield,
                'water_used_liters': field_req.water_used_liters,
                'fertilizer_n_kg': field_req.fertilizer_n_kg,
                'fertilizer_p_kg': field_req.fertilizer_p_kg,
                'fertilizer_k_kg': field_req.fertilizer_k_kg,
                'cost_per_acre': field_req.cost_per_acre,
                'labor_hours': field_req.labor_hours,
                'fuel_liters': field_req.fuel_liters
            })
        
        # Get comparison
        comparison = field_efficiency_service.get_field_comparison(fields_data)
        
        return FieldComparisonResponse(
            success=True,
            comparison=comparison,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error comparing fields: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compare fields: {str(e)}")

@app.post("/resource-breakdown", response_model=dict)
async def get_resource_breakdown(request: FieldEfficiencyRequest):
    """Get detailed resource efficiency breakdown"""
    try:
        logger.info(f"Getting resource breakdown for {request.crop_type} crop")
        
        # Convert request to field data dict
        field_data = {
            'crop_type': request.crop_type,
            'area_acres': request.area_acres,
            'name': request.name,
            'actual_yield': request.actual_yield,
            'water_used_liters': request.water_used_liters,
            'fertilizer_n_kg': request.fertilizer_n_kg,
            'fertilizer_p_kg': request.fertilizer_p_kg,
            'fertilizer_k_kg': request.fertilizer_k_kg,
            'cost_per_acre': request.cost_per_acre,
            'labor_hours': request.labor_hours,
            'fuel_liters': request.fuel_liters
        }
        
        # Get resource breakdown
        breakdown = field_efficiency_service.get_resource_breakdown(field_data)
        
        return {
            "success": True,
            "breakdown": breakdown,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting resource breakdown: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get resource breakdown: {str(e)}")

@app.post("/plan-harvest", response_model=HarvestPlanningResponse)
async def plan_harvest(request: HarvestPlanningRequest):
    """Calculate optimal harvest timing using algorithmic approach"""
    try:
        logger.info(f"Planning harvest for {request.crop_type} planted on {request.planting_date}")
        
        # Calculate harvest window
        harvest_plan = harvest_planning_service.calculate_harvest_window(
            planting_date=request.planting_date,
            crop_type=request.crop_type,
            weather_forecast=request.weather_forecast,
            current_ndvi=request.current_ndvi
        )
        
        return HarvestPlanningResponse(
            success=True,
            harvest_plan=harvest_plan,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error planning harvest: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to plan harvest: {str(e)}")

@app.post("/harvest-ndvi-trend", response_model=dict)
async def get_ndvi_trend(request: HarvestPlanningRequest):
    """Generate NDVI trend data for chart visualization"""
    try:
        logger.info(f"Generating NDVI trend for {request.crop_type}")
        
        # Get days elapsed
        planting_date_obj = datetime.strptime(request.planting_date, '%Y-%m-%d').date()
        days_elapsed = (date.today() - planting_date_obj).days
        
        # Generate trend
        trend_data = harvest_planning_service.get_ndvi_trend(
            planting_date=request.planting_date,
            current_ndvi=request.current_ndvi,
            days_elapsed=max(0, days_elapsed)
        )
        
        return {
            "success": True,
            "trend_data": trend_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating NDVI trend: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate NDVI trend: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
