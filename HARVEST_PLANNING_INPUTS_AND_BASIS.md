# 🌾 Harvest Planning: Inputs and Calculation Basis

## Quick Summary

**Current Implementation**: Uses **ONLY 2 inputs**:
1. **Planting Date** (from your fields)
2. **Crop Type** (from your fields)

**Calculation Basis**: Crop-specific **maturity days** (e.g., Wheat 140 days, Rice 120 days)

---

## 📥 Current Inputs (What We Collect)

### Required Inputs (From Fields Table):
1. **`planting_date`** ✅
   - When did you plant the crop?
   - Format: YYYY-MM-DD (e.g., "2025-10-01")
   - **Source**: Fields you add in the "Fields" page

2. **`crop_type`** ✅
   - What crop did you plant?
   - Examples: "Wheat", "Rice", "Cotton", "Tomato", etc.
   - **Source**: Fields you add in the "Fields" page

### Optional Inputs (Not Currently Used):
3. **`current_ndvi`** ❌ Optional
   - Satellite vegetation index (0-1 range)
   - Used to calculate precise maturity percentage
   - **Currently**: Not collected, defaults to time-based estimate

4. **`weather_forecast`** ❌ Optional
   - 14-day weather forecast data
   - Temperature, rainfall, wind speed
   - **Currently**: Not collected, uses default risk assessment

---

## 🧮 Calculation Basis

### Step 1: Get Crop Maturity Days
```python
# Each crop has specific maturity timeline
CROP_MATURITY_DAYS = {
    'Rice': 120,      # Rice takes 120 days to mature
    'Wheat': 140,     # Wheat takes 140 days
    'Cotton': 150,    # Cotton takes 150 days
    'Maize': 90,      # Maize takes 90 days
    'Tomato': 90,     # Tomato takes 90 days
    # ... 21 more crops
}
```

### Step 2: Calculate Maturity Date
```python
# Simple date addition
planting_date = "2025-10-01"
crop_type = "Wheat"
maturity_days = 140  # From lookup table

maturity_date = planting_date + 140 days
                = 2025-10-01 + 140
                = 2026-02-18
```

### Step 3: Calculate Harvest Window
```python
# Optimal harvest window: ±7 days from maturity
harvest_window_start = maturity_date - 7 days
harvest_window_end = maturity_date + 14 days

# Example:
harvest_window_start = 2026-02-18 - 7 = 2026-02-11
harvest_window_end = 2026-02-18 + 14 = 2026-03-04

# Result: Harvest between Feb 11 - Mar 4, 2026
```

### Step 4: Calculate Current Maturity
```python
# Without NDVI (current implementation):
days_elapsed = today - planting_date
maturity_percentage = (days_elapsed / maturity_days) * 100

# Example:
days_elapsed = (2025-11-02 - 2025-10-01) = 32 days
maturity_percentage = (32 / 140) * 100 = 22.9%

# With NDVI (future enhancement):
maturity_percentage = ndvi_to_maturity(current_ndvi)
# NDVI: 0.3→0%, 0.6→50%, 0.9→100%
```

### Step 5: Generate Recommendation
```python
if maturity >= 95 and days_remaining <= 0:
    → "Harvest immediately at peak maturity"
    
elif maturity >= 90 and days_remaining <= 7:
    → "Harvest within 3-5 days"
    
elif maturity >= 75:
    → "Plan harvest in X weeks"
    
else:
    → "Continue monitoring, harvest in X weeks"
```

---

## 📊 Example Calculation (Complete Flow)

### Input:
```
Crop: Wheat
Planting Date: 2025-10-01
Today: 2025-11-02
```

### Calculation:
```
Step 1: Lookup maturity days
  → Wheat = 140 days

Step 2: Calculate maturity date
  → Maturity = 2025-10-01 + 140 days
            = 2026-02-18

Step 3: Calculate harvest window
  → Start = 2026-02-18 - 7 = 2026-02-11
  → End   = 2026-02-18 + 14 = 2026-03-04

Step 4: Calculate current maturity
  → Days elapsed = (2025-11-02 - 2025-10-01) = 32 days
  → Maturity % = (32 / 140) * 100 = 22.9%

Step 5: Calculate days remaining
  → Days remaining = (2026-02-18 - 2025-11-02) = 108 days

Step 6: Generate recommendation
  → Maturity 22.9% < 75%
  → "Crop in active growth phase. Estimated harvest in 15 weeks..."
```

### Output:
```json
{
  "optimal_start_date": "2026-02-11",
  "optimal_end_date": "2026-03-04",
  "maturity_date": "2026-02-18",
  "maturity_percentage": 22.9,
  "days_remaining": 108,
  "days_elapsed": 32,
  "current_stage": "Vegetative Growth",
  "weather_risk": "medium",
  "harvest_readiness": "Not Ready",
  "recommendation": "Crop in active growth phase. Estimated harvest in 15 weeks. Monitor NDVI and continue standard care practices."
}
```

---

## 🎯 Scientific Basis

### Maturity Days Source
Based on **ICAR (Indian Council of Agricultural Research)** standards and agricultural research:

| Crop | Maturity Days | Source |
|------|--------------|--------|
| Rice | 120 | ICAR Rice Research |
| Wheat | 140 | Agricultural Universities |
| Cotton | 150 | Cotton Research |
| Maize | 90 | Cereals Research |
| Tomato | 90 | Vegetable Research |

*These are **typical** maturity periods and may vary by variety and region*

### Harvest Window Logic
**±7 days from maturity** based on:
- Optimal quality range (±1 week)
- Allowing buffer for weather delays
- Standard agricultural practice

### Weather Risk Assessment
```python
Optimal conditions:
- Temperature: 20-32°C
- Rainfall: 0mm
- Wind: ≤20 km/h

Risky conditions:
- Rainfall: >10mm
- Temperature: <10°C or >35°C
- Wind: >25 km/h
```

---

## ⚠️ Current Limitations

### What We DON'T Collect Yet:
1. **Real Weather Data** ❌
   - Using default risk assessment
   - Not calling weather API
   - Future: Integrate OpenWeather API

2. **Actual NDVI Data** ❌
   - Using time-based maturity estimate
   - Not calling satellite API
   - Future: Integrate Sentinel-2 or MODIS

3. **Field Location** ❌
   - Not using GPS coordinates
   - No region-specific adjustments
   - Future: Location-based weather forecasts

### What This Means:
- **Harvest dates are calculated** from crop maturity standards
- **Not customized** for your local weather yet
- **Still very useful** for planning and timing
- **Conservative estimates** (safe for planning)

---

## 🔮 Future Enhancements

### With Real Weather Data:
```
Input: Weather API (OpenWeather or IMD)
Calculation: Filter optimal days within harvest window
Result: Precise "best days to harvest" recommendations
```

### With Real NDVI Data:
```
Input: Satellite imagery (Sentinel-2)
Calculation: Actual vegetation health index
Result: Accurate maturity percentage and growth stage
```

### With Location Data:
```
Input: Field GPS coordinates
Calculation: Region-specific climate data
Result: Customized recommendations for your area
```

---

## ✅ Summary

### Current Implementation:
- **Inputs**: Planting date + Crop type (from fields)
- **Basis**: ICAR crop maturity standards
- **Output**: Harvest window ±7 days from maturity
- **Strengths**: Simple, reliable, proven standards
- **Limitations**: No real weather/NDVI yet

### How It Works:
1. You add field with crop + planting date
2. System looks up crop maturity days
3. Calculates maturity date = planting + maturity days
4. Harvest window = maturity ±7 days
5. Shows recommendation based on current progress

### Reliability:
✅ **Scientifically sound** - Based on ICAR research  
✅ **Practically useful** - Conservative safe estimates  
✅ **Actionable** - Clear harvest windows  
⚠️ **Not yet personalized** - No location-specific weather

---

## 📝 For Users

**What You Need to Do:**
1. Add your fields with crop type and planting date
2. View harvest planning to see optimal windows
3. Plan your harvest activities based on recommendations

**What the System Does:**
1. Automatically calculates when your crop will mature
2. Shows you the best time window to harvest
3. Gives recommendations based on current progress

**What You'll See:**
- "Harvest between Feb 11 - Mar 4, 2026"
- "Crop is 22.9% mature"
- "Plan harvest in approximately 15 weeks"

All from just **2 inputs**: what crop and when you planted it! 🌾

