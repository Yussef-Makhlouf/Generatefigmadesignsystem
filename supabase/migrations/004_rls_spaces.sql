-- ============================================================
-- Migration 004: Row Level Security for Spaces Table
-- ============================================================

-- Ensure Row Level Security is active on the spaces table
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

-- 1. General Access Policy: Anyone (guest or authenticated) can view spaces
DROP POLICY IF EXISTS "Allow public read access to spaces" ON public.spaces;
CREATE POLICY "Allow public read access to spaces" ON public.spaces
  FOR SELECT 
  USING (true);

-- 2. Admin Creation Policy: Only users with 'admin' account type can create spaces
DROP POLICY IF EXISTS "Allow admins to insert spaces" ON public.spaces;
CREATE POLICY "Allow admins to insert spaces" ON public.spaces
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'admin'
    )
  );

-- 3. Admin Update Policy: Only users with 'admin' account type can update spaces
DROP POLICY IF EXISTS "Allow admins to update spaces" ON public.spaces;
CREATE POLICY "Allow admins to update spaces" ON public.spaces
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'admin'
    )
  );

-- 4. Admin Deletion Policy: Only users with 'admin' account type can delete spaces
DROP POLICY IF EXISTS "Allow admins to delete spaces" ON public.spaces;
CREATE POLICY "Allow admins to delete spaces" ON public.spaces
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.account_type = 'admin'
    )
  );
