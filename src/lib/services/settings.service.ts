import { supabase } from "../supabase";

export type UserSettings = {
  notifications: {
    email: boolean;
    newAnswers: boolean;
    newComments: boolean;
    mentions: boolean;
    weeklyDigest: boolean;
    marketingEmails: boolean;
  };
  privacy: {
    profileVisibility: "public" | "members" | "private";
    showEmail: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    language: "ar" | "en";
  };
};

const DEFAULTS: UserSettings = {
  notifications: {
    email: true,
    newAnswers: true,
    newComments: true,
    mentions: true,
    weeklyDigest: false,
    marketingEmails: false,
  },
  privacy: {
    profileVisibility: "public",
    showEmail: false,
    showLocation: true,
    allowMessages: true,
  },
  appearance: {
    theme: "dark",
    language: "ar",
  },
};

export function getDefaultSettings(): UserSettings {
  return JSON.parse(JSON.stringify(DEFAULTS));
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("profiles")
    .select("settings")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.settings) return getDefaultSettings();

  const stored = data.settings as Record<string, unknown>;
  return {
    notifications: { ...DEFAULTS.notifications, ...(stored.notifications as Partial<UserSettings["notifications"]> || {}) },
    privacy: { ...DEFAULTS.privacy, ...(stored.privacy as Partial<UserSettings["privacy"]> || {}) },
    appearance: { ...DEFAULTS.appearance, ...(stored.appearance as Partial<UserSettings["appearance"]> || {}) },
  };
}

export async function saveUserSettings(
  userId: string,
  patch: Partial<UserSettings>
): Promise<boolean> {
  const current = await getUserSettings(userId);
  const merged: UserSettings = {
    notifications: { ...current.notifications, ...(patch.notifications || {}) },
    privacy: { ...current.privacy, ...(patch.privacy || {}) },
    appearance: { ...current.appearance, ...(patch.appearance || {}) },
  };

  const { error } = await supabase
    .from("profiles")
    .update({ settings: merged as Record<string, unknown>, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("saveUserSettings:", error);
    return false;
  }
  return true;
}
