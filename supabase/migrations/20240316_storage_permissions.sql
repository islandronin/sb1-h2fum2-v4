-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure the storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

-- Drop existing policies
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to contact images" ON storage.objects;

-- Create new policies with proper access control
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'contact-images' AND
    auth.uid() IS NOT NULL
);

CREATE POLICY "Allow users to manage their uploaded images"
ON storage.objects FOR ALL 
TO authenticated
USING (
    bucket_id = 'contact-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow public read access to contact images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'contact-images');

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;