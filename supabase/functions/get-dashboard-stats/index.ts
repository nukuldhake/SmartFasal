import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  createSuccessResponse, 
  createErrorResponse, 
  authenticateUser,
  formatIndianCurrency 
} from "../_shared/utils.ts";

interface DashboardStats {
  totalFields: number;
  totalArea: number;
  activeAnalyses: number;
  recentPredictions: number;
  averageYield: number;
  totalValue: number;
  healthScore: number;
  efficiencyScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const { user, supabase } = await authenticateUser(authHeader);

    // Get user's fields
    const { data: fields, error: fieldsError } = await supabase
      .from('fields')
      .select('id, name, area_acres, crop_type, planting_date')
      .eq('user_id', user.id);

    if (fieldsError) {
      throw new Error(`Failed to fetch fields: ${fieldsError.message}`);
    }

    // Get recent crop health analyses
    const { data: analyses, error: analysesError } = await supabase
      .from('crop_health_analysis')
      .select('id, severity, confidence, analyzed_at')
      .eq('user_id', user.id)
      .order('analyzed_at', { ascending: false })
      .limit(10);

    if (analysesError) {
      throw new Error(`Failed to fetch analyses: ${analysesError.message}`);
    }

    // Get yield predictions
    const { data: predictions, error: predictionsError } = await supabase
      .from('yield_predictions')
      .select('predicted_yield, confidence, prediction_date')
      .in('field_id', fields?.map(f => f.id) || [])
      .order('prediction_date', { ascending: false })
      .limit(5);

    if (predictionsError) {
      throw new Error(`Failed to fetch predictions: ${predictionsError.message}`);
    }

    // Get efficiency metrics
    const { data: efficiency, error: efficiencyError } = await supabase
      .from('field_efficiency_metrics')
      .select('efficiency_score')
      .in('field_id', fields?.map(f => f.id) || [])
      .order('calculated_at', { ascending: false })
      .limit(5);

    if (efficiencyError) {
      throw new Error(`Failed to fetch efficiency: ${efficiencyError.message}`);
    }

    // Calculate dashboard statistics
    const totalFields = fields?.length || 0;
    const totalArea = fields?.reduce((sum, field) => sum + (field.area_acres || 0), 0) || 0;
    const activeAnalyses = analyses?.length || 0;
    const recentPredictions = predictions?.length || 0;
    
    // Calculate average yield
    const averageYield = predictions?.length > 0 
      ? predictions.reduce((sum, pred) => sum + (pred.predicted_yield || 0), 0) / predictions.length
      : 0;

    // Calculate total estimated value (assuming ₹2000 per quintal)
    const totalValue = averageYield * totalArea * 2000;

    // Calculate health score based on recent analyses
    const healthScore = analyses?.length > 0
      ? analyses.reduce((sum, analysis) => {
          const severityScore = analysis.severity === 'low' ? 100 : 
                               analysis.severity === 'medium' ? 70 : 40;
          return sum + (severityScore * (analysis.confidence || 0) / 100);
        }, 0) / analyses.length
      : 85; // Default healthy score

    // Calculate efficiency score
    const efficiencyScore = efficiency?.length > 0
      ? efficiency.reduce((sum, eff) => sum + (eff.efficiency_score || 0), 0) / efficiency.length
      : 75; // Default efficiency score

    const dashboardStats: DashboardStats = {
      totalFields,
      totalArea: Math.round(totalArea * 100) / 100,
      activeAnalyses,
      recentPredictions,
      averageYield: Math.round(averageYield * 100) / 100,
      totalValue: Math.round(totalValue),
      healthScore: Math.round(healthScore),
      efficiencyScore: Math.round(efficiencyScore)
    };

    // Get recent activities
    const recentActivities = [
      ...(analyses?.slice(0, 3).map(analysis => ({
        type: 'analysis',
        message: `Crop health analysis completed`,
        timestamp: analysis.analyzed_at,
        severity: analysis.severity
      })) || []),
      ...(predictions?.slice(0, 2).map(prediction => ({
        type: 'prediction',
        message: `Yield prediction updated`,
        timestamp: prediction.prediction_date,
        yield: prediction.predicted_yield
      })) || [])
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 5);

    const response = {
      stats: dashboardStats,
      recentActivities,
      fields: fields?.map(field => ({
        id: field.id,
        name: field.name,
        area: field.area_acres,
        cropType: field.crop_type,
        plantingDate: field.planting_date,
        daysSincePlanting: Math.floor(
          (new Date().getTime() - new Date(field.planting_date).getTime()) / (1000 * 60 * 60 * 24)
        )
      })) || []
    };

    return createSuccessResponse(response);

  } catch (error) {
    console.error('Error in get-dashboard-stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return createErrorResponse(errorMessage);
  }
});

