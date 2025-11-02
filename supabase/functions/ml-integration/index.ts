// Enhanced Edge Function with ML Model Integration
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  authenticateUser,
  validateRequiredFields 
} from "../_shared/utils.ts";

// ML Model Configuration
const ML_MODELS = {
  crop_disease: {
    provider: 'google_automl',
    endpoint: 'https://automl.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/models/YOUR_MODEL:predict',
    apiKey: Deno.env.get("GOOGLE_AUTOML_API_KEY"),
    fallback: 'ai_gateway'
  },
  yield_prediction: {
    provider: 'custom_model',
    endpoint: 'https://your-ml-api.com/predict-yield',
    apiKey: Deno.env.get("ML_API_KEY"),
    fallback: 'statistical_model'
  },
  efficiency: {
    provider: 'azure_cognitive',
    endpoint: 'https://your-cognitive-service.cognitiveservices.azure.com/vision/v3.2/analyze',
    apiKey: Deno.env.get("AZURE_COGNITIVE_KEY"),
    fallback: 'rule_based'
  }
};

interface MLRequest {
  imageUrl: string;
  fieldId?: string;
  cropType?: string;
  location?: {
    lat: number;
    lng: number;
  };
  modelType?: 'crop_disease' | 'yield_prediction' | 'efficiency';
}

interface MLResponse {
  predictions: Array<{
    label: string;
    confidence: number;
    severity?: 'low' | 'medium' | 'high';
  }>;
  model_used: string;
  processing_time: number;
  fallback_used: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const { user, supabase } = await authenticateUser(authHeader);

    const { imageUrl, fieldId, cropType, location, modelType = 'crop_disease' }: MLRequest = await req.json();
    
    validateRequiredFields({ imageUrl }, ['imageUrl']);

    console.log('Processing ML request:', { imageUrl, fieldId, cropType, modelType });

    // Get field information for context
    let fieldInfo = null;
    if (fieldId) {
      const { data: field, error: fieldError } = await supabase
        .from('fields')
        .select('crop_type, name, area_acres, planting_date, soil_type')
        .eq('id', fieldId)
        .eq('user_id', user.id)
        .single();
      
      if (!fieldError && field) {
        fieldInfo = field;
      }
    }

    // Call ML model with fallback strategy
    const mlResult = await callMLModelWithFallback(modelType, {
      imageUrl,
      cropType: fieldInfo?.crop_type || cropType,
      location,
      fieldInfo
    });

    // Process ML results
    const processedResults = await processMLResults(mlResult, modelType, fieldInfo);

    // Save results to database
    const savedAnalysis = await saveMLResults(supabase, user.id, {
      fieldId,
      imageUrl,
      modelType,
      results: processedResults,
      fieldInfo
    });

    // Generate recommendations
    const recommendations = await generateRecommendations(processedResults, fieldInfo);

    return createSuccessResponse({
      analysis: savedAnalysis,
      recommendations,
      model_info: {
        model_used: mlResult.model_used,
        confidence: mlResult.predictions[0]?.confidence || 0,
        processing_time: mlResult.processing_time,
        fallback_used: mlResult.fallback_used
      }
    });

  } catch (error) {
    console.error('Error in ML analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return createErrorResponse(errorMessage);
  }
});

// ML Model Integration Functions
async function callMLModelWithFallback(
  modelType: keyof typeof ML_MODELS, 
  inputData: any
): Promise<MLResponse> {
  const modelConfig = ML_MODELS[modelType];
  const startTime = Date.now();

  try {
    // Try primary ML model
    const response = await callMLModel(modelConfig.provider, modelConfig.endpoint, modelConfig.apiKey, inputData);
    
    return {
      predictions: response.predictions || response.results || [],
      model_used: modelConfig.provider,
      processing_time: Date.now() - startTime,
      fallback_used: false
    };

  } catch (error) {
    console.warn(`Primary model failed, using fallback: ${error.message}`);
    
    // Use fallback method
    const fallbackResult = await useFallbackModel(modelConfig.fallback, inputData);
    
    return {
      predictions: fallbackResult.predictions,
      model_used: modelConfig.fallback,
      processing_time: Date.now() - startTime,
      fallback_used: true
    };
  }
}

async function callMLModel(provider: string, endpoint: string, apiKey: string, inputData: any) {
  const requestBody = {
    instances: [{
      image_bytes: inputData.imageUrl,
      crop_type: inputData.cropType,
      location: inputData.location
    }]
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`ML API error: ${response.status}`);
  }

  return await response.json();
}

async function useFallbackModel(fallbackType: string, inputData: any): Promise<{ predictions: any[] }> {
  switch (fallbackType) {
    case 'ai_gateway':
      return await useAIGatewayFallback(inputData);
    case 'statistical_model':
      return await useStatisticalModel(inputData);
    case 'rule_based':
      return await useRuleBasedModel(inputData);
    default:
      return { predictions: [] };
  }
}

async function useAIGatewayFallback(inputData: any) {
  const AI_API_KEY = Deno.env.get("AI_API_KEY");
  
  const response = await fetch('https://ai.gateway.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{
        role: 'user',
        content: `Analyze this crop image for diseases. Return JSON with: diagnosis, confidence (0-100), severity (low/medium/high). Image: ${inputData.imageUrl}`
      }]
    })
  });

  const result = await response.json();
  const analysisText = result.choices[0].message.content;
  
  // Parse AI response
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
    diagnosis: 'Analysis unavailable',
    confidence: 50,
    severity: 'medium'
  };

  return {
    predictions: [{
      label: analysis.diagnosis,
      confidence: analysis.confidence,
      severity: analysis.severity
    }]
  };
}

async function useStatisticalModel(inputData: any) {
  // Simple statistical model based on historical data
  const cropType = inputData.cropType || 'unknown';
  const baseYield = getCropBaseYield(cropType);
  const weatherFactor = await getWeatherFactor(inputData.location);
  
  const predictedYield = baseYield * weatherFactor * (0.8 + Math.random() * 0.4);
  
  return {
    predictions: [{
      label: `Predicted yield: ${predictedYield.toFixed(1)} quintals/acre`,
      confidence: 75,
      severity: predictedYield > baseYield ? 'low' : 'medium'
    }]
  };
}

async function useRuleBasedModel(inputData: any) {
  // Rule-based efficiency recommendations
  const recommendations = [
    'Monitor soil moisture levels',
    'Apply fertilizer based on soil test results',
    'Ensure proper irrigation scheduling',
    'Check for pest activity regularly'
  ];

  return {
    predictions: recommendations.map(rec => ({
      label: rec,
      confidence: 80,
      severity: 'low'
    }))
  };
}

function getCropBaseYield(cropType: string): number {
  const baseYields: Record<string, number> = {
    'wheat': 35,
    'rice': 40,
    'cotton': 15,
    'sugarcane': 80,
    'vegetables': 25,
    'pulses': 12,
    'maize': 30
  };
  
  return baseYields[cropType.toLowerCase()] || 30;
}

async function getWeatherFactor(location?: { lat: number; lng: number }): number {
  // Simple weather factor calculation
  // In production, integrate with weather API
  return 0.9 + Math.random() * 0.2; // 0.9 to 1.1
}

async function processMLResults(mlResult: MLResponse, modelType: string, fieldInfo: any) {
  // Process and enhance ML results based on field context
  const processedResults = mlResult.predictions.map(pred => ({
    ...pred,
    field_context: fieldInfo ? {
      crop_type: fieldInfo.crop_type,
      planting_date: fieldInfo.planting_date,
      area_acres: fieldInfo.area_acres
    } : null,
    timestamp: new Date().toISOString()
  }));

  return processedResults;
}

async function saveMLResults(supabase: any, userId: string, data: any) {
  const { data: savedAnalysis, error } = await supabase
    .from('crop_health_analysis')
    .insert({
      user_id: userId,
      field_id: data.fieldId,
      image_url: data.imageUrl,
      diagnosis: data.results[0]?.label || 'Analysis completed',
      confidence: data.results[0]?.confidence || 0,
      severity: data.results[0]?.severity || 'medium',
      treatment_recommendation: 'See recommendations for detailed guidance',
      model_type: data.modelType,
      model_confidence: data.results[0]?.confidence || 0,
      fallback_used: data.results[0]?.fallback_used || false
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return savedAnalysis;
}

async function generateRecommendations(results: any[], fieldInfo: any) {
  const recommendations = [];
  
  for (const result of results) {
    if (result.severity === 'high') {
      recommendations.push({
        type: 'urgent',
        message: `Immediate action required: ${result.label}`,
        priority: 'high'
      });
    } else if (result.severity === 'medium') {
      recommendations.push({
        type: 'monitor',
        message: `Monitor closely: ${result.label}`,
        priority: 'medium'
      });
    } else {
      recommendations.push({
        type: 'maintain',
        message: `Continue current practices: ${result.label}`,
        priority: 'low'
      });
    }
  }

  return recommendations;
}



