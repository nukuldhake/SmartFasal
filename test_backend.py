#!/usr/bin/env python3
"""
Test script for Smart Fasal Backend Services
This script tests both crop disease prediction and crop health analysis APIs
"""

import requests
import base64
import json
import time
import os
from PIL import Image
import io

# Configuration
CROP_DISEASE_API_URL = "http://localhost:5000"
CROP_HEALTH_API_URL = "http://localhost:5001"
TEST_USER_ID = "test_user_123"

def create_test_image():
    """Create a simple test image"""
    # Create a simple RGB image
    img = Image.new('RGB', (224, 224), color='green')
    
    # Add some variation to make it more realistic
    pixels = img.load()
    for i in range(224):
        for j in range(224):
            # Add some noise
            r = min(255, max(0, pixels[i, j][0] + (i % 10) - 5))
            g = min(255, max(0, pixels[i, j][1] + (j % 10) - 5))
            b = min(255, max(0, pixels[i, j][2] + ((i + j) % 10) - 5))
            pixels[i, j] = (r, g, b)
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()

def image_to_base64(image_bytes):
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_bytes).decode('utf-8')

def test_crop_disease_service():
    """Test crop disease prediction service"""
    print("🧪 Testing Crop Disease Prediction Service...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{CROP_DISEASE_API_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test model info endpoint
    try:
        response = requests.get(f"{CROP_DISEASE_API_URL}/model/info", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Model info retrieved: {data['model_info']['model_name']}")
        else:
            print(f"❌ Model info failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Model info failed: {e}")
        return False
    
    # Test prediction endpoint
    try:
        test_image = create_test_image()
        image_base64 = image_to_base64(test_image)
        
        payload = {
            "image": image_base64,
            "crop_type": "Tomato",
            "location": {
                "lat": 19.0760,
                "lng": 72.8777
            }
        }
        
        response = requests.post(
            f"{CROP_DISEASE_API_URL}/predict",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                prediction = data['prediction']
                top_pred = prediction['top_prediction']
                print(f"✅ Prediction successful: {top_pred['crop']} - {top_pred['disease']}")
                print(f"   Confidence: {top_pred['confidence']:.2f}")
                print(f"   Severity: {prediction['severity']}")
                return True
            else:
                print(f"❌ Prediction failed: {data['error']}")
                return False
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Prediction failed: {e}")
        return False

def test_crop_health_service():
    """Test crop health analysis service"""
    print("\n🧪 Testing Crop Health Analysis Service...")
    
    # Test health endpoint
    try:
        response = requests.get(f"{CROP_HEALTH_API_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test analysis endpoint
    try:
        test_image = create_test_image()
        image_base64 = image_to_base64(test_image)
        
        payload = {
            "image": image_base64,
            "user_id": TEST_USER_ID,
            "field_id": "test_field_123",
            "crop_type": "Tomato"
        }
        
        response = requests.post(
            f"{CROP_HEALTH_API_URL}/analyze",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                analysis = data['analysis']
                prediction = data['prediction']
                print(f"✅ Analysis successful: {analysis['diagnosis']}")
                print(f"   Confidence: {analysis['confidence']:.2f}")
                print(f"   Severity: {analysis['severity']}")
                return True
            else:
                print(f"❌ Analysis failed: {data['error']}")
                return False
        else:
            print(f"❌ Analysis failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Analysis failed: {e}")
        return False
    
    # Test statistics endpoint
    try:
        response = requests.get(
            f"{CROP_HEALTH_API_URL}/statistics?user_id={TEST_USER_ID}",
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                stats = data['statistics']
                print(f"✅ Statistics retrieved: {stats['total_analyses']} analyses")
                return True
            else:
                print(f"❌ Statistics failed: {data['error']}")
                return False
        else:
            print(f"❌ Statistics failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Statistics failed: {e}")
        return False

def test_classes_endpoint():
    """Test classes endpoint"""
    print("\n🧪 Testing Classes Endpoint...")
    
    try:
        response = requests.get(f"{CROP_DISEASE_API_URL}/classes", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                classes = data['classes']
                print(f"✅ Classes retrieved: {len(classes)} classes")
                print(f"   Sample classes: {[c['class_name'] for c in classes[:3]]}")
                return True
            else:
                print(f"❌ Classes failed: {data['error']}")
                return False
        else:
            print(f"❌ Classes failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Classes failed: {e}")
        return False

def main():
    """Main test function"""
    print("🌾 Smart Fasal Backend Services Test")
    print("=" * 50)
    
    # Wait for services to start
    print("⏳ Waiting for services to start...")
    time.sleep(5)
    
    # Test services
    crop_disease_ok = test_crop_disease_service()
    crop_health_ok = test_crop_health_service()
    classes_ok = test_classes_endpoint()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Crop Disease Service: {'✅ PASS' if crop_disease_ok else '❌ FAIL'}")
    print(f"   Crop Health Service:  {'✅ PASS' if crop_health_ok else '❌ FAIL'}")
    print(f"   Classes Endpoint:     {'✅ PASS' if classes_ok else '❌ FAIL'}")
    
    if crop_disease_ok and crop_health_ok and classes_ok:
        print("\n🎉 All tests passed! Backend services are working correctly.")
        return True
    else:
        print("\n❌ Some tests failed. Please check the service logs.")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
