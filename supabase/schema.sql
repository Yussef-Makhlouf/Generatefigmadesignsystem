-- ============================================================
-- KHAPEER PLATFORM - COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  avatar_url      TEXT,
  bio             TEXT,
  location        TEXT,
  account_type    TEXT NOT NULL DEFAULT 'individual'
                  CHECK (account_type IN ('individual','business','restaurant','clinic','doctor','activity','admin')),
  reputation      INTEGER NOT NULL DEFAULT 0,
  settings        JSONB DEFAULT '{}',
  -- Business / Entity fields
  business_category TEXT,
  business_license  TEXT,
  business_address  TEXT,
  business_rating   NUMERIC(3,1),
  reviews_count     INTEGER DEFAULT 0,
  operating_hours   TEXT,
  lat               NUMERIC(10,7),
  lng               NUMERIC(10,7),
  is_verified_entity BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (char_length(title) >= 15),
  content       TEXT NOT NULL CHECK (char_length(content) >= 20),
  category      TEXT,
  location      TEXT,
  votes_count   INTEGER NOT NULL DEFAULT 0,
  answers_count INTEGER NOT NULL DEFAULT 0,
  views_count   INTEGER NOT NULL DEFAULT 0,
  is_deleted    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. QUESTION ATTACHMENTS TABLE (images, links, locations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.question_attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('image','link','location')),
  url         TEXT,           -- For images and links
  title       TEXT,           -- For links: display title / For locations: place name
  address     TEXT,           -- For locations
  lat         NUMERIC(10,7),  -- For locations
  lng         NUMERIC(10,7),  -- For locations
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TAGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. QUESTION_TAGS (Junction Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.question_tags (
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  tag_id      UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

-- ============================================================
-- 6. ANSWERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id     UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  votes_count     INTEGER NOT NULL DEFAULT 0,
  is_accepted     BOOLEAN DEFAULT FALSE,
  verified_type   TEXT CHECK (verified_type IN ('photo', 'location', NULL)),
  verified_label  TEXT,
  is_deleted      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. ANSWER ATTACHMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.answer_attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id   UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('image','link','location')),
  url         TEXT,
  title       TEXT,
  address     TEXT,
  lat         NUMERIC(10,7),
  lng         NUMERIC(10,7),
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id   UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. VOTES TABLE (Questions and Answers)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id   UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  vote_type   TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, target_id, target_type)
);

-- ============================================================
-- 10. BOOKMARKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- ============================================================
-- 11. REVIEWS TABLE (Business/Entity Reviews)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  visit_date  DATE,
  is_deleted  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (reviewer_id, entity_id)  -- One review per entity per user
);

-- ============================================================
-- 12. REVIEW ATTACHMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.review_attachments (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  type      TEXT NOT NULL CHECK (type IN ('image','link')),
  url       TEXT NOT NULL,
  title     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('like','answer','system','achievement')),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. SPACES TABLE (Coming Soon)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.spaces (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url    TEXT,
  is_active   BOOLEAN DEFAULT FALSE,  -- FALSE = Coming Soon
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. REPUTATION LOGS TABLE (Audit trail for Gamification)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reputation_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points      INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  ref_id      UUID,   -- ID of question/answer/review that triggered this
  ref_type    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_questions_author ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_votes ON public.questions(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON public.answers(author_id);
CREATE INDEX IF NOT EXISTS idx_votes_target ON public.votes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity ON public.reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_reputation ON public.profiles(reputation DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questions_updated_at BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER answers_updated_at BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Reputation Engine: Award points automatically
CREATE OR REPLACE FUNCTION public.award_reputation(
  p_user_id UUID,
  p_points  INTEGER,
  p_reason  TEXT,
  p_ref_id  UUID DEFAULT NULL,
  p_ref_type TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET reputation = reputation + p_points WHERE id = p_user_id;
  INSERT INTO public.reputation_logs (user_id, points, reason, ref_id, ref_type)
  VALUES (p_user_id, p_points, p_reason, p_ref_id, p_ref_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Award +5 rep when asking a question
CREATE OR REPLACE FUNCTION public.on_question_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.award_reputation(NEW.author_id, 5, 'طرح سؤال جديد', NEW.id, 'question');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS question_rep_trigger ON public.questions;
CREATE TRIGGER question_rep_trigger
  AFTER INSERT ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.on_question_created();

-- Trigger: Award +10 rep when posting an answer
CREATE OR REPLACE FUNCTION public.on_answer_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.award_reputation(NEW.author_id, 10, 'تقديم إجابة', NEW.id, 'answer');
  -- Increment answers_count on the question
  UPDATE public.questions SET answers_count = answers_count + 1 WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS answer_rep_trigger ON public.answers;
CREATE TRIGGER answer_rep_trigger
  AFTER INSERT ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.on_answer_created();

-- Trigger: Award +15 rep on upvote, -5 on downvote (Handles INSERT, UPDATE, DELETE)
CREATE OR REPLACE FUNCTION public.on_vote_cast()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id   UUID;
  v_target_id   UUID;
  v_target_type TEXT;
  v_vote_change INTEGER := 0;
  v_rep_change  INTEGER := 0;
  v_rep_reason  TEXT;
BEGIN
  -- Determine target and details based on operation
  IF TG_OP = 'INSERT' THEN
    v_target_id := NEW.target_id;
    v_target_type := NEW.target_type;
    v_vote_change := CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END;
    v_rep_change := CASE WHEN NEW.vote_type = 'up' THEN 15 ELSE -5 END;
    v_rep_reason := CASE WHEN NEW.vote_type = 'up' THEN 'تصويت إيجابي' ELSE 'تصويت سلبي' END;
  ELSIF TG_OP = 'DELETE' THEN
    v_target_id := OLD.target_id;
    v_target_type := OLD.target_type;
    v_vote_change := CASE WHEN OLD.vote_type = 'up' THEN -1 ELSE 1 END;
    v_rep_change := CASE WHEN OLD.vote_type = 'up' THEN -15 ELSE 5 END;
    v_rep_reason := CASE WHEN OLD.vote_type = 'up' THEN 'إلغاء تصويت إيجابي' ELSE 'إلغاء تصويت سلبي' END;
  ELSIF TG_OP = 'UPDATE' THEN
    v_target_id := NEW.target_id;
    v_target_type := NEW.target_type;
    IF NEW.vote_type != OLD.vote_type THEN
      IF NEW.vote_type = 'up' THEN
        v_vote_change := 2; -- from down to up: +1 - (-1) = 2
        v_rep_change := 20; -- from down (-5) to up (+15): 15 - (-5) = 20
        v_rep_reason := 'تعديل التصويت إلى إيجابي';
      ELSE
        v_vote_change := -2; -- from up to down: -1 - 1 = -2
        v_rep_change := -20; -- from up (+15) to down (-5): -5 - 15 = -20
        v_rep_reason := 'تعديل التصويت إلى سلبي';
      END IF;
    END IF;
  END IF;

  -- Apply changes to votes count on target
  IF v_vote_change != 0 THEN
    IF v_target_type = 'question' THEN
      SELECT author_id INTO v_author_id FROM public.questions WHERE id = v_target_id;
      UPDATE public.questions SET votes_count = votes_count + v_vote_change WHERE id = v_target_id;
    ELSE
      SELECT author_id INTO v_author_id FROM public.answers WHERE id = v_target_id;
      UPDATE public.answers SET votes_count = votes_count + v_vote_change WHERE id = v_target_id;
    END IF;

    -- Apply reputation change to author
    -- (Don't award/deduct reputation if the user is voting on their own content)
    IF v_author_id IS NOT NULL AND v_author_id != COALESCE(NEW.user_id, OLD.user_id) AND v_rep_change != 0 THEN
      PERFORM public.award_reputation(v_author_id, v_rep_change, v_rep_reason, v_target_id, v_target_type);
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS vote_rep_trigger ON public.votes;
CREATE TRIGGER vote_rep_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.on_vote_cast();

-- Trigger: Recalculate business rating after new review
CREATE OR REPLACE FUNCTION public.on_review_change()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_id UUID;
  v_avg_rating NUMERIC;
  v_count INTEGER;
BEGIN
  v_entity_id := COALESCE(NEW.entity_id, OLD.entity_id);
  
  SELECT AVG(rating), COUNT(*) INTO v_avg_rating, v_count
  FROM public.reviews
  WHERE entity_id = v_entity_id AND is_deleted = FALSE;
  
  UPDATE public.profiles
  SET business_rating = ROUND(v_avg_rating, 1), reviews_count = v_count
  WHERE id = v_entity_id;
  
  -- Award +15 rep to entity for getting a review (on insert)
  IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
    PERFORM public.award_reputation(v_entity_id, 15, 'استقبال تقييم', NEW.id, 'review');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS review_rating_trigger ON public.reviews;
CREATE TRIGGER review_rating_trigger
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.on_review_change();

-- Trigger: Award +150 when entity gets verified
CREATE OR REPLACE FUNCTION public.on_entity_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_verified_entity = TRUE AND (OLD.is_verified_entity IS NULL OR OLD.is_verified_entity = FALSE) THEN
    PERFORM public.award_reputation(NEW.id, 150, 'اعتماد التوثيق المهني', NEW.id, 'profile');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS entity_verified_trigger ON public.profiles;
CREATE TRIGGER entity_verified_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.on_entity_verified();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_attachments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces          ENABLE ROW LEVEL SECURITY;

-- Public read access to most content
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Questions are publicly readable" ON public.questions FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "Answers are publicly readable" ON public.answers FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "Comments are publicly readable" ON public.comments FOR SELECT USING (TRUE);
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (is_deleted = FALSE);
CREATE POLICY "Tags are publicly readable" ON public.tags FOR SELECT USING (TRUE);
CREATE POLICY "Question tags are publicly readable" ON public.question_tags FOR SELECT USING (TRUE);
CREATE POLICY "Spaces are publicly readable" ON public.spaces FOR SELECT USING (TRUE);
CREATE POLICY "Attachments are publicly readable" ON public.question_attachments FOR SELECT USING (TRUE);
CREATE POLICY "Answer attachments are publicly readable" ON public.answer_attachments FOR SELECT USING (TRUE);

-- Authenticated write access
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can create questions" ON public.questions
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own questions" ON public.questions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can add attachments" ON public.question_attachments
  FOR INSERT WITH CHECK (auth.uid() = (SELECT author_id FROM public.questions WHERE id = question_id));

CREATE POLICY "Authenticated users can create answers" ON public.answers
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own answers" ON public.answers
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can add answer attachments" ON public.answer_attachments
  FOR INSERT WITH CHECK (auth.uid() = (SELECT author_id FROM public.answers WHERE id = answer_id));

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authenticated users can vote" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see own votes" ON public.votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can bookmark" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can review" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users see own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own reputation logs" ON public.reputation_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (account_type = 'admin')
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING ((SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete questions" ON public.questions
  FOR UPDATE USING ((SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR UPDATE USING ((SELECT account_type FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ── Increment tag usage RPC function ─────────────────────
CREATE OR REPLACE FUNCTION public.increment_tag_usage(tag_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tags SET usage_count = usage_count + 1 WHERE id = tag_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
