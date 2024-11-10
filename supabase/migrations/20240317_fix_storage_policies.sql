-- First, drop all existing policies for the contact-images bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to manage their uploaded images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to contact images" ON storage.objects;
DROP POLICY IF EXISTS "Contact images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to Contact Images" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Contact Images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Update Own Contact Images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Upload Contact Images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own contact images" ON storage.objects;

-- Ensure the bucket exists and is configured correctly
UPDATE storage.buckets 
SET public = false 
WHERE id = 'contact-images';

-- Create new, clean policies
-- 1. Allow public read access to contact images
CREATE POLICY "contact_images_public_select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'contact-images'
);

-- 2. Allow authenticated users to upload their own contact images
CREATE POLICY "contact_images_auth_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'contact-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow users to update their own contact images
CREATE POLICY "contact_images_auth_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'contact-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow users to delete their own contact images
CREATE POLICY "contact_images_auth_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'contact-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;