# Supabase Storage Setup

## Create the crop-images bucket

If the migrations don't automatically create the storage bucket, you can create it manually:

### Via Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Set the following:
   - **Name**: `crop-images`
   - **Public bucket**: ✅ Enabled (checked)
5. Click **"Create bucket"**

### Storage Policies

After creating the bucket, add these policies:

1. Go to **Storage** > **Policies**
2. Select the `crop-images` bucket
3. Add the following policies:

#### Policy 1: Users can upload their own images
- **Policy name**: `Users can upload their own crop images`
- **Allowed operation**: `INSERT`
- **Policy definition**:
```sql
bucket_id = 'crop-images' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 2: Users can view their own images
- **Policy name**: `Users can view their own crop images`
- **Allowed operation**: `SELECT`
- **Policy definition**:
```sql
bucket_id = 'crop-images' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 3: Users can delete their own images
- **Policy name**: `Users can delete their own crop images`
- **Allowed operation**: `DELETE`
- **Policy definition**:
```sql
bucket_id = 'crop-images' AND
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: Public can view all images
- **Policy name**: `Public can view crop images`
- **Allowed operation**: `SELECT`
- **Policy definition**:
```sql
bucket_id = 'crop-images'
```

## Alternative: Run SQL Migration

If you have Supabase CLI installed, run:

```bash
# Navigate to project root
cd "D:\VIIT\TY\Semester 5\CAD\PBL\precision-farm-pro-main"

# Run migrations
supabase db push
```

Or execute the SQL directly in the SQL Editor:

```sql
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
```

## Verify Setup

After setup, test by:
1. Uploading an image in the Crop Health page
2. Check the **Storage** section in Supabase dashboard
3. You should see your image in the `crop-images` bucket under your user ID folder


