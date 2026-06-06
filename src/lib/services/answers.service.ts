import { supabase } from "../supabase";
import type { Answer, CreateAnswerInput } from "../database.types";
import { answerSchema } from "../utils/validation";

// ── Fetch answers for a question ──────────────────────────────
export async function getAnswers(questionId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from("answers")
    .select(`
      *,
      author:profiles!author_id(id, name, username, avatar_url, reputation),
      answer_attachments(*),
      comments(
        *,
        author:profiles!author_id(id, name, username, avatar_url, reputation)
      )
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
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    console.error("createAnswer validation:", fieldErrors);
    throw new Error(`Validation failed: ${JSON.stringify(fieldErrors)}`);
  }
  const valid = parsed.data;

  const { data: answer, error: aErr } = await supabase
    .from("answers")
    .insert({
      question_id: valid.question_id,
      author_id: authorId,
      content: valid.content,
      verified_type: valid.verified_type ?? null,
      verified_label: valid.verified_type ? (valid.verified_type === "photo" ? "تم التحقق بالصورة" : "من نفس المدينة") : null,
    } as any)
    .select()
    .single();

  if (aErr || !answer) {
    console.error("createAnswer:", aErr);
    return null;
  }

  const answerId = (answer as any).id;

  // Insert image attachments
  if (valid.images?.length) {
    const imageRows = valid.images.map((url, i) => ({
      answer_id: answerId,
      type: "image" as const,
      url,
      sort_order: i,
    }));
    await supabase.from("answer_attachments").insert(imageRows as any);
  }

  // Insert link attachments
  if (valid.links?.length) {
    const linkRows = valid.links.map((l, i) => ({
      answer_id: answerId,
      type: "link" as const,
      url: l.url,
      title: l.title,
      sort_order: i,
    }));
    await supabase.from("answer_attachments").insert(linkRows as any);
  }

  // Insert location attachment
  if (valid.locationDetail) {
    await supabase.from("answer_attachments").insert({
      answer_id: answerId,
      type: "location" as const,
      title: valid.locationDetail.name,
      address: valid.locationDetail.address ?? null,
      lat: valid.locationDetail.lat ?? null,
      lng: valid.locationDetail.lng ?? null,
    } as any);
  }

  return answer as unknown as Answer;
}

// ── Fetch answers by author (profile page) ─────────────────────
export async function getAnswersByAuthor(authorId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from("answers")
    .select("id, question_id, author_id, content, votes_count, is_accepted, created_at")
    .eq("author_id", authorId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAnswersByAuthor:", error);
    return [];
  }
  return (data ?? []) as unknown as Answer[];
}

// ── Fetch answer content snippets for reputation log refs ──────
export async function getAnswerSnippets(
  ids: string[]
): Promise<Array<{ id: string; content: string; question_id: string }>> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("answers")
    .select("id, content, question_id")
    .in("id", ids);

  if (error) {
    console.error("getAnswerSnippets:", error);
    return [];
  }
  return data ?? [];
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

// ── Unaccept answer ────────────────────────────────────────────
export async function unacceptAnswer(answerId: string): Promise<boolean> {
  const { error } = await supabase
    .from("answers")
    .update({ is_accepted: false })
    .eq("id", answerId);

  if (error) {
    console.error("unacceptAnswer:", error);
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

// ── Upload answer image to Supabase Storage ───────────────────
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