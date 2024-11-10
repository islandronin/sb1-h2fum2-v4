-- Drop existing policies
DROP POLICY IF EXISTS "Give users access to own folder 1nt5rzp_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1nt5rzp_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1nt5rzp_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1nt5rzp_3" ON storage.objects;

-- Create new, more specific policies
CREATE POLICY "Public Access to Contact Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-images');

CREATE POLICY "Users Can Upload Contact Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contact-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users Can Update Own Contact Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contact-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users Can Delete Own Contact Images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contact-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);