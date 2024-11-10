-- Create the contact-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-images', 'contact-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the buckets table
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create policies for the bucket
CREATE POLICY "Give users access to own folder 1nt5rzp_0" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'contact-images');

CREATE POLICY "Give users access to own folder 1nt5rzp_1" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'contact-images');

CREATE POLICY "Give users access to own folder 1nt5rzp_2" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'contact-images');

CREATE POLICY "Give users access to own folder 1nt5rzp_3" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'contact-images');