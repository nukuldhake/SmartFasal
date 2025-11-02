-- Database functions for Smart Fasal backend

-- Function to calculate field statistics
CREATE OR REPLACE FUNCTION public.get_field_statistics(user_uuid UUID)
RETURNS TABLE (
  total_fields INTEGER,
  total_area DECIMAL,
  average_area DECIMAL,
  crop_distribution JSONB,
  planting_schedule JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_fields,
    COALESCE(SUM(f.area_acres), 0) as total_area,
    COALESCE(AVG(f.area_acres), 0) as average_area,
    COALESCE(
      jsonb_object_agg(
        f.crop_type, 
        jsonb_build_object(
          'count', crop_counts.count,
          'total_area', crop_counts.total_area
        )
      ) FILTER (WHERE f.crop_type IS NOT NULL),
      '{}'::jsonb
    ) as crop_distribution,
    COALESCE(
      jsonb_object_agg(
        EXTRACT(MONTH FROM f.planting_date)::TEXT,
        jsonb_build_object(
          'count', month_counts.count,
          'crops', month_counts.crops
        )
      ) FILTER (WHERE f.planting_date IS NOT NULL),
      '{}'::jsonb
    ) as planting_schedule
  FROM public.fields f
  LEFT JOIN (
    SELECT 
      crop_type,
      COUNT(*) as count,
      SUM(area_acres) as total_area
    FROM public.fields 
    WHERE user_id = user_uuid
    GROUP BY crop_type
  ) crop_counts ON f.crop_type = crop_counts.crop_type
  LEFT JOIN (
    SELECT 
      EXTRACT(MONTH FROM planting_date) as month,
      COUNT(*) as count,
      jsonb_agg(DISTINCT crop_type) as crops
    FROM public.fields 
    WHERE user_id = user_uuid AND planting_date IS NOT NULL
    GROUP BY EXTRACT(MONTH FROM planting_date)
  ) month_counts ON EXTRACT(MONTH FROM f.planting_date) = month_counts.month
  WHERE f.user_id = user_uuid;
END;
$$;

-- Function to get recent activities for a user
CREATE OR REPLACE FUNCTION public.get_user_activities(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  activity_type TEXT,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 
      'crop_analysis'::TEXT as activity_type,
      jsonb_build_object(
        'id', cha.id,
        'diagnosis', cha.diagnosis,
        'severity', cha.severity,
        'confidence', cha.confidence,
        'field_name', f.name
      ) as activity_data,
      cha.analyzed_at as created_at
    FROM public.crop_health_analysis cha
    LEFT JOIN public.fields f ON cha.field_id = f.id
    WHERE cha.user_id = user_uuid
    
    UNION ALL
    
    SELECT 
      'yield_prediction'::TEXT as activity_type,
      jsonb_build_object(
        'id', yp.id,
        'predicted_yield', yp.predicted_yield,
        'confidence', yp.confidence,
        'field_name', f.name
      ) as activity_data,
      yp.prediction_date as created_at
    FROM public.yield_predictions yp
    JOIN public.fields f ON yp.field_id = f.id
    WHERE f.user_id = user_uuid
    
    UNION ALL
    
    SELECT 
      'field_created'::TEXT as activity_type,
      jsonb_build_object(
        'id', f.id,
        'name', f.name,
        'crop_type', f.crop_type,
        'area_acres', f.area_acres
      ) as activity_data,
      f.created_at as created_at
    FROM public.fields f
    WHERE f.user_id = user_uuid
  )
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to calculate crop health trends
CREATE OR REPLACE FUNCTION public.get_crop_health_trends(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  healthy_count INTEGER,
  warning_count INTEGER,
  critical_count INTEGER,
  average_confidence DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cha.analyzed_at::DATE as date,
    COUNT(*) FILTER (WHERE cha.severity = 'low')::INTEGER as healthy_count,
    COUNT(*) FILTER (WHERE cha.severity = 'medium')::INTEGER as warning_count,
    COUNT(*) FILTER (WHERE cha.severity = 'high')::INTEGER as critical_count,
    COALESCE(AVG(cha.confidence), 0) as average_confidence
  FROM public.crop_health_analysis cha
  WHERE cha.user_id = user_uuid
    AND cha.analyzed_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY cha.analyzed_at::DATE
  ORDER BY date DESC;
END;
$$;

-- Function to get field efficiency summary
CREATE OR REPLACE FUNCTION public.get_field_efficiency_summary(user_uuid UUID)
RETURNS TABLE (
  field_id UUID,
  field_name TEXT,
  crop_type TEXT,
  efficiency_score DECIMAL,
  water_efficiency DECIMAL,
  fertilizer_efficiency DECIMAL,
  last_calculated TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as field_id,
    f.name as field_name,
    f.crop_type,
    fem.efficiency_score,
    fem.water_usage,
    fem.fertilizer_usage,
    fem.calculated_at as last_calculated
  FROM public.fields f
  LEFT JOIN LATERAL (
    SELECT 
      efficiency_score,
      water_usage,
      fertilizer_usage,
      calculated_at
    FROM public.field_efficiency_metrics fem
    WHERE fem.field_id = f.id
    ORDER BY fem.calculated_at DESC
    LIMIT 1
  ) fem ON true
  WHERE f.user_id = user_uuid
  ORDER BY fem.efficiency_score DESC NULLS LAST;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_field_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activities(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_crop_health_trends(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_field_efficiency_summary(UUID) TO authenticated;

