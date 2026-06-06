import { supabase } from "../supabase";
import type { Profile, AccountType } from "../database.types";

// ── Sign up new user ───────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  username: string,
  name: string,
  accountType: AccountType = "individual"
): Promise<{ user: Profile | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        name,
        account_type: accountType,
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  const user = data.user;
  if (!user) {
    return { user: null, error: "فشل إنشاء الحساب" };
  }

  // Profile is auto-created by trigger
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user: profile as Profile, error: null };
}

// ── Sign in ───────────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string
): Promise<{ user: Profile | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let message = error.message;
    if (
      message.includes("email_not_confirmed") ||
      message.includes("Email not confirmed")
    ) {
      message =
        "يرجى تأكيد بريدك الإلكتروني أولاً ثم حاول تسجيل الدخول مجدداً.";
    } else if (
      message.includes("Invalid login credentials") ||
      message.includes("invalid_credentials")
    ) {
      message = "بيانات تسجيل الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.";
    }
    return { user: null, error: message };
  }

  const user = data.user;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .maybeSingle();

  return { user: profile as Profile, error: null };
}

// ── Sign out ───────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ── Get current user profile ───────────────────────────────────
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile as Profile;
}

// ── Update user account type (local dev only — production uses DB trigger + RLS) ──
export async function updateUserAccountType(
  userId: string,
  accountType: AccountType
): Promise<boolean> {
  if (!import.meta.env.DEV) {
    console.error("updateUserAccountType is disabled outside development builds");
    return false;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ account_type: accountType })
    .eq("id", userId);

  if (error) {
    console.error("updateUserAccountType:", error);
    return false;
  }
  return true;
}

// ── Request Password Reset Link ─────────────────────────────
export async function sendPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    console.error("sendPasswordReset error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// ── Complete Password Reset ─────────────────────────────────
export async function completePasswordReset(password: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error("completePasswordReset error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}