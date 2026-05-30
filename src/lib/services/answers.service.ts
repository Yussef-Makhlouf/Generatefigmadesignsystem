import { supabase } from "../supabase";
import type { Answer, CreateAnswerInput, Profile } from "../database.types";

// ── Fetch answers for a question ──────────────────────────────
export async function getAnswers(questionId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from("answers")
    .select(`
      *,
      author:profiles(*),
      answer_attachments(*),
      comments(*, author:profiles(*))
    `)
    .eq("question_id", questionId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAnswers:", error);
    return [];
  }
  return (data ?? []) as unknown as Answer[];
}

// ── Create answer with attachments ───────────────────────────────
export async function createAnswer(
  authorId: string,
  input: CreateAnswerInput
): Promise<Answer | null> {
  const { data: answer, error: aErr } = await supabase
    .from("answers")
    .insert({
      question_id: input.question_id,
      author_id: authorId,
      content: input.content,
      verified_type: input.verified_type ?? null,
      verified_label: input.verified_type ? (input.verified_type === "photo" ? "تم التحقق بالصورة" : "من نفس المدينة") : null,
    } as any)
    .select()
    .single();

  if (aErr || !answer) {
    console.error("createAnswer:", aErr);
    return null;
  }

  const answerId = (answer as any).id;

  // Insert attachments
  if (input.images?.length) {
    const imageRows = input.images.map((url, i) => ({
      answer_id: answerId,
      type: "image" as const,
      url,
      sort_order: i,
    }));
    await supabase.from("answer_attachments").insert(imageRows as any);
  }

  if (input.links?.length) {
    const linkRows = input.links.map((l, i) => ({
      answer_id: answerId,
      type: "link" as const,
      url: l.url,
      title: l.title,
      sort_order: i,
    }));
    await supabase.from("answer_attachments").insert(linkRows as any);
  }

  if (input.locationDetail) {
    await supabase.from("answer_attachments").insert({
      answer_id: answerId,
      type: "location" as const,
      title: input.locationDetail.name,
      address: input.locationDetail.address ?? null,
      lat: input.locationDetail.lat ?? null,
      lng: input.locationDetail.lng ?? null,
    } as any);
  }

  return answer as unknown as Answer;
}

// ── Accept answer (mark as accepted) ───────────────────────────
export async function acceptAnswer(answerId: string): Promise<boolean> {
  const { error } = await supabase
    .from("answers")
    .update({ is_accepted: true })
    .eq("id", answerId);

  if (error) {
    console.error("acceptAnswer:", error);
    return false;
  }
  return true;
}

// ── Add comment to answer ─────────────────────────────────────
export async function addComment(
  answerId: string,
  authorId: string,
  content: string
): Promise<boolean> {
  const { error } = await supabase
    .from("comments")
    .insert({
      answer_id: answerId,
      author_id: authorId,
      content,
    });

  if (error) {
    console.error("addComment:", error);
    return false;
  }
  return true;
}

// ── Upload answer image ────────────────────────────────────────
export async function uploadAnswerImage(
  answerId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `answers/${answerId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("answer-images")
    .upload(path, file);

  if (error) {
    console.error("uploadAnswerImage:", error);
    return null;
  }
  const { data } = supabase.storage.from("answer-images").getPublicUrl(path);
  return data.publicUrl;
}