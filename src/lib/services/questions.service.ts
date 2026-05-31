import { supabase } from "../supabase";
import type { Question, CreateQuestionInput } from "../database.types";

// ── Fetch paginated questions (Timeline) ─────────────────────
export async function getQuestions(options?: {
  filter?: "recent" | "popular" | "unanswered";
  tag?: string;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Question[]> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("questions")
    .select("*")
    .eq("is_deleted", false)
    .range(offset, offset + limit - 1);

  if (options?.filter === "popular") {
    query = query.order("votes_count", { ascending: false });
  } else if (options?.filter === "unanswered") {
    query = query.eq("answers_count", 0).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (options?.search) {
    query = query.ilike("title", `%${options.search}%`);
  }
  if (options?.category) {
    query = query.ilike("category", `%${options.category}%`);
  }

  const { data, error } = await query;
  if (error) { console.error("getQuestions:", error); return []; }
  return (data ?? []) as unknown as Question[];
}

// ── Fetch single question with full details ──────────────────
export async function getQuestionById(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      author:profiles!author_id(id, name, username, avatar_url, reputation),
      question_tags(tag_id, tags(*)),
      question_attachments(*)
    `)
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error) { console.error("getQuestionById:", error); return null; }

  // Increment view count (fire and forget)
  supabase.from("questions").update({ views_count: ((data as any).views_count ?? 0) + 1 } as any).eq("id", id).then(() => {});

  // Map to UI-compatible Question shape (same transform as the bulk query)
  const q = data as any;
  const tagNames = (q.question_tags ?? []).map((qt: any) => qt.tags?.name).filter(Boolean);
  const images = (q.question_attachments ?? [])
    .filter((att: any) => att.type === "image")
    .map((att: any) => att.url);
  const links = (q.question_attachments ?? [])
    .filter((att: any) => att.type === "link")
    .map((att: any) => ({ title: att.title ?? "", url: att.url ?? "" }));
  const locAtt = (q.question_attachments ?? []).find((att: any) => att.type === "location");
  const locationDetail = locAtt ? {
    name: locAtt.title ?? "",
    address: locAtt.address ?? undefined,
    lat: locAtt.lat ? parseFloat(locAtt.lat) : undefined,
    lng: locAtt.lng ? parseFloat(locAtt.lng) : undefined,
  } : undefined;

  return {
    ...q,
    id: q.id,
    author_id: q.author_id,
    title: q.title,
    description: q.content,
    content: q.content,
    category: q.category,
    location: q.location,
    votes: q.votes_count,
    votes_count: q.votes_count,
    answers: q.answers_count,
    answers_count: q.answers_count,
    views: q.views_count,
    views_count: q.views_count,
    tags: tagNames,
    images,
    links,
    locationDetail,
    author: {
      id: q.author?.id,
      name: q.author?.name ?? "مستخدم",
      username: q.author?.username ?? "",
      avatar: q.author?.avatar_url ?? undefined,
      avatar_url: q.author?.avatar_url ?? undefined,
      reputation: q.author?.reputation ?? 0,
    },
    timestamp: q.created_at,
    is_deleted: q.is_deleted,
    created_at: q.created_at,
    updated_at: q.updated_at,
  } as unknown as Question;
}


// ── Create a new question with tags & attachments ────────────
export async function createQuestion(
  authorId: string,
  input: CreateQuestionInput
): Promise<Question | null> {
  // 1. Insert question
  const { data: question, error: qErr } = await supabase
    .from("questions")
    .insert({
      author_id: authorId,
      title: input.title,
      content: input.content,
      category: input.category ?? null,
      location: input.location ?? null,
    })
    .select()
    .single();

  if (qErr || !question) { console.error("createQuestion:", qErr); return null; }

  const questionId = question.id;

  // 2. Upsert tags and link them
  if (input.tags.length > 0) {
    for (const tagName of input.tags.slice(0, 5)) {
      // Ensure tag exists
      const { data: existingTag } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .maybeSingle();

      let tagId: string | undefined;
      if (existingTag) {
        tagId = existingTag.id;
        await (supabase as any).rpc("increment_tag_usage", { tag_id_param: tagId }).then(() => {});
      } else {
        const { data: newTag } = await supabase
          .from("tags")
          .insert({ name: tagName, usage_count: 1 })
          .select()
          .single();
        tagId = newTag?.id;
      }
      if (tagId) {
        await supabase.from("question_tags").insert({ question_id: questionId, tag_id: tagId } as any);
      }
    }
  }

  // 3. Insert image attachments
  if (input.images?.length) {
    const imageRows = input.images.map((url, i) => ({
      question_id: questionId,
      type: "image" as const,
      url,
      sort_order: i,
    }));
    await supabase.from("question_attachments").insert(imageRows);
  }

  // 4. Insert link attachments
  if (input.links?.length) {
    const linkRows = input.links.map((l, i) => ({
      question_id: questionId,
      type: "link" as const,
      url: l.url,
      title: l.title,
      sort_order: i,
    }));
    await supabase.from("question_attachments").insert(linkRows);
  }

  // 5. Insert location attachment
  if (input.locationDetail) {
    await supabase.from("question_attachments").insert({
      question_id: questionId,
      type: "location",
      title: input.locationDetail.name,
      address: input.locationDetail.address ?? null,
      lat: input.locationDetail.lat ?? null,
      lng: input.locationDetail.lng ?? null,
    });
  }

  return question as unknown as Question;
}

// ── Soft delete a question (admin or author) ─────────────────
export async function deleteQuestion(questionId: string): Promise<boolean> {
  const { error } = await supabase
    .from("questions")
    .update({ is_deleted: true } as any)
    .eq("id", questionId);
  if (error) { console.error("deleteQuestion:", error); return false; }
  return true;
}

// ── Upload image to Supabase Storage ────────────────────────
export async function uploadQuestionImage(
  questionId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `questions/${questionId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("question-images")
    .upload(path, file);
  if (error) { console.error("uploadQuestionImage:", error); return null; }
  const { data } = supabase.storage.from("question-images").getPublicUrl(path);
  return data.publicUrl;
}

// ── Get bookmarked questions for a user ──────────────────────
export async function getBookmarkedQuestions(userId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`question:questions(*, author:profiles!author_id(*), question_tags(tag_id, tags(id, name)), question_attachments(*))`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return ((data ?? []).map((b: any) => b.question).filter(Boolean)) as unknown as Question[];
}

// ── Toggle bookmark ──────────────────────────────────────────
export async function toggleBookmark(
  userId: string,
  questionId: string
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("question_id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existing) {
    await supabase.from("bookmarks").delete().eq("user_id", userId).eq("question_id", questionId);
    return false;
  } else {
    await supabase.from("bookmarks").insert({ user_id: userId, question_id: questionId });
    return true;
  }
}

// ── Get questions by user ────────────────────────────────────
export async function getQuestionsByUser(userId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select(`*, author:profiles!author_id(*), question_tags(tag_id, tags(id, name)), question_attachments(*)`)
    .eq("author_id", userId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as unknown as Question[];
}
