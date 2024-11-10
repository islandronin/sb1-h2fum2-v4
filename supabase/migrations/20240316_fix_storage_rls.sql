-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own contact images" ON storage.objects;
DROP POLICY IF EXISTS "Contact images are publicly accessible" ON storage.objects;

-- Create new RLS policies
CREATE POLICY "Users can upload their own contact images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contact-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own contact images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contact-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own contact images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contact-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Contact images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-images');

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;