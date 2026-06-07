-- ============================================================
-- Supabase Storage Buckets Setup
-- Run in SQL Editor after schema.sql
-- ============================================================
-- UPGRADE LOG (2026-05-31):
-- ✅ Added UPDATE/DELETE policies for question-images, answer-images, review-images, avatars
-- ✅ Added private business-licenses bucket (PDF + images, 20 MB limit)
-- ✅ Added owner-scoped + admin SELECT policies for business-licenses
-- ============================================================

-- ============================================================
-- 1. PUBLIC BUCKETS
-- ============================================================

-- Create bucket for question images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('question-images', 'question-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create bucket for answer images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('answer-images', 'answer-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create bucket for review images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('review-images', 'review-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================
-- 2. PRIVATE BUCKETS
-- ============================================================

-- ✅ ADDED: Business license documents (private — only owner + admin)
-- Expected path: business-licenses/{user_id}/filename.pdf
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-licenses', 'business-licenses', false, 20971520,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ============================================================
-- 3. STORAGE POLICIES — PUBLIC BUCKETS
-- ============================================================

-- ── Question Images ─────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view question images" ON storage.objects;
CREATE POLICY "Public can view question images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-images');

DROP POLICY IF EXISTS "Authenticated can upload question images" ON storage.objects;
CREATE POLICY "Authenticated can upload question images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'question-images' AND auth.role() = 'authenticated');

-- ✅ FIXED: only question authors can replace/remove their uploads
-- Path convention: questions/{question_id}/filename.ext
DROP POLICY IF EXISTS "Authenticated can update question images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own question images" ON storage.objects;
CREATE POLICY "Authors can update own question images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'question-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.questions
      WHERE id::text = (storage.foldername(name))[2]
        AND author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated can delete question images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own question images" ON storage.objects;
CREATE POLICY "Authors can delete own question images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'question-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.questions
      WHERE id::text = (storage.foldername(name))[2]
        AND author_id = auth.uid()
    )
  );

-- ── Answer Images ───────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view answer images" ON storage.objects;
CREATE POLICY "Public can view answer images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'answer-images');

DROP POLICY IF EXISTS "Authenticated can upload answer images" ON storage.objects;
CREATE POLICY "Authenticated can upload answer images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'answer-images' AND auth.role() = 'authenticated');

-- ✅ FIXED: only answer authors can replace/remove their uploads
-- Path convention: answers/{answer_id}/filename.ext
DROP POLICY IF EXISTS "Authenticated can update answer images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own answer images" ON storage.objects;
CREATE POLICY "Authors can update own answer images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'answer-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.answers
      WHERE id::text = (storage.foldername(name))[2]
        AND author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated can delete answer images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own answer images" ON storage.objects;
CREATE POLICY "Authors can delete own answer images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'answer-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.answers
      WHERE id::text = (storage.foldername(name))[2]
        AND author_id = auth.uid()
    )
  );

-- ── Review Images ───────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view review images" ON storage.objects;
CREATE POLICY "Public can view review images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

DROP POLICY IF EXISTS "Authenticated can upload review images" ON storage.objects;
CREATE POLICY "Authenticated can upload review images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

-- ✅ FIXED: only review authors can replace/remove their uploads
-- Path convention: reviews/{review_id}/filename.ext
DROP POLICY IF EXISTS "Authenticated can update review images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own review images" ON storage.objects;
CREATE POLICY "Authors can update own review images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'review-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.reviews
      WHERE id::text = (storage.foldername(name))[2]
        AND reviewer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated can delete review images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own review images" ON storage.objects;
CREATE POLICY "Authors can delete own review images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'review-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.reviews
      WHERE id::text = (storage.foldername(name))[2]
        AND reviewer_id = auth.uid()
    )
  );

-- ── Avatars ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ✅ FIXED: users can only update/delete their own avatar
-- Path convention: avatars/{user_uuid}/filename.ext
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 4. STORAGE POLICIES — PRIVATE BUCKETS
-- ============================================================

-- ── Business Licenses (owner-scoped by folder path) ─────────
-- Path convention: business-licenses/{user_uuid}/filename.ext
-- Only the file owner (matched by folder name = auth.uid) can access

DROP POLICY IF EXISTS "Owners can upload business license" ON storage.objects;
CREATE POLICY "Owners can upload business license"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-licenses'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners can view own license" ON storage.objects;
CREATE POLICY "Owners can view own license"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-licenses'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners can update own license" ON storage.objects;
CREATE POLICY "Owners can update own license"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'business-licenses'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Owners can delete own license" ON storage.objects;
CREATE POLICY "Owners can delete own license"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-licenses'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ✅ ADDED: Admins can view any business license (for verification)
DROP POLICY IF EXISTS "Admins can view all business licenses" ON storage.objects;
CREATE POLICY "Admins can view all business licenses"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-licenses'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- ============================================================
-- END OF STORAGE SETUP
-- ============================================================