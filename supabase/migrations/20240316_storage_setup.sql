-- Enable Storage
CREATE POLICY "Allow public access to contact images"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-images');

CREATE POLICY "Allow authenticated users to upload contact images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contact-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own contact images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'contact-images' 
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'contact-images' 
  AND auth.uid() = owner
);

CREATE POLICY "Allow users to delete their own contact images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contact-images' 
  AND auth.uid() = owner
);