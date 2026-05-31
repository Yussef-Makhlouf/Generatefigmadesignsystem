import { supabase } from "../supabase";

// ── Toggle follow using direct table ops (no RPC needed) ───────
export async function toggleFollow(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; isFollowing: boolean; error?: string }> {
  // Self-follow guard — done client-side + DB constraint
  if (followerId === followingId) {
    return { success: false, isFollowing: false, error: "لا يمكنك متابعة نفسك" };
  }

  try {
    // Check if already following
    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (existing) {
      // Unfollow
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);

      if (error) return { success: false, isFollowing: true, error: error.message };
      return { success: true, isFollowing: false };
    } else {
      // Follow
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: followerId, following_id: followingId });

      if (error) return { success: false, isFollowing: false, error: error.message };
      return { success: true, isFollowing: true };
    }
  } catch (e: any) {
    return { success: false, isFollowing: false, error: e?.message ?? "فشل العملية" };
  }
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
