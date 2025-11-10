# Google Colab Setup for Crop Recommendation Models

## Quick Guide

This guide explains how to train and export crop recommendation models using Google Colab.

---

## 🚀 Setup Steps

### 1. Upload Notebook to Google Colab

1. Go to [Google Colab](https://colab.research.google.com/)
2. Click "File" → "Upload notebook"
3. Upload `ml_models/crop_recommendation/crop_recommmendation.ipynb`

### 2. Upload Dataset

1. In Colab, click the folder icon on the left sidebar
2. Click "Upload" button
3. Upload `Crop_recommendation.csv`

### 3. Run All Cells

1. Click "Runtime" → "Run all" (or press `Ctrl+F9`)
2. Wait for all cells to execute
3. When you reach the export cells, you'll be asked to mount Google Drive

### 4. Mount Google Drive

When prompted, follow these steps:
1. Click the authorization link
2. Select your Google account
3. Click "Allow" to give Colab access to your Drive
4. Copy the authorization code
5. Paste it back into the notebook cell

### 5. Models Will Be Saved

All files will be saved to:
```
Google Drive > MyDrive > Smart_Fasal_Models
```

**Files created:**
- `crop_recommendation_model.pkl` - ML model
- `crop_scaler.pkl` - Feature scaler
- `crop_targets.json` - Crop name mappings
- `Crop_recommendation.csv` - Training data
- `crop_recommendation_models.zip` - All files in one zip

---

## 📥 Download Models for Local Use

### Option 1: Download from Google Drive

1. Open [Google Drive](https://drive.google.com)
2. Navigate to `MyDrive > Smart_Fasal_Models`
3. Right-click on `crop_recommendation_models.zip`
4. Click "Download"
5. Extract the zip file

### Option 2: Download Individual Files

1. Open Google Drive
2. Navigate to `MyDrive > Smart_Fasal_Models`
3. Select all model files
4. Right-click → "Download"

---

## 🏗️ Deploy to Local Backend

After downloading the models:

### 1. Copy Files to Project

```bash
# Navigate to your project
cd D:\VIIT\TY\Semester 5\CAD\PBL\precision-farm-pro-main

# Create models directory
mkdir -p backend\models

# Copy downloaded files
# Move the .pkl, .json, and .csv files to:
# backend/models/crop_recommendation_model.pkl
# backend/models/crop_scaler.pkl
# backend/models/crop_targets.json
# backend/models/Crop_recommendation.csv
```

### 2. Verify Files

Check that these files exist in `backend/models/`:
```
backend/models/
├── crop_recommendation_model.pkl
├── crop_scaler.pkl
├── crop_targets.json
├── Crop_recommendation.csv
├── model.tflite
├── class_indices.json
└── plant_disease/
```

### 3. Start Backend

```bash
cd backend
python start.py
```

The CropRecommendationService will automatically:
- Detect the saved models
- Load them on startup
- Use them for predictions

---

## 🔍 Verification

### Test in Colab

After running the export cells, you should see:

```
✓ Model saved to: /content/drive/MyDrive/Smart_Fasal_Models/crop_recommendation_model.pkl
✓ Scaler saved to: /content/drive/MyDrive/Smart_Fasal_Models/crop_scaler.pkl
✓ Crop targets saved to: /content/drive/MyDrive/Smart_Fasal_Models/crop_targets.json

🧪 Model Test Results:
==================================================
Input: N=90, P=42, K=43, Temp=20.87°C, Humidity=82%, pH=6.5, Rainfall=203mm
✓ Predicted Crop: rice
✓ Confidence: 98.xx%
✓ Model accuracy on test set: 99.64%
✅ Model export successful and verified!
```

### Test Locally

Start your backend and test the API:

```bash
curl -X POST http://localhost:8000/recommend-crop \
  -H "Content-Type: application/json" \
  -d '{
    "N": 90,
    "P": 42,
    "K": 43,
    "temperature": 25,
    "humidity": 82,
    "ph": 6.5,
    "rainfall": 200
  }'
```

You should get crop recommendations with high confidence scores!

---

## 📊 Model Information

**Model**: Gradient Boosting Classifier  
**Accuracy**: 99.6%  
**Crops**: 22 classes  
**Features**: 7 (N, P, K, temperature, humidity, pH, rainfall)  
**Dataset**: 2,201 records  

---

## 🆘 Troubleshooting

### Issue: "Drive mount failed"

**Solution**: 
1. Disconnect and remount Drive
2. Make sure you authorize access
3. Check internet connection

### Issue: "FileNotFoundError" for CSV

**Solution**: 
1. Make sure `Crop_recommendation.csv` is uploaded to Colab
2. Check file name spelling
3. Reload the CSV upload cell

### Issue: Models not loading in local backend

**Solution**:
1. Check file paths in `backend/models/`
2. Verify files are not corrupted
3. Check backend logs for specific errors
4. Re-download from Google Drive if needed

### Issue: Import errors in backend

**Solution**:
```bash
# Install required packages
cd backend
pip install -r requirements.txt
```

---

## ✅ Success Checklist

- [ ] Notebook runs successfully in Colab
- [ ] Google Drive mounted successfully
- [ ] All model files saved to Drive
- [ ] Downloaded zip file to local machine
- [ ] Extracted files to `backend/models/`
- [ ] Backend starts without errors
- [ ] API endpoint returns recommendations
- [ ] Frontend displays recommendations

---

## 📝 Notes

- Models are **~500KB** in size
- Training takes **~30 seconds** in Colab
- Models work on **CPU** (no GPU needed)
- Compatible with **Python 3.8+**
- Requires **scikit-learn, pandas, joblib**

---

**Ready to go!** 🚀

Train in Colab, download to Drive, deploy locally. Simple and efficient!






