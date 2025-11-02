-- Add new columns to crop_health_analysis table for enhanced functionality
ALTER TABLE public.crop_health_analysis 
ADD COLUMN IF NOT EXISTS affected_area_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS urgency_level TEXT DEFAULT 'low' CHECK (urgency_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS prevention_tips JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS crop_type TEXT,
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(10,8);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_crop_health_user_field ON public.crop_health_analysis(user_id, field_id);
CREATE INDEX IF NOT EXISTS idx_crop_health_severity ON public.crop_health_analysis(severity);
CREATE INDEX IF NOT EXISTS idx_crop_health_analyzed_at ON public.crop_health_analysis(analyzed_at DESC);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view own analyses" ON public.crop_health_analysis;
DROP POLICY IF EXISTS "Users can create own analyses" ON public.crop_health_analysis;

CREATE POLICY "Users can view own analyses" ON public.crop_health_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own analyses" ON public.crop_health_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON public.crop_health_analysis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON public.crop_health_analysis FOR DELETE USING (auth.uid() = user_id);

