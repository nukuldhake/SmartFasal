"""
Harvest Planning Service
Calculates optimal harvest timing using algorithmic approach with weather and maturity data
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, date, timedelta
import logging

logger = logging.getLogger(__name__)

class HarvestPlanningService:
    """Service for calculating optimal harvest planning"""
    
    # Crop-specific maturity days
    CROP_MATURITY_DAYS = {
        'Rice': 120,
        'Wheat': 140,
        'Cotton': 150,
        'Maize': 90,
        'Tomato': 90,
        'Potato': 100,
        'Sugarcane': 365,
        'Soybean': 100,
        'Pigeonpeas': 120,
        'Mothbeans': 75,
        'Mungbean': 70,
        'Kidneybeans': 90,
        'Chickpea': 100,
        'Blackgram': 75,
        'Lentil': 90,
        'Apple': 150,
        'Banana': 300,
        'Coconut': 365,
        'Coffee': 270,
        'Grapes': 120,
        'Jute': 120,
        'Muskmelon': 100,
        'Orange': 240,
        'Papaya': 270,
        'Watermelon': 90
    }
    
    # NDVI to maturity mapping
    def ndvi_to_maturity(self, ndvi: float) -> float:
        """
        Convert NDVI value to maturity percentage
        
        Args:
            ndvi: Normalized Difference Vegetation Index (0-1)
        
        Returns:
            Maturity percentage (0-100)
        """
        if ndvi < 0.3:
            return 0  # Early growth stage
        elif ndvi < 0.6:
            # Vegetative growth: 0-50% maturity
            return (ndvi - 0.3) / 0.3 * 50
        else:
            # Maturation phase: 50-100% maturity
            return 50 + min((ndvi - 0.6) / 0.3 * 50, 50)
    
    def calculate_harvest_window(
        self,
        planting_date: str,
        crop_type: str,
        weather_forecast: Optional[List[Dict]] = None,
        current_ndvi: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculate optimal harvest window using algorithmic approach
        
        Args:
            planting_date: Date crop was planted (YYYY-MM-DD)
            crop_type: Type of crop
            weather_forecast: List of weather data for upcoming days
            current_ndvi: Current NDVI reading (0-1)
        
        Returns:
            Dictionary with harvest planning details
        """
        # Get maturity days for crop
        maturity_days = self.CROP_MATURITY_DAYS.get(
            crop_type.capitalize(),
            120  # Default fallback
        )
        
        # Parse planting date
        try:
            plant_date = datetime.strptime(planting_date, '%Y-%m-%d').date()
        except:
            plant_date = date.today()
        
        # Calculate expected maturity date
        maturity_date = plant_date + timedelta(days=maturity_days)
        
        # Calculate days remaining
        days_remaining = (maturity_date - date.today()).days
        
        # Calculate maturity percentage
        if current_ndvi:
            maturity_percentage = self.ndvi_to_maturity(current_ndvi)
        else:
            # Estimate based on days elapsed
            days_elapsed = (date.today() - plant_date).days
            maturity_percentage = min(100, (days_elapsed / maturity_days) * 100)
        
        # Calculate harvest window (±7 days from maturity)
        harvest_window_start = maturity_date - timedelta(days=7)
        harvest_window_end = maturity_date + timedelta(days=14)
        
        # Analyze weather if provided
        weather_analysis = self._analyze_weather(weather_forecast) if weather_forecast else None
        
        # Determine optimal harvest dates
        optimal_dates = self._find_optimal_dates(
            harvest_window_start,
            harvest_window_end,
            weather_forecast
        )
        
        # Calculate risk level
        risk_level = self._calculate_risk(weather_analysis, maturity_percentage, days_remaining)
        
        # Generate recommendation
        recommendation = self._generate_recommendation(
            crop_type,
            maturity_percentage,
            days_remaining,
            weather_analysis,
            optimal_dates
        )
        
        return {
            'optimal_start_date': optimal_dates['start'] if optimal_dates else harvest_window_start.isoformat(),
            'optimal_end_date': optimal_dates['end'] if optimal_dates else harvest_window_end.isoformat(),
            'maturity_date': maturity_date.isoformat(),
            'maturity_percentage': round(maturity_percentage, 1),
            'days_remaining': max(0, days_remaining),
            'days_elapsed': (date.today() - plant_date).days,
            'current_stage': self._get_growth_stage(maturity_percentage),
            'weather_risk': risk_level,
            'harvest_readiness': self._get_readiness(maturity_percentage, days_remaining, risk_level),
            'recommendation': recommendation,
            'optimal_window_days': self._get_optimal_days(harvest_window_start, harvest_window_end, weather_forecast)
        }
    
    def _analyze_weather(self, weather_forecast: List[Dict]) -> Dict[str, Any]:
        """Analyze weather forecast for harvest planning"""
        if not weather_forecast:
            return {
                'risk_level': 'medium',
                'optimal_days': 0,
                'risky_days': 0
            }
        
        optimal_days = 0
        risky_days = 0
        
        for day in weather_forecast:
            if self._is_optimal_weather(day):
                optimal_days += 1
            elif self._is_risky_weather(day):
                risky_days += 1
        
        total_days = len(weather_forecast)
        
        # Determine risk level
        if risky_days == 0:
            risk_level = 'low'
        elif risky_days <= 2:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        return {
            'risk_level': risk_level,
            'optimal_days': optimal_days,
            'risky_days': risky_days,
            'total_days': total_days,
            'optimal_percentage': round((optimal_days / total_days) * 100, 1) if total_days > 0 else 0
        }
    
    def _is_optimal_weather(self, weather: Dict) -> bool:
        """Check if weather is optimal for harvest"""
        temp = weather.get('temp', weather.get('temperature', 25))
        rain = weather.get('rain', weather.get('rainfall', 0))
        wind = weather.get('wind', weather.get('wind_speed', 10))
        
        # Optimal: Clear, moderate temp, low wind
        return temp >= 20 and temp <= 32 and rain == 0 and wind <= 20
    
    def _is_risky_weather(self, weather: Dict) -> bool:
        """Check if weather is risky for harvest"""
        temp = weather.get('temp', weather.get('temperature', 25))
        rain = weather.get('rain', weather.get('rainfall', 0))
        wind = weather.get('wind', weather.get('wind_speed', 10))
        
        # Risky: Rain, extreme temp, high wind
        return rain > 10 or temp < 10 or temp > 35 or wind > 25
    
    def _find_optimal_dates(self, start_date: date, end_date: date, weather_forecast: List[Dict]) -> Optional[Dict]:
        """Find the best dates within harvest window based on weather"""
        if not weather_forecast:
            return {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            }
        
        optimal_dates = []
        current_date = start_date
        
        for weather in weather_forecast:
            if current_date > end_date:
                break
            
            if self._is_optimal_weather(weather):
                optimal_dates.append(current_date.isoformat())
            
            current_date += timedelta(days=1)
        
        if optimal_dates:
            return {
                'start': optimal_dates[0],
                'end': optimal_dates[-1] if len(optimal_dates) > 1 else optimal_dates[0]
            }
        
        return None
    
    def _calculate_risk(self, weather_analysis: Optional[Dict], maturity: float, days_remaining: int) -> str:
        """Calculate overall risk level"""
        if weather_analysis and weather_analysis['risk_level'] == 'high':
            return 'high'
        if weather_analysis and weather_analysis['risk_level'] == 'low':
            return 'low'
        if days_remaining < 7:
            return 'medium'
        return 'medium'
    
    def _generate_recommendation(
        self,
        crop_type: str,
        maturity: float,
        days_remaining: int,
        weather_analysis: Optional[Dict],
        optimal_dates: Optional[Dict]
    ) -> str:
        """Generate personalized harvest recommendation"""
        if maturity >= 95 and days_remaining <= 0:
            if weather_analysis and weather_analysis['risk_level'] == 'low':
                return f"Harvest immediately while crop is at peak maturity and weather conditions are optimal. Quality and yield are at maximum."
            else:
                return f"Crop is fully mature. Monitor weather closely and harvest at first dry window to preserve quality."
        
        elif maturity >= 90 and days_remaining <= 7:
            if weather_analysis and weather_analysis['risk_level'] == 'low':
                return f"Harvest within next 3-5 days for optimal timing. Weather forecast is favorable with no significant rain expected."
            else:
                return f"Crop nearly mature. Plan harvest for next clear weather window to avoid quality loss."
        
        elif maturity >= 75:
            days_to_go = max(7, days_remaining)
            return f"Crop progressing well. Plan harvest in approximately {days_to_go} days. Continue monitoring maturity and weather forecasts."
        
        else:
            weeks_remaining = max(2, (100 - maturity) / 5)
            return f"Crop in active growth phase. Estimated harvest in {int(weeks_remaining)} weeks. Monitor NDVI and continue standard care practices."
    
    def _get_growth_stage(self, maturity: float) -> str:
        """Get current growth stage"""
        if maturity < 30:
            return "Early Growth"
        elif maturity < 50:
            return "Vegetative Growth"
        elif maturity < 75:
            return "Reproductive"
        elif maturity < 90:
            return "Maturation"
        elif maturity < 100:
            return "Near Mature"
        else:
            return "Fully Mature"
    
    def _get_readiness(self, maturity: float, days_remaining: int, risk: str) -> str:
        """Get harvest readiness status"""
        if maturity >= 95 and days_remaining <= 7 and risk == 'low':
            return "Ready"
        elif maturity >= 90 and days_remaining <= 14:
            return "Nearly Ready"
        elif maturity >= 75:
            return "In Progress"
        else:
            return "Not Ready"
    
    def _get_optimal_days(self, start_date: date, end_date: date, weather_forecast: List[Dict]) -> List[Dict]:
        """Get list of optimal days within harvest window"""
        if not weather_forecast:
            return []
        
        optimal_days = []
        current_date = start_date
        
        for weather in weather_forecast:
            if current_date > end_date:
                break
            
            score = self._calculate_day_score(weather)
            
            optimal_days.append({
                'date': current_date.isoformat(),
                'weather_score': score,
                'temperature': weather.get('temp', weather.get('temperature', 0)),
                'rainfall': weather.get('rain', weather.get('rainfall', 0)),
                'wind_speed': weather.get('wind', weather.get('wind_speed', 0)),
                'suitable': self._is_optimal_weather(weather)
            })
            
            current_date += timedelta(days=1)
        
        return optimal_days
    
    def _calculate_day_score(self, weather: Dict) -> float:
        """Calculate weather score for a specific day (0-100)"""
        temp = weather.get('temp', weather.get('temperature', 25))
        rain = weather.get('rain', weather.get('rainfall', 0))
        wind = weather.get('wind', weather.get('wind_speed', 10))
        
        score = 100
        
        # Temperature penalties (optimal: 25-28°C)
        if temp < 10 or temp > 35:
            score -= 50
        elif temp < 15 or temp > 32:
            score -= 30
        elif temp < 20 or temp > 30:
            score -= 15
        
        # Rainfall penalties
        if rain > 20:
            score -= 40
        elif rain > 10:
            score -= 25
        elif rain > 5:
            score -= 10
        
        # Wind penalties
        if wind > 25:
            score -= 20
        elif wind > 20:
            score -= 10
        
        return max(0, min(100, score))
    
    def get_ndvi_trend(
        self,
        planting_date: str,
        current_ndvi: Optional[float],
        days_elapsed: int
    ) -> List[Dict]:
        """
        Generate NDVI trend data for chart
        
        Args:
            planting_date: Date crop was planted
            current_ndvi: Current NDVI reading
            days_elapsed: Days since planting
        
        Returns:
            List of NDVI data points
        """
        trend_data = []
        
        if not current_ndvi:
            # Generate estimated trend
            for i in range(0, days_elapsed + 14, 7):
                # Simulate NDVI growth curve
                progress = min(1, i / 120)  # Normalize to 120 days
                ndvi = 0.3 + (progress * 0.55)  # Rough growth from 0.3 to 0.85
                trend_data.append({
                    'date': (datetime.strptime(planting_date, '%Y-%m-%d') + timedelta(days=i)).strftime('%b %d'),
                    'ndvi': round(ndvi, 2),
                    'maturity': round(self.ndvi_to_maturity(ndvi), 1)
                })
        else:
            # Use current NDVI and project forward
            for i in range(0, days_elapsed + 14, 7):
                if i <= days_elapsed:
                    # Historical: estimate past NDVI
                    progress = min(1, i / 120)
                    ndvi = 0.3 + (progress * (current_ndvi - 0.3))
                else:
                    # Future: gradual increase to peak
                    future_days = i - days_elapsed
                    peak_ndvi = min(0.90, current_ndvi + (future_days / 30) * 0.1)
                    ndvi = min(current_ndvi, peak_ndvi) if future_days > 0 else current_ndvi
                
                trend_data.append({
                    'date': (datetime.strptime(planting_date, '%Y-%m-%d') + timedelta(days=i)).strftime('%b %d'),
                    'ndvi': round(ndvi, 2),
                    'maturity': round(self.ndvi_to_maturity(ndvi), 1)
                })
        
        return trend_data
    
    def get_field_summary(
        self,
        field_data: Dict[str, Any],
        harvest_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate summary for a specific field"""
        return {
            'field_name': field_data.get('name', 'Unknown'),
            'crop_type': field_data.get('crop_type', 'Unknown'),
            'area_acres': field_data.get('area_acres', 0),
            'maturity_status': harvest_plan['maturity_percentage'],
            'optimal_harvest': f"{harvest_plan['optimal_start_date'][:10]} to {harvest_plan['optimal_end_date'][:10]}",
            'weather_window': harvest_plan.get('weather_risk', 'medium'),
            'recommendation': harvest_plan['recommendation'],
            'harvest_readiness': harvest_plan['harvest_readiness'],
            'days_remaining': harvest_plan['days_remaining']
        }




