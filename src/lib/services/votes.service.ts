import { supabase } from "../supabase";
import type { VoteType, TargetType } from "../database.types";

// ── Cast vote on question or answer ───────────────────────────
export async function castVote(
  userId: string,
  targetId: string,
  targetType: TargetType,
  voteType: VoteType
): Promise<boolean> {
  const { error } = await supabase
    .from("votes")
    .upsert(
      {
        user_id: userId,
        target_id: targetId,
        target_type: targetType,
        vote_type: voteType,
      } as any,
      { onConflict: "user_id,target_id,target_type" }
    );

  if (error) {
    console.error("castVote:", error);
    return false;
  }
  return true;
}

// ── Remove vote ───────────────────────────────────────────────
export async function removeVote(
  userId: string,
  targetId: string,
  targetType: TargetType
): Promise<boolean> {
  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("user_id", userId)
    .eq("target_id", targetId)
    .eq("target_type", targetType);

  if (error) {
    console.error("removeVote:", error);
    return false;
  }
  return true;
}

// ── Get user's vote on target ─────────────────────────────────
export async function getUserVote(
  userId: string,
  targetId: string,
  targetType: TargetType
): Promise<VoteType | null> {
  const { data, error } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("user_id", userId)
    .eq("target_id", targetId)
    .eq("target_type", targetType)
    .single();

  if (error) return null;
  return data?.vote_type ?? null;
}