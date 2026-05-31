-- ============================================================
-- Migration 003: Storage Buckets Setup & Policies
-- ============================================================

-- 1. Create storage buckets with strict properties

-- Create bucket: question-images (public, max 10MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create bucket: avatars (public, max 2MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create bucket: business-licenses (private, max 5MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-licenses',
  'business-licenses',
  false,
  5242880, -- 5MB in bytes
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- 2. Storage Objects Row Level Security Policies

-- Ensure storage RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ── Policies for question-images (Public read, Authenticated write) ──

DROP POLICY IF EXISTS "Public can view question images" ON storage.objects;
CREATE POLICY "Public can view question images" ON storage.objects
  FOR SELECT USING (bucket_id = 'question-images');

DROP POLICY IF EXISTS "Authenticated can upload question images" ON storage.objects;
CREATE POLICY "Authenticated can upload question images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'question-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update question images" ON storage.objects;
CREATE POLICY "Authenticated can update question images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'question-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete question images" ON storage.objects;
CREATE POLICY "Authenticated can delete question images" ON storage.objects
  FOR DELETE USING (bucket_id = 'question-images' AND auth.role() = 'authenticated');


-- ── Policies for avatars (Public read, Authenticated upload own avatar) ──

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');


-- ── Policies for business-licenses (Private — Owner and Admin access) ──

-- Path convention: business-licenses/{user_uuid}/license_file.ext
-- Folder name matches auth.uid()::text to restrict ownership

DROP POLICY IF EXISTS "Owners can upload business license" ON storage.objects;
CREATE POLICY "Owners can upload business license" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-licenses' 
    AND auth.role() = 'authenticated' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners can view own license" ON storage.objects;
CREATE POLICY "Owners can view own license" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-licenses' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners can update own license" ON storage.objects;
CREATE POLICY "Owners can update own license" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'business-licenses' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners can delete own license" ON storage.objects;
CREATE POLICY "Owners can delete own license" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'business-licenses' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all license documents for review/verification
DROP POLICY IF EXISTS "Admins can view all business licenses" ON storage.objects;
CREATE POLICY "Admins can view all business licenses" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-licenses' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );
