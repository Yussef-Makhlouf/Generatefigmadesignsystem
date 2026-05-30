import { supabase } from "../supabase";
import type { Profile, UpdateProfileInput } from "../database.types";

// ── Fetch a profile by username ───────────────────────────────
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  if (error) return null;
  return data as Profile;
}

// ── Fetch a profile by ID ────────────────────────────────────
export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
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
