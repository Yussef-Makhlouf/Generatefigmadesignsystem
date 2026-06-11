-- ============================================================
-- KHAPEER SCHEMA — FEED RANKING MIGRATION
-- Date: 2026-06-10
-- Changes:
-- ✅ Added composite indexes for cursor pagination stability
-- ✅ Added indexes for trending/popular feed window queries
-- ✅ Added RPC: get_for_you_feed (personalized ranked feed)
-- ✅ Added RPC: get_trending_feed (momentum-based feed)
-- ✅ Added RPC: get_following_feed (followed users feed)
-- ============================================================

-- ============================================================
-- INDEXES FOR FEED PERFORMANCE
-- ============================================================

-- Cursor pagination stability: (created_at DESC, id DESC)
-- Ensures stable ordering when multiple rows share the same timestamp.
-- Used by: get_recent_feed, get_for_you_feed, get_trending_feed, get_following_feed
CREATE INDEX IF NOT EXISTS idx_questions_created_id
  ON public.questions(created_at DESC, id DESC);

-- Trending/popular ordering: (votes_count DESC, created_at DESC)
-- Supports queries that sort by popularity with recency tiebreaker.
-- Used by: get_for_you_feed vote_score component
CREATE INDEX IF NOT EXISTS idx_questions_votes_created
  ON public.questions(votes_count DESC, created_at DESC);

-- Following feed: fast lookup of a user's questions ordered by time
-- Used by: get_following_feed
CREATE INDEX IF NOT EXISTS idx_questions_author_created
  ON public.questions(author_id, created_at DESC);

-- Trending vote window: count votes within last 24h
-- Used by: get_trending_feed subquery
CREATE INDEX IF NOT EXISTS idx_votes_target_created
  ON public.votes(target_id, target_type, created_at DESC);

-- Trending answer window: count answers within last 24h
-- Used by: get_trending_feed subquery
CREATE INDEX IF NOT EXISTS idx_answers_question_created
  ON public.answers(question_id, created_at DESC);

-- Following feed: fast follower→following lookup
-- Used by: get_following_feed WHERE author_id IN (SELECT ...)
CREATE INDEX IF NOT EXISTS idx_follows_follower_following
  ON public.follows(follower_id, following_id);


-- ============================================================
-- RPC: get_for_you_feed
-- Personalized feed with weighted scoring formula:
--   score = (freshness * 0.35)
--         + (vote_score * 0.25)
--         + (answer_score * 0.15)
--         + (category_affinity * 0.10)
--         + (author_affinity * 0.10)
--         + (reputation_score * 0.05)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_for_you_feed(
  p_user_id  UUID,
  p_limit    INT DEFAULT 20,
  p_cursor   TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  location TEXT,
  votes_count INTEGER,
  answers_count INTEGER,
  views_count INTEGER,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank_score NUMERIC,
  author jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH
  -- User's recent categories for affinity scoring
  user_categories AS (
    SELECT DISTINCT q.category
    FROM public.questions q
    WHERE q.author_id = p_user_id
      AND q.category IS NOT NULL
    LIMIT 20
  ),
  -- Users the current user follows
  followed_users AS (
    SELECT f.following_id
    FROM public.follows f
    WHERE f.follower_id = p_user_id
  ),
  -- Candidate questions with cursor pagination
  candidates AS (
    SELECT
      q.id,
      q.author_id,
      q.title,
      q.content,
      q.category,
      q.location,
      q.votes_count,
      q.answers_count,
      q.views_count,
      q.is_deleted,
      q.created_at,
      q.updated_at,
      -- Freshness: decay over 7 days, normalized to [0,1]
      GREATEST(0, 1.0 - (EXTRACT(EPOCH FROM (NOW() - q.created_at)) / (7.0 * 86400.0))) AS freshness,
      -- Vote score: normalized via sigmoid-like function
      LEAST(q.votes_count::NUMERIC / 50.0, 1.0) AS vote_score,
      -- Answer score: normalized
      LEAST(q.answers_count::NUMERIC / 20.0, 1.0) AS answer_score,
      -- Category affinity: 1.0 if matches user's categories, 0 otherwise
      CASE WHEN q.category IS NOT NULL AND q.category IN (SELECT uc.category FROM user_categories uc) THEN 1.0 ELSE 0.0 END AS category_affinity,
      -- Author affinity: 1.0 if followed, 0 otherwise
      CASE WHEN q.author_id IN (SELECT fu.following_id FROM followed_users fu) THEN 1.0 ELSE 0.0 END AS author_affinity,
      -- Reputation score: normalized to [0,1] with hard cap at 1000 rep
      LEAST(COALESCE(p.reputation, 0)::NUMERIC / 1000.0, 1.0) AS reputation_score,
      p.name AS author_name,
      p.username AS author_username,
      p.avatar_url AS author_avatar_url,
      p.reputation AS author_reputation
    FROM public.questions q
    JOIN public.profiles p ON p.id = q.author_id
    WHERE q.is_deleted = FALSE
      AND q.author_id != p_user_id  -- exclude own questions
      AND (
        p_cursor IS NULL
        OR (q.created_at, q.id) < (p_cursor, p_cursor_id)
      )
  )
  SELECT
    c.id,
    c.author_id,
    c.title,
    c.content,
    c.category,
    c.location,
    c.votes_count,
    c.answers_count,
    c.views_count,
    c.is_deleted,
    c.created_at,
    c.updated_at,
    -- Weighted score
    ROUND(
      (c.freshness * 0.35)
      + (c.vote_score * 0.25)
      + (c.answer_score * 0.15)
      + (c.category_affinity * 0.10)
      + (c.author_affinity * 0.10)
      + (c.reputation_score * 0.05),
    4) AS rank_score,
    jsonb_build_object(
      'id', c.author_id,
      'name', c.author_name,
      'username', c.author_username,
      'avatar_url', c.author_avatar_url,
      'reputation', c.author_reputation
    ) AS author
  FROM candidates c
  ORDER BY rank_score DESC, c.created_at DESC, c.id DESC
  LIMIT p_limit;
$$;


-- ============================================================
-- RPC: get_trending_feed
-- Momentum-based feed identifying content gaining traction:
--   trending_score = (votes_last_24h * 5)
--                  + (answers_last_24h * 3)
--                  + (recency_boost)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_trending_feed(
  p_limit    INT DEFAULT 20,
  p_cursor   TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  location TEXT,
  votes_count INTEGER,
  answers_count INTEGER,
  views_count INTEGER,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank_score NUMERIC,
  author jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH
  trending AS (
    SELECT
      q.id,
      q.author_id,
      q.title,
      q.content,
      q.category,
      q.location,
      q.votes_count,
      q.answers_count,
      q.views_count,
      q.is_deleted,
      q.created_at,
      q.updated_at,
      -- Votes in last 24 hours
      COALESCE((
        SELECT COUNT(*)
        FROM public.votes v
        WHERE v.target_id = q.id
          AND v.target_type = 'question'
          AND v.vote_type = 'up'
          AND v.created_at > (NOW() - INTERVAL '24 hours')
      ), 0) AS votes_24h,
      -- Answers in last 24 hours
      COALESCE((
        SELECT COUNT(*)
        FROM public.answers a
        WHERE a.question_id = q.id
          AND a.is_deleted = FALSE
          AND a.created_at > (NOW() - INTERVAL '24 hours')
      ), 0) AS answers_24h,
      -- Recency boost: questions from last 48h get a boost
      CASE
        WHEN q.created_at > (NOW() - INTERVAL '6 hours') THEN 20.0
        WHEN q.created_at > (NOW() - INTERVAL '24 hours') THEN 10.0
        WHEN q.created_at > (NOW() - INTERVAL '48 hours') THEN 5.0
        ELSE 0.0
      END AS recency_boost,
      p.name AS author_name,
      p.username AS author_username,
      p.avatar_url AS author_avatar_url,
      p.reputation AS author_reputation
    FROM public.questions q
    JOIN public.profiles p ON p.id = q.author_id
    WHERE q.is_deleted = FALSE
      AND q.created_at > (NOW() - INTERVAL '7 days')  -- only consider last 7 days
      AND (
        p_cursor IS NULL
        OR (q.created_at, q.id) < (p_cursor, p_cursor_id)
      )
  )
  SELECT
    t.id,
    t.author_id,
    t.title,
    t.content,
    t.category,
    t.location,
    t.votes_count,
    t.answers_count,
    t.views_count,
    t.is_deleted,
    t.created_at,
    t.updated_at,
    (t.votes_24h * 5 + t.answers_24h * 3 + t.recency_boost)::NUMERIC AS rank_score,
    jsonb_build_object(
      'id', t.author_id,
      'name', t.author_name,
      'username', t.author_username,
      'avatar_url', t.author_avatar_url,
      'reputation', t.author_reputation
    ) AS author
  FROM trending t
  WHERE (t.votes_24h + t.answers_24h) > 0 OR t.recency_boost > 0
  ORDER BY (t.votes_24h * 5 + t.answers_24h * 3 + t.recency_boost) DESC, t.created_at DESC, t.id DESC
  LIMIT p_limit;
$$;


-- ============================================================
-- RPC: get_following_feed
-- Questions from followed users, ranked by a simple score
-- then by created_at DESC.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_following_feed(
  p_user_id  UUID,
  p_limit    INT DEFAULT 20,
  p_cursor   TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  location TEXT,
  votes_count INTEGER,
  answers_count INTEGER,
  views_count INTEGER,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank_score NUMERIC,
  author jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH
  followed AS (
    SELECT f.following_id
    FROM public.follows f
    WHERE f.follower_id = p_user_id
  )
  SELECT
    q.id,
    q.author_id,
    q.title,
    q.content,
    q.category,
    q.location,
    q.votes_count,
    q.answers_count,
    q.views_count,
    q.is_deleted,
    q.created_at,
    q.updated_at,
    -- Simple score: freshness + engagement
    ROUND(
      GREATEST(0, 1.0 - (EXTRACT(EPOCH FROM (NOW() - q.created_at)) / (7.0 * 86400.0))) * 0.6
      + LEAST(q.votes_count::NUMERIC / 50.0, 1.0) * 0.25
      + LEAST(q.answers_count::NUMERIC / 20.0, 1.0) * 0.15,
    4) AS rank_score,
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'reputation', p.reputation
    ) AS author
  FROM public.questions q
  JOIN public.profiles p ON p.id = q.author_id
  WHERE q.is_deleted = FALSE
    AND q.author_id IN (SELECT fu.following_id FROM followed fu)
    AND (
      p_cursor IS NULL
      OR (q.created_at, q.id) < (p_cursor, p_cursor_id)
    )
  ORDER BY rank_score DESC, q.created_at DESC, q.id DESC
  LIMIT p_limit;
$$;
