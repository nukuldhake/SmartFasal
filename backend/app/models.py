from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CropAnalysisRequest(BaseModel):
    """Request model for crop health analysis"""
    image_data: str
    field_id: Optional[str] = None
    crop_type: Optional[str] = None
    user_id: Optional[str] = None

class CropAnalysisResponse(BaseModel):
    """Response model for crop health analysis"""
    success: bool
    analysis: dict
    timestamp: str

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    service: str
    timestamp: str

class ModelInfoResponse(BaseModel):
    """Model information response model"""
    success: bool
    model_info: dict
    timestamp: str

class ClassesResponse(BaseModel):
    """Classes response model"""
    success: bool
    classes: list
    total_classes: int
    timestamp: str

class StatisticsResponse(BaseModel):
    """Statistics response model"""
    success: bool
    statistics: dict
    timestamp: str

class CropRecommendationRequest(BaseModel):
    """Request model for crop recommendation"""
    N: float  # Nitrogen
    P: float  # Phosphorus
    K: float  # Potassium
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class CropRecommendationResponse(BaseModel):
    """Response model for crop recommendation"""
    success: bool
    recommendations: list
    timestamp: str

class FieldEfficiencyRequest(BaseModel):
    """Request model for field efficiency calculation"""
    crop_type: str
    area_acres: float
    name: Optional[str] = None
    actual_yield: Optional[float] = None  # quintals/acre
    water_used_liters: Optional[float] = None  # liters per acre
    fertilizer_n_kg: Optional[float] = None  # N in kg/hectare
    fertilizer_p_kg: Optional[float] = None  # P in kg/hectare
    fertilizer_k_kg: Optional[float] = None  # K in kg/hectare
    cost_per_acre: Optional[float] = None  # ₹/acre
    labor_hours: Optional[float] = None  # hours/acre
    fuel_liters: Optional[float] = None  # liters/acre

class FieldEfficiencyResponse(BaseModel):
    """Response model for field efficiency calculation"""
    success: bool
    efficiency: dict
    timestamp: str

class FieldComparisonRequest(BaseModel):
    """Request model for field comparison"""
    fields: List[FieldEfficiencyRequest]

class FieldComparisonResponse(BaseModel):
    """Response model for field comparison"""
    success: bool
    comparison: dict
    timestamp: str

class HarvestPlanningRequest(BaseModel):
    """Request model for harvest planning"""
    planting_date: str  # YYYY-MM-DD
    crop_type: str
    current_ndvi: Optional[float] = None
    weather_forecast: Optional[List[Dict]] = None

class HarvestPlanningResponse(BaseModel):
    """Response model for harvest planning"""
    success: bool
    harvest_plan: dict
    timestamp: str



