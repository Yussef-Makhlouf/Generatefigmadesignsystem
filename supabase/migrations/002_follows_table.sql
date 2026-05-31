-- ============================================================
-- MIGRATION: Add follows table + policies
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent self-follows at the DB level
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id),
  -- One follow row per pair
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

-- 2. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower  ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 3. Enable Row Level Security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Anyone can see who follows whom (public follows)
CREATE POLICY "Anyone can read follows"
  ON public.follows FOR SELECT
  USING (true);

-- A user can only follow as themselves
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- A user can only unfollow themselves
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);
