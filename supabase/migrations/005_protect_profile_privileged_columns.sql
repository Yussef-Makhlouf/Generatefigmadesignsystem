-- ============================================================
-- Prevent non-admin users from escalating privileges or
-- modifying reputation / verification on their own profile.
-- Admins and service_role may change these columns freely.
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN := FALSE;
BEGIN
  -- Service role (migrations, edge functions) bypasses checks
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

  -- Non-admin self-update: revert privileged column changes with a warning
  IF auth.uid() = OLD.id THEN
    RAISE WARNING 'protect_profile_privileged_columns: reverted privileged columns for self-update on profile %', OLD.id;
    NEW.account_type := OLD.account_type;
    NEW.reputation := OLD.reputation;
    NEW.is_verified_entity := OLD.is_verified_entity;
    RETURN NEW;
  END IF;

  -- Non-admin updating another user's row should be blocked by RLS
  RAISE WARNING 'protect_profile_privileged_columns: blocked cross-user update attempt on profile % by %', OLD.id, auth.uid();
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER protect_profile_privileged_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_columns();
