-- Create storage bucket for crop images
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for crop-images bucket
CREATE POLICY "Users can upload their own crop images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'crop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own crop images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'crop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own crop images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'crop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view crop images"
ON storage.objects FOR SELECT
USING (bucket_id = 'crop-images');


