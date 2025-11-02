# Frontend Testing Guide - Crop Recommendation

## How to Verify ML Model is Working

### Current Status

The frontend is **NOW** using the ML model (just fixed). Here's how to verify:

---

## ✅ Verification Steps

### 1. Check Browser Console

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Navigate to `/crop-recommendation` page
4. Click "Get Recommendations"
5. Look for:
   - ✅ "AI-powered crop recommendations generated!" = Using ML
   - ❌ "Failed to get recommendations" = Fallback to mock

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Click "Get Recommendations"
3. Look for:
   - Request: `POST http://localhost:8000/recommend-crop`
   - Status: Should be `200 OK`
   - Response: Should show JSON with real predictions

### 3. Test Different Inputs

The ML model gives **different results** based on input parameters.

#### Test 1: Rice Conditions
```
N: 90, P: 42, K: 43, Temp: 25°C, Humidity: 82%, pH: 6.5, Rainfall: 200mm
Expected Result: Rice with 100% confidence
```

#### Test 2: Neutral Conditions
```
N: 50, P: 40, K: 40, Temp: 28°C, Humidity: 60%, pH: 7.0, Rainfall: 100mm
Expected Result: Different crops (Pigeonpeas, Mothbeans, etc.)
```

#### Test 3: Extreme Conditions
```
N: 20, P: 20, K: 20, Temp: 35°C, Humidity: 30%, pH: 4.5, Rainfall: 50mm
Expected Result: Will show which crops can handle these conditions
```

---

## 🔍 How to Tell Real vs Mock

### Mock Data (Old - NOT using now):
- Always same 5 crops in same order
- Fixed confidence scores: 95%, 87%, 82%, 75%, 68%
- Same recommendations regardless of input

### Real ML Model (Current):
- **Different results for different inputs** ✅
- Confidence varies (can be 100%, 50%, 1%, etc.)
- All 22 crops possible
- Accuracy: 99.6%

---

## 🐛 Troubleshooting

### Issue: "Failed to get recommendations"

**Cause**: Backend not running or connection failed

**Fix**:
```bash
cd backend
python start.py
```

Check: http://localhost:8000/health should return `{"status":"healthy"}`

### Issue: Still seeing same results

**Cause**: Browser cached old response

**Fix**: 
1. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Clear browser cache
3. Try different input values

### Issue: Network tab shows 404

**Cause**: Wrong URL or backend not started

**Fix**: Verify backend is running on port 8000

---

## 📊 Expected Behavior

### When ML Model Works:
1. Click "Get Recommendations"
2. Loading spinner appears
3. Results appear in ~100-500ms
4. Toast: "AI-powered crop recommendations generated!"
5. Results change when you change inputs
6. Console shows no errors

### When Using Fallback:
1. Click "Get Recommendations"
2. Error toast: "Failed to get recommendations"
3. Mock data appears (5 crops, same order)
4. Console shows network error

---

## ✅ Quick Test

Run this to verify backend is working:

```bash
python -c "import requests; import json; data = {'N': 90, 'P': 42, 'K': 43, 'temperature': 25, 'humidity': 82, 'ph': 6.5, 'rainfall': 200}; r = requests.post('http://localhost:8000/recommend-crop', json=data); print(json.dumps(r.json()['recommendations'][0], indent=2))"
```

**Expected**: Rice with 100% confidence (not mock data!)

---

## 🎯 Summary

**Status**: Frontend is NOW using ML model ✅

**To verify**:
1. Open `/crop-recommendation` page
2. Try different input values
3. See different results each time
4. Check confidence scores vary
5. Console shows "AI-powered" toast

**You will now see REAL predictions from the Gradient Boosting model!** 🎉


