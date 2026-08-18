-- Storage buckets for CareerJob
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('candidate-documents', 'candidate-documents', false, 5242880, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png']),
  ('candidate-photos', 'candidate-photos', false, 2097152, ARRAY['image/jpeg','image/png','image/webp']),
  ('business-documents', 'business-documents', false, 5242880, ARRAY['application/pdf','image/jpeg','image/png']),
  ('job-assets', 'job-assets', true, 2097152, ARRAY['image/jpeg','image/png','image/webp']),
  ('organization-assets', 'organization-assets', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Candidate documents: only owner or staff
CREATE POLICY "Candidates upload own docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'candidate-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Candidates read own docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'candidate-documents'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','admin','recruiter','staff'))
    )
  );

CREATE POLICY "Candidates update own docs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'candidate-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Candidates delete own docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'candidate-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
