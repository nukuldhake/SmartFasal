-- Migration: Add usage data columns to fields table for efficiency calculations

-- Add columns for water usage
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS water_used_liters DECIMAL(10,2);
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS irrigation_method TEXT;

-- Add columns for fertilizer usage
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS fertilizer_n_kg DECIMAL(10,2);
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS fertilizer_p_kg DECIMAL(10,2);
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS fertilizer_k_kg DECIMAL(10,2);

-- Add columns for yield and costs
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS actual_yield_quintals DECIMAL(10,2);
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS cost_per_acre DECIMAL(10,2);
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS harvest_date DATE;

-- Add columns for labor and energy
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS labor_hours DECIMAL(10,2);
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS fuel_liters DECIMAL(10,2);

-- Add column for notes
ALTER TABLE public.fields ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.fields.water_used_liters IS 'Total water used during growing season in liters';
COMMENT ON COLUMN public.fields.irrigation_method IS 'Type of irrigation used (Drip, Sprinkler, Flood, etc.)';
COMMENT ON COLUMN public.fields.fertilizer_n_kg IS 'Nitrogen fertilizer applied in kg per hectare';
COMMENT ON COLUMN public.fields.fertilizer_p_kg IS 'Phosphorus fertilizer applied in kg per hectare';
COMMENT ON COLUMN public.fields.fertilizer_k_kg IS 'Potassium fertilizer applied in kg per hectare';
COMMENT ON COLUMN public.fields.actual_yield_quintals IS 'Actual yield achieved in quintals per acre';
COMMENT ON COLUMN public.fields.cost_per_acre IS 'Total production cost per acre in INR';
COMMENT ON COLUMN public.fields.harvest_date IS 'Date when harvest was completed';
COMMENT ON COLUMN public.fields.labor_hours IS 'Total labor hours per acre';
COMMENT ON COLUMN public.fields.fuel_liters IS 'Total fuel used per acre in liters';



