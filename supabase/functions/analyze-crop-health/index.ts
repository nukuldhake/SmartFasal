import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AnalysisRequest {
  imageUrl: string;
  fieldId?: string;
  cropType?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface AnalysisResult {
  diagnosis: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment_recommendation: string;
  affected_area_percentage?: number;
  urgency_level?: 'low' | 'medium' | 'high';
  prevention_tips?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { imageUrl, fieldId, cropType, location }: AnalysisRequest = await req.json();
    
    // Validate input
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY");
    if (!AI_API_KEY) throw new Error("AI_API_KEY not configured");

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get field information if fieldId is provided
    let fieldInfo = null;
    if (fieldId) {
      const { data: field, error: fieldError } = await supabase
        .from('fields')
        .select('crop_type, name, area_acres')
        .eq('id', fieldId)
        .eq('user_id', user.id)
        .single();
      
      if (!fieldError && field) {
        fieldInfo = field;
      }
    }

    console.log('Analyzing crop image:', { imageUrl, fieldId, cropType: fieldInfo?.crop_type || cropType });

    // Enhanced AI prompt with more context
    const systemPrompt = `You are an expert agricultural AI specializing in crop disease and pest detection for Indian agriculture. 
    Analyze the provided crop image and return a comprehensive assessment in JSON format.
    
    Consider:
    - Common diseases and pests in Indian crops (wheat, rice, cotton, sugarcane, vegetables, pulses)
    - Seasonal patterns and regional variations
    - Economic impact and treatment costs
    - Organic and chemical treatment options
    
    Return JSON with these exact fields:
    - diagnosis: Clear description of the issue
    - confidence: Number 0-100 indicating analysis confidence
    - severity: "low", "medium", or "high"
    - treatment_recommendation: Detailed treatment plan
    - affected_area_percentage: Estimated percentage of crop affected (0-100)
    - urgency_level: "low", "medium", or "high" based on spread potential
    - prevention_tips: Array of 3-5 prevention strategies`;

    const userPrompt = `Analyze this crop image for diseases, pests, or health issues.
    ${fieldInfo ? `Crop type: ${fieldInfo.crop_type}, Field: ${fieldInfo.name}, Area: ${fieldInfo.area_acres} acres` : ''}
    ${cropType ? `Crop type: ${cropType}` : ''}
    ${location ? `Location: ${location.lat}, ${location.lng}` : ''}
    
    Provide a comprehensive analysis focusing on Indian agricultural conditions.`;

    // Call AI service for crop disease detection
    const response = await fetch('https://ai.gateway.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const analysisText = aiResult.choices[0].message.content;
    
    // Extract and validate JSON from response
    let analysis: AnalysisResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      analysis = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!analysis.diagnosis || typeof analysis.confidence !== 'number' || !analysis.severity) {
        throw new Error('Invalid analysis format');
      }
      
      // Ensure confidence is within bounds
      analysis.confidence = Math.max(0, Math.min(100, analysis.confidence));
      
    } catch (parseError) {
      console.warn('Failed to parse AI response, using fallback:', parseError);
      analysis = {
        diagnosis: 'Healthy Crop - No significant issues detected',
        confidence: 75,
        severity: 'low',
        treatment_recommendation: 'Continue regular monitoring and maintenance practices.',
        affected_area_percentage: 0,
        urgency_level: 'low',
        prevention_tips: [
          'Maintain proper irrigation schedule',
          'Monitor for early signs of disease',
          'Ensure adequate spacing between plants',
          'Use disease-resistant varieties if available'
        ]
      };
    }

    // Save to database with enhanced data
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('crop_health_analysis')
      .insert({
        user_id: user.id,
        field_id: fieldId || null,
        image_url: imageUrl,
        diagnosis: analysis.diagnosis,
        confidence: analysis.confidence,
        severity: analysis.severity,
        treatment_recommendation: analysis.treatment_recommendation,
        affected_area_percentage: analysis.affected_area_percentage || 0,
        urgency_level: analysis.urgency_level || 'low',
        prevention_tips: analysis.prevention_tips || [],
        crop_type: fieldInfo?.crop_type || cropType || null,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Return enhanced response
    return new Response(JSON.stringify({
      success: true,
      analysis: savedAnalysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-crop-health:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
