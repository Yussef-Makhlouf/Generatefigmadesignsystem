import { supabase } from "../supabase";
import type { Review, CreateReviewInput, Profile } from "../database.types";

// ── Fetch reviews for an entity ───────────────────────────────
export async function getReviews(entityId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles(*),
      review_attachments(*)
    `)
    .eq("entity_id", entityId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getReviews:", error);
    return [];
  }
  return (data ?? []) as unknown as Review[];
}

// ── Fetch all reviews (for admin) ──────────────────────────────
export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles(*),
      entity:profiles!entity_id(*)
    `)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllReviews:", error);
    return [];
  }
  return (data ?? []) as unknown as Review[];
}

// ── Create review ───────────────────────────────────────────────
export async function createReview(
  reviewerId: string,
  input: CreateReviewInput
): Promise<Review | null> {
  const { data: review, error: rErr } = await supabase
    .from("reviews")
    .insert({
      reviewer_id: reviewerId,
      entity_id: input.entity_id,
      rating: input.rating,
      comment: input.comment,
      visit_date: input.visit_date ?? null,
    })
    .select()
    .single();

  if (rErr || !review) {
    console.error("createReview:", rErr);
    return null;
  }

  const reviewId = review.id;

  // Insert attachments
  if (input.images?.length) {
    const imageRows = input.images.map((url) => ({
      review_id: reviewId,
      type: "image" as const,
      url,
    }));
    await supabase.from("review_attachments").insert(imageRows as any);
  }

  if (input.links?.length) {
    const linkRows = input.links.map((l) => ({
      review_id: reviewId,
      type: "link" as const,
      url: l.url,
      title: l.title,
    }));
    await supabase.from("review_attachments").insert(linkRows as any);
  }

  return review as unknown as Review;
}

// ── Delete review (admin/moderation) ───────────────────────────
export async function deleteReview(reviewId: string): Promise<boolean> {
  const { error } = await supabase
    .from("reviews")
    .update({ is_deleted: true })
    .eq("id", reviewId);

  if (error) {
    console.error("deleteReview:", error);
    return false;
  }
  return true;
}

// ── Upload review image ───────────────────────────────────────
export async function uploadReviewImage(
  reviewId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `reviews/${reviewId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("review-images")
    .upload(path, file);

  if (error) {
    console.error("uploadReviewImage:", error);
    return null;
  }
  const { data } = supabase.storage.from("review-images").getPublicUrl(path);
  return data.publicUrl;
}