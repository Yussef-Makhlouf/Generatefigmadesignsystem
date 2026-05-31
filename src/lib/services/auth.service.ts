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
    .single();

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
    .single();

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
    .single();

  return profile as Profile;
}

// ── Update user account type (admin only) ───────────────────────
export async function updateUserAccountType(
  userId: string,
  accountType: AccountType
): Promise<boolean> {
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