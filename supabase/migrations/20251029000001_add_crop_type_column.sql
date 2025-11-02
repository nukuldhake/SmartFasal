-- Add crop_type column to crop_health_analysis table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'crop_health_analysis' 
    AND column_name = 'crop_type'
  ) THEN
    ALTER TABLE public.crop_health_analysis 
    ADD COLUMN crop_type TEXT;
  END IF;
END $$;


