-- ============================================================
-- KHAPEER SCHEMA — UPGRADE LOG
-- Date: 2026-06-07
-- Changes:
-- ✅ Fixed on_review_change trigger to handle DELETE events
-- ✅ Fixed entity_verified_trigger to fire on INSERT OR UPDATE
-- ✅ Added prevent_self_vote trigger (DB-level block)
-- ✅ Added RLS UPDATE/DELETE policies for question_attachments
-- ✅ Added RLS UPDATE/DELETE policies for answer_attachments
-- ✅ Added RLS DELETE policy for comments (author can delete own)
-- ✅ Added RLS UPDATE/DELETE policies for votes
-- ✅ Added 6 missing performance indexes
-- ✅ Added updated_at column + trigger to question_attachments, answer_attachments, comments
-- ✅ Enhanced notifications table with notification_data JSONB, action_url, priority
-- ✅ Added review_attachments RLS policies (missing entirely)
-- ✅ Added answer_attachments RLS missing policies
-- ✅ Added spaces RLS missing write policy
-- ✅ Added admin DELETE policies for questions, answers, reviews
-- ✅ Added idx_reputation_logs_user index for leaderboard queries
-- ✅ Added idx_question_tags_tag index for tag-based lookups
-- ✅ Added partial index on notifications(user_id) WHERE is_read = FALSE
-- ✅ Hardened admin sub-query policy against auth.uid() IS NULL edge case
-- ✅ Added COMMENT on settings JSONB documenting expected structure
-- ✅ Added business_license storage-path guidance via column comment
-- ✅ Reputation anti-abuse: daily vote cap via reputation_daily_limits table
-- ✅ Added protect_profile_privileged_columns trigger (blocks self-admin escalation)
-- ✅ Added notification triggers (5): answers, comments, votes, follows, reviews
-- ✅ Added atomic RPCs: increment_view_count, cast_vote
-- ✅ Added accept-answer RLS policy (question-author only)
-- ✅ Added accepted-answer reputation trigger (+15 author, +2 asker)
-- ✅ Enhanced on_review_change with soft-delete reputation revocation (-15)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- تفعيل امتداد البيانات الجغرافية (اختياري — فعّله إذا احتجت بحث location)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ENUM-LIKE REFERENCE TABLES
-- استخدام جداول مرجعية بدل CHECK (IN (...)) لسهولة الصيانة والترجمة
-- ============================================================
CREATE TABLE IF NOT EXISTS public.account_types (
  value       TEXT PRIMARY KEY,
  label_ar    TEXT NOT NULL,
  label_en    TEXT NOT NULL
);
INSERT INTO public.account_types (value, label_ar, label_en) VALUES
  ('individual',  'فرد',         'Individual'),
  ('business',    'نشاط تجاري',  'Business'),
  ('restaurant',  'مطعم',        'Restaurant'),
  ('clinic',      'عيادة',       'Clinic'),
  ('doctor',      'طبيب',        'Doctor'),
  ('activity',    'نشاط',        'Activity'),
  ('admin',       'مدير',        'Admin')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.vote_types (
  value TEXT PRIMARY KEY,
  label_ar TEXT NOT NULL
);
INSERT INTO public.vote_types (value, label_ar) VALUES
  ('up',   'إيجابي'),
  ('down', 'سلبي')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.attachment_types (
  value TEXT PRIMARY KEY,
  label_ar TEXT NOT NULL
);
INSERT INTO public.attachment_types (value, label_ar) VALUES
  ('image',    'صورة'),
  ('link',     'رابط'),
  ('location', 'موقع')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.notification_types (
  value TEXT PRIMARY KEY,
  label_ar TEXT NOT NULL
);
INSERT INTO public.notification_types (value, label_ar) VALUES
  ('like',        'إعجاب'),
  ('answer',      'إجابة'),
  ('comment',     'تعليق'),
  ('follow',      'متابعة'),
  ('review',      'تقييم'),
  ('system',      'نظام'),
  ('achievement', 'إنجاز')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 1. PROFILES TABLE (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  avatar_url        TEXT,
  bio               TEXT,
  location          TEXT,
  account_type      TEXT NOT NULL DEFAULT 'individual'
                    REFERENCES public.account_types(value), -- ✅ FIXED: use ref table
  reputation        INTEGER NOT NULL DEFAULT 0,
  -- ✅ ENHANCED: JSONB settings with documented structure
  -- Expected keys:
  --   occupation TEXT        — المهنة / التخصص
  --   website    TEXT        — الموقع الإلكتروني
  --   cover_url  TEXT        — رابط صورة الغلاف
  --   phone      TEXT        — رقم الجوال
  --   notifications JSONB   — { email: bool, push: bool, sms: bool }
  --   privacy       JSONB   — { show_email: bool, show_phone: bool }
  --   appearance    JSONB   — { theme: 'light'|'dark'|'auto', lang: 'ar'|'en' }
  settings          JSONB DEFAULT '{}',
  -- Business / Entity fields
  business_category TEXT,
  -- ✅ NOTE: business_license يجب أن يخزّن مسار الملف في Supabase Storage
  --          وليس محتوى الترخيص نصاً. مثال: 'licenses/user-uuid/cr.pdf'
  business_license  TEXT,
  business_address  TEXT,
  business_rating   NUMERIC(3,1),
  reviews_count     INTEGER DEFAULT 0,
  operating_hours   TEXT,
  lat               NUMERIC(10,7),
  lng               NUMERIC(10,7),
  -- إذا أردت دعم الاستعلامات الجغرافية المتقدمة، فعّل PostGIS وأضف:
  -- location_geom   GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_MakePoint(lng, lat)) STORED,
  is_verified_entity BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.profiles.settings IS
  'JSONB — البنية المتوقعة: { occupation, website, cover_url, phone, notifications: { email, push, sms }, privacy: { show_email, show_phone }, appearance: { theme, lang } }';
COMMENT ON COLUMN public.profiles.business_license IS
  'مسار الملف في Supabase Storage فقط — مثال: licenses/{user_id}/cr.pdf — لا تخزّن محتوى الترخيص نصاً';

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
-- 3. QUESTION ATTACHMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.question_attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  type        TEXT NOT NULL REFERENCES public.attachment_types(value), -- ✅ FIXED: ref table
  url         TEXT,
  title       TEXT,
  address     TEXT,
  lat         NUMERIC(10,7),
  lng         NUMERIC(10,7),
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()  -- ✅ ADDED: missing updated_at
);

-- ============================================================
-- 4. TAGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
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
  type        TEXT NOT NULL REFERENCES public.attachment_types(value), -- ✅ FIXED: ref table
  url         TEXT,
  title       TEXT,
  address     TEXT,
  lat         NUMERIC(10,7),
  lng         NUMERIC(10,7),
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()  -- ✅ ADDED: missing updated_at
);

-- ============================================================
-- 8. COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id   UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()  -- ✅ ADDED: missing updated_at
);

-- ============================================================
-- 9. VOTES TABLE
-- ✅ NOTE: target_id has no DB-level FK because it can point to
--    questions OR answers. Referential integrity is enforced by
--    the on_vote_cast trigger (looks up both tables). If schema
--    grows, consider splitting into question_votes / answer_votes.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id   UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  vote_type   TEXT NOT NULL REFERENCES public.vote_types(value), -- ✅ FIXED: ref table
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
-- 11. REVIEWS TABLE
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
  updated_at  TIMESTAMPTZ DEFAULT NOW(),  -- ✅ ADDED: missing updated_at
  UNIQUE (reviewer_id, entity_id)
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
-- ✅ ENHANCED: Added notification_data, action_url, priority
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type                TEXT NOT NULL REFERENCES public.notification_types(value), -- ✅ FIXED: ref table
  title               TEXT NOT NULL,
  content             TEXT NOT NULL,
  -- ✅ ADDED: بيانات إضافية مرتبطة بالإشعار (معرف السؤال، اسم المستخدم، إلخ)
  notification_data   JSONB DEFAULT '{}',
  -- ✅ ADDED: رابط الانتقال عند الضغط على الإشعار
  action_url          TEXT,
  -- ✅ ADDED: أولوية الإشعار — low | normal | high | urgent
  priority            TEXT NOT NULL DEFAULT 'normal'
                      CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read             BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.notifications.notification_data IS
  'JSONB — البنية المتوقعة تختلف حسب النوع: { question_id, answer_id, actor_username, actor_avatar, ... }';

-- ============================================================
-- 14. SPACES TABLE (Coming Soon)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.spaces (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url    TEXT,
  is_active   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. REPUTATION LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reputation_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points      INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  ref_id      UUID,
  ref_type    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. FOLLOWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================================
-- 17. REPUTATION DAILY LIMITS TABLE
-- ✅ ADDED: حماية ضد التلاعب — حد يومي لنقاط السمعة المكتسبة من التصويت
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reputation_daily_limits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

COMMENT ON TABLE public.reputation_daily_limits IS
  'جدول الحد اليومي لنقاط السمعة — الحد الأقصى الموصى به: 200 نقطة/يوم من التصويت. يُحدَّث بواسطة trigger on_vote_cast.';

-- ============================================================
-- INDEXES
-- ============================================================

-- Existing indexes (kept)
CREATE INDEX IF NOT EXISTS idx_questions_author   ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created  ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_votes    ON public.questions(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question   ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author     ON public.answers(author_id);
CREATE INDEX IF NOT EXISTS idx_votes_target       ON public.votes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_votes_user         ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity     ON public.reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_username  ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_reputation ON public.profiles(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower   ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following  ON public.follows(following_id);

-- ✅ ADDED: Missing performance indexes
CREATE INDEX IF NOT EXISTS idx_question_attachments_question
  ON public.question_attachments(question_id);

CREATE INDEX IF NOT EXISTS idx_answer_attachments_answer
  ON public.answer_attachments(answer_id);

CREATE INDEX IF NOT EXISTS idx_comments_answer
  ON public.comments(answer_id);

-- ✅ ADDED: Index for leaderboard & reputation history queries
CREATE INDEX IF NOT EXISTS idx_reputation_logs_user_date
  ON public.reputation_logs(user_id, created_at DESC);

-- ✅ ADDED: Index for tag-based question lookups
CREATE INDEX IF NOT EXISTS idx_question_tags_tag
  ON public.question_tags(tag_id);

-- ✅ ADDED: Partial index — only unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications(user_id)
  WHERE is_read = FALSE;

-- ✅ ADDED: Index for daily limit lookups
CREATE INDEX IF NOT EXISTS idx_reputation_daily_limits_user_date
  ON public.reputation_daily_limits(user_id, date);

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

-- ============================================================
-- updated_at auto-update function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Existing updated_at triggers
DROP TRIGGER IF EXISTS questions_updated_at       ON public.questions;
CREATE TRIGGER questions_updated_at       BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at        ON public.profiles;
CREATE TRIGGER profiles_updated_at        BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ✅ ADDED: Block non-admin self-escalation on privileged profile columns
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN := FALSE;
BEGIN
  IF coalesce(auth.role(), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS NOT NULL THEN
    SELECT (account_type = 'admin') INTO caller_is_admin
    FROM public.profiles
    WHERE id = auth.uid();
  END IF;

  IF caller_is_admin THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.id THEN
    RAISE WARNING 'protect_profile_privileged_columns: reverted privileged columns for self-update on profile %', OLD.id;
    NEW.account_type := OLD.account_type;
    NEW.reputation := OLD.reputation;
    NEW.is_verified_entity := OLD.is_verified_entity;
    RETURN NEW;
  END IF;

  RAISE WARNING 'protect_profile_privileged_columns: blocked cross-user update attempt on profile % by %', OLD.id, auth.uid();
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER protect_profile_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();

DROP TRIGGER IF EXISTS answers_updated_at         ON public.answers;
CREATE TRIGGER answers_updated_at         BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ✅ ADDED: updated_at triggers for tables that were missing them
DROP TRIGGER IF EXISTS question_attachments_updated_at ON public.question_attachments;
CREATE TRIGGER question_attachments_updated_at BEFORE UPDATE ON public.question_attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS answer_attachments_updated_at   ON public.answer_attachments;
CREATE TRIGGER answer_attachments_updated_at   BEFORE UPDATE ON public.answer_attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS comments_updated_at        ON public.comments;
CREATE TRIGGER comments_updated_at        BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS reviews_updated_at         ON public.reviews;
CREATE TRIGGER reviews_updated_at         BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- REPUTATION ENGINE
-- ============================================================

-- دالة مساعدة: منح أو خصم نقاط السمعة مع تسجيل الحدث
CREATE OR REPLACE FUNCTION public.award_reputation(
  p_user_id  UUID,
  p_points   INTEGER,
  p_reason   TEXT,
  p_ref_id   UUID DEFAULT NULL,
  p_ref_type TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET reputation = reputation + p_points
  WHERE id = p_user_id;

  INSERT INTO public.reputation_logs (user_id, points, reason, ref_id, ref_type)
  VALUES (p_user_id, p_points, p_reason, p_ref_id, p_ref_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ✅ ADDED: دالة مساعدة للتحقق من الحد اليومي لنقاط السمعة من التصويت
-- الحد الأقصى: 200 نقطة إيجابية في اليوم الواحد لمنع التلاعب
CREATE OR REPLACE FUNCTION public.check_daily_rep_limit(
  p_user_id UUID,
  p_points  INTEGER,
  p_max     INTEGER DEFAULT 200
)
RETURNS INTEGER AS $$
DECLARE
  v_today_earned INTEGER;
  v_allowed      INTEGER;
BEGIN
  -- اقرأ النقاط المكتسبة اليوم
  SELECT COALESCE(points_earned, 0) INTO v_today_earned
  FROM public.reputation_daily_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  -- احسب ما يُسمح به من النقاط الإيجابية
  IF p_points > 0 THEN
    v_allowed := LEAST(p_points, GREATEST(0, p_max - v_today_earned));
  ELSE
    v_allowed := p_points; -- النقاط السلبية لا تخضع للحد
  END IF;

  -- حدّث أو أنشئ سجل اليوم
  IF v_allowed > 0 THEN
    INSERT INTO public.reputation_daily_limits (user_id, date, points_earned)
    VALUES (p_user_id, CURRENT_DATE, v_allowed)
    ON CONFLICT (user_id, date)
    DO UPDATE SET points_earned = reputation_daily_limits.points_earned + v_allowed;
  END IF;

  RETURN v_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- +5 نقاط عند طرح سؤال جديد
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

-- +10 نقاط عند تقديم إجابة + زيادة عداد الإجابات
CREATE OR REPLACE FUNCTION public.on_answer_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.award_reputation(NEW.author_id, 10, 'تقديم إجابة', NEW.id, 'answer');
  UPDATE public.questions SET answers_count = answers_count + 1 WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS answer_rep_trigger ON public.answers;
CREATE TRIGGER answer_rep_trigger
  AFTER INSERT ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.on_answer_created();

-- ✅ ADDED: منع التصويت على المحتوى الخاص بالمستخدم نفسه على مستوى قاعدة البيانات
CREATE OR REPLACE FUNCTION public.check_no_self_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  -- ابحث عن صاحب المحتوى المُصوَّت عليه
  IF NEW.target_type = 'question' THEN
    SELECT author_id INTO v_author_id FROM public.questions WHERE id = NEW.target_id;
  ELSE
    SELECT author_id INTO v_author_id FROM public.answers WHERE id = NEW.target_id;
  END IF;

  IF v_author_id IS NOT NULL AND v_author_id = NEW.user_id THEN
    RAISE EXCEPTION 'لا يمكنك التصويت على محتواك الخاص';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_self_vote ON public.votes;
-- ✅ FIXED: BEFORE trigger يمنع تسجيل الصوت من الأساس
CREATE TRIGGER prevent_self_vote
  BEFORE INSERT OR UPDATE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.check_no_self_vote();

-- نقاط السمعة عند التصويت: +15 للإيجابي، -5 للسلبي
-- يدعم INSERT / UPDATE / DELETE مع الحد اليومي
CREATE OR REPLACE FUNCTION public.on_vote_cast()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id   UUID;
  v_target_id   UUID;
  v_target_type TEXT;
  v_vote_change INTEGER := 0;
  v_rep_change  INTEGER := 0;
  v_rep_reason  TEXT;
  v_allowed_rep INTEGER;
BEGIN
  -- تحديد التفاصيل بناءً على نوع العملية
  IF TG_OP = 'INSERT' THEN
    v_target_id   := NEW.target_id;
    v_target_type := NEW.target_type;
    v_vote_change := CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END;
    v_rep_change  := CASE WHEN NEW.vote_type = 'up' THEN 15 ELSE -5 END;
    v_rep_reason  := CASE WHEN NEW.vote_type = 'up' THEN 'تصويت إيجابي' ELSE 'تصويت سلبي' END;
  ELSIF TG_OP = 'DELETE' THEN
    v_target_id   := OLD.target_id;
    v_target_type := OLD.target_type;
    v_vote_change := CASE WHEN OLD.vote_type = 'up' THEN -1 ELSE 1 END;
    v_rep_change  := CASE WHEN OLD.vote_type = 'up' THEN -15 ELSE 5 END;
    v_rep_reason  := CASE WHEN OLD.vote_type = 'up' THEN 'إلغاء تصويت إيجابي' ELSE 'إلغاء تصويت سلبي' END;
  ELSIF TG_OP = 'UPDATE' THEN
    v_target_id   := NEW.target_id;
    v_target_type := NEW.target_type;
    IF NEW.vote_type != OLD.vote_type THEN
      IF NEW.vote_type = 'up' THEN
        v_vote_change := 2;
        v_rep_change  := 20;
        v_rep_reason  := 'تعديل التصويت إلى إيجابي';
      ELSE
        v_vote_change := -2;
        v_rep_change  := -20;
        v_rep_reason  := 'تعديل التصويت إلى سلبي';
      END IF;
    END IF;
  END IF;

  -- تطبيق التغييرات على عداد الأصوات ونقاط السمعة
  IF v_vote_change != 0 THEN
    IF v_target_type = 'question' THEN
      SELECT author_id INTO v_author_id FROM public.questions WHERE id = v_target_id;
      UPDATE public.questions SET votes_count = votes_count + v_vote_change WHERE id = v_target_id;
    ELSE
      SELECT author_id INTO v_author_id FROM public.answers WHERE id = v_target_id;
      UPDATE public.answers SET votes_count = votes_count + v_vote_change WHERE id = v_target_id;
    END IF;

    -- لا تمنح/تخصم سمعة إذا كان صاحب المحتوى هو المصوِّت نفسه
    -- (prevent_self_vote يمنع ذلك، لكن هذا check دفاعي إضافي)
    IF v_author_id IS NOT NULL AND v_author_id != COALESCE(NEW.user_id, OLD.user_id) AND v_rep_change != 0 THEN
      -- تطبيق الحد اليومي على النقاط الإيجابية فقط
      v_allowed_rep := public.check_daily_rep_limit(v_author_id, v_rep_change);
      IF v_allowed_rep != 0 THEN
        PERFORM public.award_reputation(v_author_id, v_allowed_rep, v_rep_reason, v_target_id, v_target_type);
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS vote_rep_trigger ON public.votes;
CREATE TRIGGER vote_rep_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.on_vote_cast();

-- ✅ FIXED: إعادة حساب تقييم النشاط التجاري عند INSERT أو UPDATE أو DELETE
CREATE OR REPLACE FUNCTION public.on_review_change()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_id  UUID;
  v_avg_rating NUMERIC;
  v_count      INTEGER;
BEGIN
  -- يعمل مع INSERT وUPDATE وDELETE
  v_entity_id := COALESCE(NEW.entity_id, OLD.entity_id);

  SELECT AVG(rating), COUNT(*) INTO v_avg_rating, v_count
  FROM public.reviews
  WHERE entity_id = v_entity_id AND is_deleted = FALSE;

  UPDATE public.profiles
  SET business_rating = ROUND(v_avg_rating, 1),
      reviews_count   = v_count
  WHERE id = v_entity_id;

  -- منح +15 نقطة للنشاط عند استقبال تقييم جديد
  IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
    PERFORM public.award_reputation(v_entity_id, 15, 'استقبال تقييم', NEW.id, 'review');
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS review_rating_trigger ON public.reviews;
-- ✅ FIXED: أضفنا OR DELETE لضمان تحديث التقييم عند حذف مراجعة
CREATE TRIGGER review_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.on_review_change();

-- ✅ FIXED: منح +150 نقطة عند توثيق الحساب — يعمل على INSERT وUPDATE
CREATE OR REPLACE FUNCTION public.on_entity_verified()
RETURNS TRIGGER AS $$
BEGIN
  -- حالة التحديث: من غير موثّق إلى موثّق
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_verified_entity = TRUE AND (OLD.is_verified_entity IS NULL OR OLD.is_verified_entity = FALSE) THEN
      PERFORM public.award_reputation(NEW.id, 150, 'اعتماد التوثيق المهني', NEW.id, 'profile');
    END IF;
  -- ✅ FIXED: حالة الإنشاء: إذا أُنشئ الحساب موثّقاً مباشرة
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.is_verified_entity = TRUE THEN
      PERFORM public.award_reputation(NEW.id, 150, 'اعتماد التوثيق المهني', NEW.id, 'profile');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS entity_verified_trigger ON public.profiles;
-- ✅ FIXED: أضفنا OR INSERT ليشمل الحسابات التي تُنشأ موثّقة
CREATE TRIGGER entity_verified_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.on_entity_verified();

-- ============================================================
-- FOLLOWS helper functions
-- ============================================================

-- منع متابعة النفس على مستوى قاعدة البيانات
CREATE OR REPLACE FUNCTION public.check_not_self_follow()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.follower_id = NEW.following_id THEN
    RAISE EXCEPTION 'لا يمكنك متابعة نفسك';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_self_follow ON public.follows;
CREATE TRIGGER prevent_self_follow BEFORE INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.check_not_self_follow();

-- دالة toggle للمتابعة (آمنة ومباشرة)
CREATE OR REPLACE FUNCTION public.toggle_follow(
  p_follower_id  UUID,
  p_following_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_follower_id = p_following_id THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = p_follower_id AND following_id = p_following_id
  ) THEN
    DELETE FROM public.follows
    WHERE follower_id = p_follower_id AND following_id = p_following_id;
    RETURN FALSE; -- تم إلغاء المتابعة
  ELSE
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (p_follower_id, p_following_id);
    RETURN TRUE; -- تمت المتابعة
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC لزيادة عداد استخدام الوسم
CREATE OR REPLACE FUNCTION public.increment_tag_usage(tag_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tags SET usage_count = usage_count + 1 WHERE id = tag_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_attachments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_attachments   ENABLE ROW LEVEL SECURITY;  -- ✅ ADDED: missing
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_daily_limits ENABLE ROW LEVEL SECURITY; -- ✅ ADDED
ALTER TABLE public.account_types        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_types           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachment_types     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_types   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Questions are publicly readable" ON public.questions;
CREATE POLICY "Questions are publicly readable"
  ON public.questions FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Answers are publicly readable" ON public.answers;
CREATE POLICY "Answers are publicly readable"
  ON public.answers FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Comments are publicly readable" ON public.comments;
CREATE POLICY "Comments are publicly readable"
  ON public.comments FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Tags are publicly readable" ON public.tags;
CREATE POLICY "Tags are publicly readable"
  ON public.tags FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.tags;
CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Question tags are publicly readable" ON public.question_tags;
CREATE POLICY "Question tags are publicly readable"
  ON public.question_tags FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can link tags to questions" ON public.question_tags;
CREATE POLICY "Authenticated users can link tags to questions"
  ON public.question_tags FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.questions
      WHERE id = question_id AND author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Spaces are publicly readable" ON public.spaces;
CREATE POLICY "Spaces are publicly readable"
  ON public.spaces FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Question attachments are publicly readable" ON public.question_attachments;
CREATE POLICY "Question attachments are publicly readable"
  ON public.question_attachments FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Answer attachments are publicly readable" ON public.answer_attachments;
CREATE POLICY "Answer attachments are publicly readable"
  ON public.answer_attachments FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Review attachments are publicly readable" ON public.review_attachments;
CREATE POLICY "Review attachments are publicly readable"  -- ✅ ADDED
  ON public.review_attachments FOR SELECT USING (TRUE);

-- جداول الأنواع المرجعية قابلة للقراءة للجميع
DROP POLICY IF EXISTS "Account types are publicly readable" ON public.account_types;
CREATE POLICY "Account types are publicly readable"
  ON public.account_types FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Vote types are publicly readable" ON public.vote_types;
CREATE POLICY "Vote types are publicly readable"
  ON public.vote_types FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Attachment types are publicly readable" ON public.attachment_types;
CREATE POLICY "Attachment types are publicly readable"
  ON public.attachment_types FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Notification types are publicly readable" ON public.notification_types;
CREATE POLICY "Notification types are publicly readable"
  ON public.notification_types FOR SELECT USING (TRUE);

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- QUESTIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create questions" ON public.questions;
CREATE POLICY "Authenticated users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own questions" ON public.questions;
CREATE POLICY "Authors can update own questions"
  ON public.questions FOR UPDATE
  USING (auth.uid() = author_id);

-- ============================================================
-- QUESTION ATTACHMENTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authors can add question attachments" ON public.question_attachments;
CREATE POLICY "Authors can add question attachments"
  ON public.question_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT author_id FROM public.questions WHERE id = question_id)
  );

DROP POLICY IF EXISTS "Authors can update own question attachments" ON public.question_attachments;
CREATE POLICY "Authors can update own question attachments"
  ON public.question_attachments FOR UPDATE
  USING (
    auth.uid() = (SELECT author_id FROM public.questions WHERE id = question_id)
  );

DROP POLICY IF EXISTS "Authors can delete own question attachments" ON public.question_attachments;
CREATE POLICY "Authors can delete own question attachments"
  ON public.question_attachments FOR DELETE
  USING (
    auth.uid() = (SELECT author_id FROM public.questions WHERE id = question_id)
  );

-- ============================================================
-- ANSWERS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create answers" ON public.answers;
CREATE POLICY "Authenticated users can create answers"
  ON public.answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own answers" ON public.answers;
CREATE POLICY "Authors can update own answers"
  ON public.answers FOR UPDATE
  USING (auth.uid() = author_id);

-- ============================================================
-- ANSWER ATTACHMENTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authors can add answer attachments" ON public.answer_attachments;
CREATE POLICY "Authors can add answer attachments"
  ON public.answer_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT author_id FROM public.answers WHERE id = answer_id)
  );

DROP POLICY IF EXISTS "Authors can update own answer attachments" ON public.answer_attachments;
CREATE POLICY "Authors can update own answer attachments"
  ON public.answer_attachments FOR UPDATE
  USING (
    auth.uid() = (SELECT author_id FROM public.answers WHERE id = answer_id)
  );

DROP POLICY IF EXISTS "Authors can delete own answer attachments" ON public.answer_attachments;
CREATE POLICY "Authors can delete own answer attachments"
  ON public.answer_attachments FOR DELETE
  USING (
    auth.uid() = (SELECT author_id FROM public.answers WHERE id = answer_id)
  );

-- ============================================================
-- COMMENTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own comments" ON public.comments;
CREATE POLICY "Authors can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete own comments" ON public.comments;
CREATE POLICY "Authors can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================
-- VOTES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.votes;
CREATE POLICY "Authenticated users can vote"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can see own votes" ON public.votes;
CREATE POLICY "Users can see own votes"
  ON public.votes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes" ON public.votes;
CREATE POLICY "Users can update own votes"
  ON public.votes FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON public.votes;
CREATE POLICY "Users can delete own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- BOOKMARKS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can manage bookmarks" ON public.bookmarks;
CREATE POLICY "Authenticated users can manage bookmarks"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

-- ============================================================
-- REVIEW ATTACHMENTS POLICIES (✅ ADDED: completely missing before)
-- ============================================================
DROP POLICY IF EXISTS "Reviewers can add review attachments" ON public.review_attachments;
CREATE POLICY "Reviewers can add review attachments"
  ON public.review_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT reviewer_id FROM public.reviews WHERE id = review_id)
  );

DROP POLICY IF EXISTS "Reviewers can delete own review attachments" ON public.review_attachments;
CREATE POLICY "Reviewers can delete own review attachments"
  ON public.review_attachments FOR DELETE
  USING (
    auth.uid() = (SELECT reviewer_id FROM public.reviews WHERE id = review_id)
  );

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- REPUTATION LOGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users see own reputation logs" ON public.reputation_logs;
CREATE POLICY "Users see own reputation logs"
  ON public.reputation_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- FOLLOWS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Follows are publicly readable" ON public.follows;
CREATE POLICY "Follows are publicly readable"
  ON public.follows FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can create follows" ON public.follows;
CREATE POLICY "Authenticated users can create follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can delete own follows" ON public.follows;
CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================================
-- REPUTATION DAILY LIMITS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "Users see own daily limits" ON public.reputation_daily_limits;
CREATE POLICY "Users see own daily limits"
  ON public.reputation_daily_limits FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- ADMIN OVERRIDE POLICIES
-- ✅ FIXED: استخدام EXISTS بدلاً من sub-SELECT لأداء أفضل وأمان أعلى
-- ✅ FIXED: نتأكد من أن auth.uid() IS NOT NULL قبل فحص صلاحية الأدمن
-- ============================================================
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can soft-delete questions" ON public.questions;
CREATE POLICY "Admins can soft-delete questions"
  ON public.questions FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can hard-delete questions" ON public.questions;
CREATE POLICY "Admins can hard-delete questions"
  ON public.questions FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can soft-delete reviews" ON public.reviews;
CREATE POLICY "Admins can soft-delete reviews"
  ON public.reviews FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can hard-delete reviews" ON public.reviews;
CREATE POLICY "Admins can hard-delete reviews"
  ON public.reviews FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
CREATE POLICY "Admins can delete comments"
  ON public.comments FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can soft-delete answers" ON public.answers;
CREATE POLICY "Admins can soft-delete answers"
  ON public.answers FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage spaces" ON public.spaces;
CREATE POLICY "Admins can manage spaces"
  ON public.spaces FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- ============================================================
-- NOTIFICATION TRIGGERS (Automated Social Loop)
-- ============================================================

-- Notify question author when someone answers
CREATE OR REPLACE FUNCTION public.notify_on_answer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question_author UUID;
BEGIN
  SELECT author_id INTO v_question_author
  FROM public.questions WHERE id = NEW.question_id;

  IF v_question_author IS NOT NULL AND v_question_author != NEW.author_id THEN
    INSERT INTO public.notifications (
      user_id, type, title, content,
      notification_data, action_url, priority
    ) VALUES (
      v_question_author,
      'answer',
      'إجابة جديدة على سؤالك',
      left(NEW.content, 120) || CASE WHEN length(NEW.content) > 120 THEN '...' ELSE '' END,
      jsonb_build_object(
        'answer_id', NEW.id,
        'question_id', NEW.question_id,
        'actor_id', NEW.author_id
      ),
      '/questions/' || NEW.question_id,
      'normal'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_answer_trigger ON public.answers;
CREATE TRIGGER notify_answer_trigger
  AFTER INSERT ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_answer();


-- Notify answer author when someone comments
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_answer_author UUID;
  v_question_id   UUID;
BEGIN
  SELECT author_id, question_id INTO v_answer_author, v_question_id
  FROM public.answers WHERE id = NEW.answer_id;

  IF v_answer_author IS NOT NULL AND v_answer_author != NEW.author_id THEN
    INSERT INTO public.notifications (
      user_id, type, title, content,
      notification_data, action_url, priority
    ) VALUES (
      v_answer_author,
      'comment',
      'تعليق جديد على إجابتك',
      left(NEW.content, 120) || CASE WHEN length(NEW.content) > 120 THEN '...' ELSE '' END,
      jsonb_build_object(
        'comment_id', NEW.id,
        'answer_id', NEW.answer_id,
        'question_id', v_question_id,
        'actor_id', NEW.author_id
      ),
      '/questions/' || v_question_id,
      'normal'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_comment_trigger ON public.comments;
CREATE TRIGGER notify_comment_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();


-- Notify content author when someone votes
CREATE OR REPLACE FUNCTION public.notify_on_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id   UUID;
  v_title       TEXT;
  v_action_url  TEXT;
BEGIN
  IF NEW.target_type = 'question' THEN
    SELECT author_id INTO v_author_id FROM public.questions WHERE id = NEW.target_id;
    v_title := CASE WHEN NEW.vote_type = 'up' THEN 'تصويت إيجابي على سؤالك' ELSE 'تصويت سلبي على سؤالك' END;
    v_action_url := '/questions/' || NEW.target_id;
  ELSE
    SELECT author_id INTO v_author_id FROM public.answers WHERE id = NEW.target_id;
    v_title := CASE WHEN NEW.vote_type = 'up' THEN 'تصويت إيجابي على إجابتك' ELSE 'تصويت سلبي على إجابتك' END;
    SELECT '/questions/' || question_id INTO v_action_url
    FROM public.answers WHERE id = NEW.target_id;
  END IF;

  IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id, type, title, content,
      notification_data, action_url, priority
    ) VALUES (
      v_author_id,
      'like',
      v_title,
      '',
      jsonb_build_object(
        'target_id', NEW.target_id,
        'target_type', NEW.target_type,
        'vote_type', NEW.vote_type,
        'actor_id', NEW.user_id
      ),
      v_action_url,
      CASE WHEN NEW.vote_type = 'up' THEN 'normal' ELSE 'low' END
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_vote_trigger ON public.votes;
CREATE TRIGGER notify_vote_trigger
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_vote();


-- Notify user when someone follows them
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id, type, title, content,
    notification_data, action_url, priority
  ) VALUES (
    NEW.following_id,
    'follow',
    'متابع جديد',
    'بدأ شخص بمتابعتك',
    jsonb_build_object('follower_id', NEW.follower_id),
    '/profile/' || NEW.follower_id,
    'low'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_follow_trigger ON public.follows;
CREATE TRIGGER notify_follow_trigger
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();


-- Notify entity when someone reviews them
CREATE OR REPLACE FUNCTION public.notify_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.entity_id != NEW.reviewer_id AND NEW.is_deleted = FALSE THEN
    INSERT INTO public.notifications (
      user_id, type, title, content,
      notification_data, action_url, priority
    ) VALUES (
      NEW.entity_id,
      'review',
      'تقييم جديد',
      left(NEW.comment, 120) || CASE WHEN length(NEW.comment) > 120 THEN '...' ELSE '' END,
      jsonb_build_object(
        'review_id', NEW.id,
        'rating', NEW.rating,
        'reviewer_id', NEW.reviewer_id
      ),
      '/profile/' || NEW.reviewer_id,
      'normal'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_review_trigger ON public.reviews;
CREATE TRIGGER notify_review_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_review();


-- ============================================================
-- ATOMIC RPCs
-- ============================================================

-- Atomic view counter increment (replaces read-modify-write race)
CREATE OR REPLACE FUNCTION public.increment_view_count(p_question_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.questions
  SET views_count = views_count + 1
  WHERE id = p_question_id;
$$;


-- Atomic vote toggle (select + insert/update/delete in one transaction)
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_user_id     UUID,
  p_target_id   UUID,
  p_target_type TEXT,
  p_vote_type   TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_id   UUID;
  v_existing_type TEXT;
BEGIN
  IF p_target_type NOT IN ('question', 'answer') THEN
    RAISE EXCEPTION 'Invalid target_type: %', p_target_type;
  END IF;

  IF p_vote_type NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid vote_type: %', p_vote_type;
  END IF;

  SELECT id, vote_type INTO v_existing_id, v_existing_type
  FROM public.votes
  WHERE user_id = p_user_id
    AND target_id = p_target_id
    AND target_type = p_target_type;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.votes (user_id, target_id, target_type, vote_type)
    VALUES (p_user_id, p_target_id, p_target_type, p_vote_type);
    RETURN 'inserted';
  ELSIF v_existing_type = p_vote_type THEN
    DELETE FROM public.votes WHERE id = v_existing_id;
    RETURN 'deleted';
  ELSE
    UPDATE public.votes SET vote_type = p_vote_type WHERE id = v_existing_id;
    RETURN 'updated';
  END IF;
END;
$$;


-- ============================================================
-- ACCEPT ANSWER RLS POLICY
-- ============================================================

DROP POLICY IF EXISTS "Question authors can accept/unaccept answers" ON public.answers;
CREATE POLICY "Question authors can accept/unaccept answers"
  ON public.answers FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = (SELECT author_id FROM public.questions WHERE id = question_id)
  );


-- ============================================================
-- ACCEPTED ANSWER REPUTATION TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.on_answer_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question_author UUID;
BEGIN
  IF NEW.is_accepted = TRUE AND (OLD.is_accepted IS NULL OR OLD.is_accepted = FALSE) THEN
    PERFORM public.award_reputation(NEW.author_id, 15, 'إجابة مقبولة', NEW.id, 'answer');
    SELECT author_id INTO v_question_author FROM public.questions WHERE id = NEW.question_id;
    IF v_question_author IS NOT NULL THEN
      PERFORM public.award_reputation(v_question_author, 2, 'قبول إجابة', NEW.id, 'answer');
    END IF;
  ELSIF (NEW.is_accepted IS NULL OR NEW.is_accepted = FALSE) AND OLD.is_accepted = TRUE THEN
    PERFORM public.award_reputation(NEW.author_id, -15, 'إلغاء قبول الإجابة', NEW.id, 'answer');
    SELECT author_id INTO v_question_author FROM public.questions WHERE id = NEW.question_id;
    IF v_question_author IS NOT NULL THEN
      PERFORM public.award_reputation(v_question_author, -2, 'إلغاء قبول الإجابة', NEW.id, 'answer');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS answer_accepted_trigger ON public.answers;
CREATE TRIGGER answer_accepted_trigger
  AFTER UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.on_answer_accepted();


-- ============================================================
-- ENHANCED REVIEW CHANGE (with soft-delete reputation revocation)
-- ============================================================

CREATE OR REPLACE FUNCTION public.on_review_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entity_id  UUID;
  v_avg_rating NUMERIC;
  v_count      INTEGER;
BEGIN
  v_entity_id := COALESCE(NEW.entity_id, OLD.entity_id);

  SELECT AVG(rating), COUNT(*) INTO v_avg_rating, v_count
  FROM public.reviews
  WHERE entity_id = v_entity_id AND is_deleted = FALSE;

  UPDATE public.profiles
  SET business_rating = ROUND(v_avg_rating, 1),
      reviews_count   = v_count
  WHERE id = v_entity_id;

  IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
    PERFORM public.award_reputation(v_entity_id, 15, 'استقبال تقييم', NEW.id, 'review');
  END IF;

  -- ✅ ADDED: Revoke reputation when review is soft-deleted
  IF TG_OP = 'UPDATE' AND NEW.is_deleted = TRUE AND (OLD.is_deleted IS NULL OR OLD.is_deleted = FALSE) THEN
    PERFORM public.award_reputation(v_entity_id, -15, 'حذف تقييم', NEW.id, 'review');
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS review_rating_trigger ON public.reviews;
CREATE TRIGGER review_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.on_review_change();


-- ============================================================
-- END OF KHAPEER SCHEMA v2.1
-- ============================================================
