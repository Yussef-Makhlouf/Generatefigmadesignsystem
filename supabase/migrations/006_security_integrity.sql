-- ============================================================
-- Migration 006: Security & Data Integrity Fixes
-- Date: 2026-06-07
-- Changes:
--   Notification triggers (5) for social loop automation
--   Atomic RPCs: increment_view_count, cast_vote
--   Accept-answer RLS policy (question-author only)
--   Accepted-answer reputation trigger (+15 author, +2 asker)
--   Review soft-delete reputation revocation (-15)
-- ============================================================

-- ============================================================
-- 0. FIX NOTIFICATIONS TYPE CONSTRAINT
-- ============================================================

-- The live database may still have an old CHECK constraint on `type`.
-- schema.sql defines it as FK → notification_types(value).
-- Drop the old CHECK constraint (if present) and ensure the FK exists.

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Ensure notification_types table and all required values exist
INSERT INTO public.notification_types (value, label_ar) VALUES
  ('like',        'إعجاب'),
  ('answer',      'إجابة'),
  ('comment',     'تعليق'),
  ('follow',      'متابعة'),
  ('review',      'تقييم'),
  ('system',      'نظام'),
  ('achievement', 'إنجاز')
ON CONFLICT (value) DO NOTHING;

-- Add FK if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_type_fkey'
      AND table_name = 'notifications'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_type_fkey
      FOREIGN KEY (type) REFERENCES public.notification_types(value);
  END IF;
END $$;


-- ============================================================
-- 1. NOTIFICATION TRIGGERS
-- ============================================================

-- 1a. Notify question author when someone answers
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
  FROM public.questions
  WHERE id = NEW.question_id;

  -- Don't notify yourself
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


-- 1b. Notify answer author when someone comments
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
  FROM public.answers
  WHERE id = NEW.answer_id;

  -- Don't notify yourself
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


-- 1c. Notify content author when someone votes
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
  -- Look up content author
  IF NEW.target_type = 'question' THEN
    SELECT author_id INTO v_author_id FROM public.questions WHERE id = NEW.target_id;
    v_title := CASE WHEN NEW.vote_type = 'up' THEN 'تصويت إيجابي على سؤالك' ELSE 'تصويت سلبي على سؤالك' END;
    v_action_url := '/questions/' || NEW.target_id;
  ELSE
    SELECT author_id INTO v_author_id FROM public.answers WHERE id = NEW.target_id;
    v_title := CASE WHEN NEW.vote_type = 'up' THEN 'تصويت إيجابي على إجابتك' ELSE 'تصويت سلبي على إجابتك' END;
    -- For answer votes, link to the parent question
    SELECT '/questions/' || question_id INTO v_action_url
    FROM public.answers WHERE id = NEW.target_id;
  END IF;

  -- Don't notify yourself
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


-- 1d. Notify user when someone follows them
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
    jsonb_build_object(
      'follower_id', NEW.follower_id
    ),
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


-- 1e. Notify entity when someone reviews them
CREATE OR REPLACE FUNCTION public.notify_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Don't notify yourself (e.g. entity reviewing itself)
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
-- 2. ATOMIC RPCs
-- ============================================================

-- 2a. Atomic view counter increment
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


-- 2b. Atomic vote toggle (select + insert/update/delete in one transaction)
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
  -- Validate target_type
  IF p_target_type NOT IN ('question', 'answer') THEN
    RAISE EXCEPTION 'Invalid target_type: %', p_target_type;
  END IF;

  -- Validate vote_type
  IF p_vote_type NOT IN ('up', 'down') THEN
    RAISE EXCEPTION 'Invalid vote_type: %', p_vote_type;
  END IF;

  -- Check for existing vote
  SELECT id, vote_type INTO v_existing_id, v_existing_type
  FROM public.votes
  WHERE user_id = p_user_id
    AND target_id = p_target_id
    AND target_type = p_target_type;

  IF v_existing_id IS NULL THEN
    -- No existing vote: insert new
    INSERT INTO public.votes (user_id, target_id, target_type, vote_type)
    VALUES (p_user_id, p_target_id, p_target_type, p_vote_type);
    RETURN 'inserted';

  ELSIF v_existing_type = p_vote_type THEN
    -- Same vote type: cancel (delete)
    DELETE FROM public.votes WHERE id = v_existing_id;
    RETURN 'deleted';

  ELSE
    -- Different vote type: update
    UPDATE public.votes SET vote_type = p_vote_type WHERE id = v_existing_id;
    RETURN 'updated';
  END IF;
END;
$$;


-- ============================================================
-- 3. ACCEPT ANSWER RLS POLICY
-- ============================================================

DROP POLICY IF EXISTS "Question authors can accept/unaccept answers" ON public.answers;
CREATE POLICY "Question authors can accept/unaccept answers"
  ON public.answers FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND auth.uid() = (SELECT author_id FROM public.questions WHERE id = question_id)
  );


-- ============================================================
-- 4. ACCEPTED ANSWER REPUTATION TRIGGER
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
  -- Only fire when is_accepted transitions from FALSE/NULL to TRUE
  IF NEW.is_accepted = TRUE AND (OLD.is_accepted IS NULL OR OLD.is_accepted = FALSE) THEN
    -- +15 to the answer author
    PERFORM public.award_reputation(NEW.author_id, 15, 'إجابة مقبولة', NEW.id, 'answer');

    -- +2 to the question author (for accepting)
    SELECT author_id INTO v_question_author
    FROM public.questions WHERE id = NEW.question_id;

    IF v_question_author IS NOT NULL THEN
      PERFORM public.award_reputation(v_question_author, 2, 'قبول إجابة', NEW.id, 'answer');
    END IF;

  -- Revoke when un-accepted (TRUE -> FALSE)
  ELSIF (NEW.is_accepted IS NULL OR NEW.is_accepted = FALSE) AND OLD.is_accepted = TRUE THEN
    PERFORM public.award_reputation(NEW.author_id, -15, 'إلغاء قبول الإجابة', NEW.id, 'answer');

    SELECT author_id INTO v_question_author
    FROM public.questions WHERE id = NEW.question_id;

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
-- 5. REVIEW SOFT-DELETE REPUTATION REVOCATION
-- ============================================================

-- Replace existing on_review_change with enhanced version
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
  -- Works with INSERT, UPDATE, and DELETE
  v_entity_id := COALESCE(NEW.entity_id, OLD.entity_id);

  SELECT AVG(rating), COUNT(*) INTO v_avg_rating, v_count
  FROM public.reviews
  WHERE entity_id = v_entity_id AND is_deleted = FALSE;

  UPDATE public.profiles
  SET business_rating = ROUND(v_avg_rating, 1),
      reviews_count   = v_count
  WHERE id = v_entity_id;

  -- Award +15 on new review
  IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
    PERFORM public.award_reputation(v_entity_id, 15, 'استقبال تقييم', NEW.id, 'review');
  END IF;

  -- Revoke -15 when review is soft-deleted
  IF TG_OP = 'UPDATE' AND NEW.is_deleted = TRUE AND (OLD.is_deleted IS NULL OR OLD.is_deleted = FALSE) THEN
    PERFORM public.award_reputation(v_entity_id, -15, 'حذف تقييم', NEW.id, 'review');
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger already exists from schema.sql, re-create to use updated function
DROP TRIGGER IF EXISTS review_rating_trigger ON public.reviews;
CREATE TRIGGER review_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.on_review_change();


-- ============================================================
-- END OF MIGRATION 006
-- ============================================================
