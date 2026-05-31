import { supabase } from "../supabase";
import type { VoteType, TargetType } from "../database.types";

// ── Cast vote on question or answer ───────────────────────────
export async function castVote(
  userId: string,
  targetId: string,
  targetType: TargetType,
  voteType: VoteType
): Promise<boolean> {
  // Check if vote already exists for this target by this user
  const { data: existingVote, error: selectError } = await supabase
    .from("votes")
    .select("id, vote_type")
    .eq("user_id", userId)
    .eq("target_id", targetId)
    .eq("target_type", targetType)
    .maybeSingle();

  if (selectError) {
    console.error("castVote check existing vote error:", selectError);
    return false;
  }

  if (existingVote) {
    // If the vote type is already correct, do nothing
    if (existingVote.vote_type === voteType) {
      return true;
    }
    // Update the existing vote type
    const { error: updateError } = await supabase
      .from("votes")
      .update({ vote_type: voteType } as any)
      .eq("id", existingVote.id);

    if (updateError) {
      console.error("castVote update vote error:", updateError);
      return false;
    }
  } else {
    // Insert a brand new vote
    const { error: insertError } = await supabase
      .from("votes")
      .insert({
        user_id: userId,
        target_id: targetId,
        target_type: targetType,
        vote_type: voteType,
      } as any);

    if (insertError) {
      console.error("castVote insert vote error:", insertError);
      return false;
    }
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
    .maybeSingle();

  if (error) return null;
  return data?.vote_type ?? null;
}