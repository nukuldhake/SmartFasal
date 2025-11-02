-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fields table for farm management
CREATE TABLE public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  area_acres DECIMAL(10,2) NOT NULL,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(10,8),
  soil_type TEXT,
  irrigation_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create crop_health_analysis table for disease detection
CREATE TABLE public.crop_health_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  diagnosis TEXT,
  confidence DECIMAL(5,2),
  severity TEXT,
  treatment_recommendation TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create yield_predictions table
CREATE TABLE public.yield_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  predicted_yield DECIMAL(10,2),
  confidence DECIMAL(5,2),
  factors JSONB,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create field_efficiency_metrics table
CREATE TABLE public.field_efficiency_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  water_usage DECIMAL(10,2),
  fertilizer_usage DECIMAL(10,2),
  efficiency_score DECIMAL(5,2),
  regional_avg_score DECIMAL(5,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create harvest_schedules table
CREATE TABLE public.harvest_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  optimal_start_date DATE,
  optimal_end_date DATE,
  ndvi_score DECIMAL(5,2),
  weather_risk TEXT,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_health_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_efficiency_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for fields
CREATE POLICY "Users can view own fields" ON public.fields FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fields" ON public.fields FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fields" ON public.fields FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fields" ON public.fields FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for crop_health_analysis
CREATE POLICY "Users can view own analyses" ON public.crop_health_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own analyses" ON public.crop_health_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for yield_predictions
CREATE POLICY "Users can view predictions for their fields" ON public.yield_predictions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.fields WHERE fields.id = yield_predictions.field_id AND fields.user_id = auth.uid()));

-- RLS Policies for field_efficiency_metrics
CREATE POLICY "Users can view metrics for their fields" ON public.field_efficiency_metrics FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.fields WHERE fields.id = field_efficiency_metrics.field_id AND fields.user_id = auth.uid()));

-- RLS Policies for harvest_schedules
CREATE POLICY "Users can view schedules for their fields" ON public.harvest_schedules FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.fields WHERE fields.id = harvest_schedules.field_id AND fields.user_id = auth.uid()));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();