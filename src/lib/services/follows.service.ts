import { supabase } from "../supabase";

// ── Toggle follow using atomic RPC (schema.sql toggle_follow) ───
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; isFollowing: boolean; error?: string }> {
  // Self-follow guard — done client-side + DB constraint
  if (followerId === followingId) {
    return { success: false, isFollowing: false, error: "لا يمكنك متابعة نفسك" };
  }

  const { data, error } = await supabase.rpc("toggle_follow", {
    p_follower_id: followerId,
    p_following_id: followingId,
  });

  if (error) {
    return { success: false, isFollowing: false, error: error.message };
  }
  return { success: true, isFollowing: data ?? false };
}

// ── Check if already following ─────────────────────────────────
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (followerId === followingId) return false;
  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  return !!data;
}

// ── Get follower count for a user ─────────────────────────────
export async function getFollowerCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  return count ?? 0;
}

// ── Get following count for a user ────────────────────────────
export async function getFollowingCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  return count ?? 0;
}
