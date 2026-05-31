import { supabase } from "../supabase";
import type { Profile, UpdateProfileInput } from "../database.types";

// ── Fetch a profile by username ───────────────────────────────
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (error) return null;
  return data as Profile;
}

// ── Fetch a profile by ID ────────────────────────────────────
export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data as Profile;
}

// ── Update current user's profile ───────────────────────────
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) { console.error("updateProfile:", error); return null; }
  return data as Profile;
}

// ── Upload avatar ────────────────────────────────────────────
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `avatars/${userId}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (error) { console.error("uploadAvatar:", error); return null; }
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

// ── Upload cover image ─────────────────────────────────────────
export async function uploadCoverImage(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `covers/${userId}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (error) { console.error("uploadCoverImage:", error); return null; }
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

// ── Upload license document ───────────────────────────────────
export async function uploadLicenseDocument(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/license_${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("business-licenses")
    .upload(path, file, { upsert: true });
  if (error) { console.error("uploadLicenseDocument upload:", error); return null; }
  
  // Generate a signed URL valid for 10 years (315,360,000 seconds)
  const { data, error: signError } = await supabase.storage
    .from("business-licenses")
    .createSignedUrl(path, 315360000);
  if (signError || !data) { console.error("uploadLicenseDocument signing:", signError); return null; }
  
  return data.signedUrl;
}


// ── Leaderboard ──────────────────────────────────────────────
export async function getLeaderboard(limit = 20): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("reputation", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as Profile[];
}

// ── Reputation history ───────────────────────────────────────
export async function getReputationLogs(userId: string) {
  const { data, error } = await supabase
    .from("reputation_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return data ?? [];
}

// ── Admin: Verify / Un-verify an entity ──────────────────────
export async function toggleEntityVerification(
  userId: string,
  currentState: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_verified_entity: !currentState })
    .eq("id", userId);
  if (error) { console.error("toggleEntityVerification:", error); return currentState; }
  return !currentState;
}

// ── Search users ─────────────────────────────────────────────
export async function searchUsers(query: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(20);
  if (error) return [];
  return (data ?? []) as Profile[];
}
