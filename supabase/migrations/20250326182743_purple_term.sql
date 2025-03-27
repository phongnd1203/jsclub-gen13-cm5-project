/*
  # Create storage bucket for restaurant images

  1. Storage Configuration
    - Create a storage bucket for restaurant images if it doesn't exist
    - Enable public access
    - Set file size limits and allowed MIME types
    - Configure security policies for access control

  2. Security Policies
    - Public read access
    - Authenticated users can upload
    - Users can delete their own images
*/

DO $$
BEGIN
  -- Create bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'restaurant-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'restaurant-images',
      'restaurant-images',
      true,
      5242880, -- 5MB file size limit
      ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    );
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Create new policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'restaurant-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'restaurant-images');

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'restaurant-images' AND auth.uid() = owner);