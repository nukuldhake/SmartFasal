"""
Field Efficiency Service
Calculates field efficiency metrics using proven agricultural algorithms
"""

from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class FieldEfficiencyService:
    """Service for calculating field efficiency metrics"""
    
    # Crop-specific standards (water in mm/season, fertilizer in kg/hectare, ideal yield in q/acre)
    CROP_STANDARDS = {
        'Rice': {
            'water': 1350,  # mm/season (average of 1200-1500)
            'fertilizer_n': 120,  # kg/hectare
            'fertilizer_p': 60,
            'fertilizer_k': 40,
            'ideal_yield': 45,  # quintals/acre
            'growing_days': 120
        },
        'Wheat': {
            'water': 500,  # mm/season (average of 400-600)
            'fertilizer_n': 120,
            'fertilizer_p': 60,
            'fertilizer_k': 40,
            'ideal_yield': 40,  # quintals/acre
            'growing_days': 140
        },
        'Cotton': {
            'water': 800,  # mm/season (average of 600-1000)
            'fertilizer_n': 100,
            'fertilizer_p': 50,
            'fertilizer_k': 50,
            'ideal_yield': 5,  # quintals/acre
            'growing_days': 150
        },
        'Maize': {
            'water': 650,  # mm/season (average of 500-800)
            'fertilizer_n': 100,
            'fertilizer_p': 50,
            'fertilizer_k': 50,
            'ideal_yield': 35,  # quintals/acre
            'growing_days': 90
        },
        'Tomato': {
            'water': 700,
            'fertilizer_n': 100,
            'fertilizer_p': 60,
            'fertilizer_k': 120,
            'ideal_yield': 30,
            'growing_days': 90
        },
        'Potato': {
            'water': 550,
            'fertilizer_n': 120,
            'fertilizer_p': 80,
            'fertilizer_k': 150,
            'ideal_yield': 25,
            'growing_days': 100
        },
        'Sugarcane': {
            'water': 1200,
            'fertilizer_n': 150,
            'fertilizer_p': 80,
            'fertilizer_k': 100,
            'ideal_yield': 60,
            'growing_days': 365
        },
        'Soybean': {
            'water': 600,
            'fertilizer_n': 80,
            'fertilizer_p': 60,
            'fertilizer_k': 40,
            'ideal_yield': 20,
            'growing_days': 100
        }
    }
    
    # Regional averages
    REGIONAL_AVERAGES = {
        'overall_efficiency': 76,
        'water_efficiency': 68,
        'fertilizer_efficiency': 72,
        'labor_efficiency': 75,
        'energy_efficiency': 70,
        'pest_control_efficiency': 73,
        'yield_per_cost': 71
    }
    
    def calculate_efficiency(self, field_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate comprehensive field efficiency metrics
        
        Args:
            field_data: Dictionary containing field information
                - crop_type: str
                - area_acres: float
                - actual_yield: float (quintals/acre, optional)
                - water_used_liters: float (liters per acre, optional)
                - fertilizer_n_kg: float (N in kg/hectare, optional)
                - fertilizer_p_kg: float (P in kg/hectare, optional)
                - fertilizer_k_kg: float (K in kg/hectare, optional)
                - cost_per_acre: float (₹/acre, optional)
                - labor_hours: float (hours/acre, optional)
                - fuel_liters: float (liters/acre, optional)
        
        Returns:
            Dictionary with efficiency scores and recommendations
        """
        crop_type = field_data.get('crop_type', '')
        if not crop_type:
            crop_type = ''
        crop_type = crop_type.capitalize()
        
        # Get crop standards (with fallback to generic values)
        standards = self.CROP_STANDARDS.get(crop_type, {
            'water': 700,
            'fertilizer_n': 100,
            'fertilizer_p': 60,
            'fertilizer_k': 50,
            'ideal_yield': 30,
            'growing_days': 120
        })
        
        # Calculate individual efficiency components
        water_efficiency = self._calculate_water_efficiency(field_data, standards)
        fertilizer_efficiency = self._calculate_fertilizer_efficiency(field_data, standards)
        yield_efficiency = self._calculate_yield_efficiency(field_data, standards)
        cost_efficiency = self._calculate_cost_efficiency(field_data)
        labor_efficiency = self._calculate_labor_efficiency(field_data)
        energy_efficiency = self._calculate_energy_efficiency(field_data)
        
        # Calculate overall weighted efficiency
        overall_efficiency = (
            water_efficiency * 0.25 +
            fertilizer_efficiency * 0.25 +
            yield_efficiency * 0.20 +
            cost_efficiency * 0.15 +
            labor_efficiency * 0.10 +
            energy_efficiency * 0.05
        )
        
        # Determine efficiency rating
        rating = self._get_rating(overall_efficiency)
        
        return {
            'overall_efficiency': round(overall_efficiency, 2),
            'water_efficiency': round(water_efficiency, 2),
            'fertilizer_efficiency': round(fertilizer_efficiency, 2),
            'yield_efficiency': round(yield_efficiency, 2),
            'cost_efficiency': round(cost_efficiency, 2),
            'labor_efficiency': round(labor_efficiency, 2),
            'energy_efficiency': round(energy_efficiency, 2),
            'rating': rating,
            'regional_avg': self.REGIONAL_AVERAGES['overall_efficiency'],
            'improvement_potential': round(overall_efficiency - self.REGIONAL_AVERAGES['overall_efficiency'], 2),
            'recommendations': self._generate_recommendations(
                water_efficiency, fertilizer_efficiency, yield_efficiency, 
                cost_efficiency, labor_efficiency, energy_efficiency
            )
        }
    
    def _calculate_water_efficiency(self, field_data: Dict, standards: Dict) -> float:
        """Calculate water efficiency (25% weight)"""
        water_used_liters = field_data.get('water_used_liters')
        
        if water_used_liters is None:
            # Return default value if no data
            return 87.0
        
        # Convert crop water requirement from mm to liters
        # 1 mm = 10,000 liters per hectare
        # 1 hectare = 2.471 acres
        water_per_acre_mm = standards['water'] / 2.471
        ideal_water_liters = water_per_acre_mm * 10000
        
        # Calculate efficiency (cap at 100%)
        efficiency = min(100, (ideal_water_liters / water_used_liters) * 100) if water_used_liters > 0 else 0
        
        return max(0, efficiency)
    
    def _calculate_fertilizer_efficiency(self, field_data: Dict, standards: Dict) -> float:
        """Calculate fertilizer efficiency (25% weight)"""
        fertilizer_n = field_data.get('fertilizer_n_kg') or 0
        fertilizer_p = field_data.get('fertilizer_p_kg') or 0
        fertilizer_k = field_data.get('fertilizer_k_kg') or 0
        
        if fertilizer_n == 0 and fertilizer_p == 0 and fertilizer_k == 0:
            # Return default value if no data
            return 85.0
        
        # Convert standards from kg/hectare to kg/acre
        standards_n = standards['fertilizer_n'] / 2.471
        standards_p = standards['fertilizer_p'] / 2.471
        standards_k = standards['fertilizer_k'] / 2.471
        
        # Calculate efficiency (optimal if within ±20% of standard)
        if fertilizer_n > 0:
            n_ratio = standards_n / fertilizer_n if fertilizer_n > 0 else 0
        else:
            n_ratio = 1.0
            
        if fertilizer_p > 0:
            p_ratio = standards_p / fertilizer_p if fertilizer_p > 0 else 0
        else:
            p_ratio = 1.0
            
        if fertilizer_k > 0:
            k_ratio = standards_k / fertilizer_k if fertilizer_k > 0 else 0
        else:
            k_ratio = 1.0
        
        # Average efficiency across nutrients, penalize overuse
        n_eff = min(100, n_ratio * 100 * 1.2) if n_ratio <= 1 else min(100, (1 / n_ratio) * 100)
        p_eff = min(100, p_ratio * 100 * 1.2) if p_ratio <= 1 else min(100, (1 / p_ratio) * 100)
        k_eff = min(100, k_ratio * 100 * 1.2) if k_ratio <= 1 else min(100, (1 / k_ratio) * 100)
        
        efficiency = (n_eff + p_eff + k_eff) / 3
        
        return max(0, min(100, efficiency))
    
    def _calculate_yield_efficiency(self, field_data: Dict, standards: Dict) -> float:
        """Calculate yield efficiency (20% weight)"""
        actual_yield = field_data.get('actual_yield')
        
        if actual_yield is None:
            # Return default value if no data
            return 89.0
        
        ideal_yield = standards['ideal_yield']
        
        # Calculate efficiency (cap at 120% to account for exceptional cases)
        efficiency = min(120, (actual_yield / ideal_yield) * 100) if ideal_yield > 0 else 0
        
        return max(0, efficiency)
    
    def _calculate_cost_efficiency(self, field_data: Dict) -> float:
        """Calculate cost efficiency (15% weight)"""
        cost_per_acre = field_data.get('cost_per_acre')
        
        if cost_per_acre is None:
            # Return default value if no data
            return 92.0
        
        # Regional average cost per acre (₹)
        regional_cost = 968 * 2.471  # Assuming ₹968/acre from field data
        
        # Higher efficiency = lower cost relative to regional average
        efficiency = min(150, (regional_cost / cost_per_acre) * 100) if cost_per_acre > 0 else 0
        
        return max(0, efficiency)
    
    def _calculate_labor_efficiency(self, field_data: Dict) -> float:
        """Calculate labor efficiency (10% weight)"""
        labor_hours = field_data.get('labor_hours')
        
        if labor_hours is None:
            # Return default value if no data
            return 78.0
        
        # Standard labor hours per acre (varies by crop, use average)
        standard_hours = 45  # hours per acre
        
        # Higher efficiency = fewer hours than standard
        efficiency = min(120, (standard_hours / labor_hours) * 100) if labor_hours > 0 else 0
        
        return max(0, efficiency)
    
    def _calculate_energy_efficiency(self, field_data: Dict) -> float:
        """Calculate energy efficiency (5% weight)"""
        fuel_liters = field_data.get('fuel_liters')
        
        if fuel_liters is None:
            # Return default value if no data
            return 82.0
        
        # Standard fuel usage per acre (liters)
        standard_fuel = 15  # liters per acre
        
        # Higher efficiency = less fuel than standard
        efficiency = min(120, (standard_fuel / fuel_liters) * 100) if fuel_liters > 0 else 0
        
        return max(0, efficiency)
    
    def _get_rating(self, efficiency: float) -> str:
        """Get efficiency rating"""
        if efficiency >= 90:
            return "Excellent"
        elif efficiency >= 80:
            return "Very Good"
        elif efficiency >= 70:
            return "Good"
        elif efficiency >= 60:
            return "Fair"
        else:
            return "Needs Improvement"
    
    def _generate_recommendations(self, water_eff: float, fert_eff: float, 
                                 yield_eff: float, cost_eff: float, 
                                 labor_eff: float, energy_eff: float) -> List[str]:
        """Generate actionable recommendations based on efficiency scores"""
        recommendations = []
        
        if water_eff < 70:
            recommendations.append("Water usage is inefficient. Consider installing drip irrigation or using soil moisture sensors.")
        elif water_eff < 85:
            recommendations.append("Water usage could be improved. Monitor soil moisture levels more closely.")
        
        if fert_eff < 70:
            recommendations.append("Fertilizer efficiency is low. Consider soil testing and precision application.")
        elif fert_eff < 85:
            recommendations.append("Fertilizer usage is good but could be optimized with split applications.")
        
        if yield_eff < 70:
            recommendations.append("Yield is below expectations. Review planting density, pest management, and soil health.")
        elif yield_eff < 85:
            recommendations.append("Yield has room for improvement. Consider crop rotation and soil amendments.")
        
        if cost_eff < 90:
            recommendations.append("Cost efficiency can be improved. Focus on reducing input costs through bulk purchasing.")
        
        if labor_eff < 70:
            recommendations.append("Labor efficiency is low. Consider mechanization or better planning.")
        elif labor_eff < 85:
            recommendations.append("Labor usage is good but could be optimized with better task scheduling.")
        
        if energy_eff < 80:
            recommendations.append("Energy efficiency needs attention. Consider equipment maintenance and route optimization.")
        
        # Positive feedback
        if water_eff >= 90:
            recommendations.append("Excellent water management! Your irrigation practices are optimal.")
        if fert_eff >= 90:
            recommendations.append("Outstanding fertilizer efficiency! Keep up the precision approach.")
        if yield_eff >= 90:
            recommendations.append("Excellent yield results! Your farming practices are highly effective.")
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def get_field_comparison(self, fields_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get efficiency comparison across multiple fields
        
        Args:
            fields_data: List of field data dictionaries
        
        Returns:
            Dictionary with comparison metrics
        """
        if not fields_data:
            return {
                'fields': [],
                'average_efficiency': 0,
                'comparison': []
            }
        
        field_efficiencies = []
        for field in fields_data:
            efficiency = self.calculate_efficiency(field)
            field_efficiencies.append({
                'field_name': field.get('name', 'Unknown'),
                'crop_type': field.get('crop_type', 'Unknown'),
                'efficiency': efficiency['overall_efficiency'],
                'water_efficiency': efficiency['water_efficiency'],
                'fertilizer_efficiency': efficiency['fertilizer_efficiency']
            })
        
        avg_efficiency = sum(f['efficiency'] for f in field_efficiencies) / len(field_efficiencies)
        regional_avg = self.REGIONAL_AVERAGES['overall_efficiency']
        
        return {
            'fields': field_efficiencies,
            'average_efficiency': round(avg_efficiency, 2),
            'regional_avg': regional_avg,
            'improvement': round(avg_efficiency - regional_avg, 2)
        }
    
    def get_resource_breakdown(self, field_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get detailed resource efficiency breakdown
        
        Args:
            field_data: Dictionary containing field information
        
        Returns:
            Dictionary with resource metrics
        """
        efficiency = self.calculate_efficiency(field_data)
        
        return {
            'water_use': {
                'your_field': efficiency['water_efficiency'],
                'regional': self.REGIONAL_AVERAGES['water_efficiency']
            },
            'fertilizer': {
                'your_field': efficiency['fertilizer_efficiency'],
                'regional': self.REGIONAL_AVERAGES['fertilizer_efficiency']
            },
            'labor': {
                'your_field': efficiency['labor_efficiency'],
                'regional': self.REGIONAL_AVERAGES['labor_efficiency']
            },
            'energy': {
                'your_field': efficiency['energy_efficiency'],
                'regional': self.REGIONAL_AVERAGES['energy_efficiency']
            },
            'pest_control': {
                'your_field': efficiency['fertilizer_efficiency'] * 0.95,  # Proxy calculation
                'regional': self.REGIONAL_AVERAGES['pest_control_efficiency']
            },
            'yield_per_cost': {
                'your_field': efficiency['yield_efficiency'] / efficiency['cost_efficiency'] * 100 if efficiency['cost_efficiency'] > 0 else 0,
                'regional': self.REGIONAL_AVERAGES['yield_per_cost']
            }
        }
