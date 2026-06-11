import { supabase } from "../supabase";
import type { Question } from "../database.types";
import { mapQuestionRow } from "../mappers/feed-mappers";

// ── Feed Page Shape ──────────────────────────────────────────────
export interface FeedPage {
  questions: Question[];
  nextCursor: { created_at: string; id: string } | null;
}

const FEED_PAGE_SIZE = 20;

const QUESTION_SELECT = `
  *,
  author:profiles!author_id(*),
  question_tags(tag_id, tags(*)),
  question_attachments(*)
`;

// ── Helper: map RPC row to Question shape ─────────────────────────
function mapRpcRow(row: Record<string, unknown>): Question {
  // RPC rows have `author` as a jsonb object — reshape for the mapper
  const authorObj = row.author as Record<string, unknown> | null;
  const syntheticRow: Record<string, unknown> = {
    ...row,
    question_tags: [],
    question_attachments: [],
    author: authorObj ?? {
      id: row.author_id,
      name: "مستخدم",
      username: "",
      avatar_url: null,
      reputation: 0,
    },
  };
  return mapQuestionRow(syntheticRow);
}

// ── Recent Feed (cursor-paginated, no ranking) ────────────────────
export async function getRecentFeed(
  limit: number = FEED_PAGE_SIZE,
  cursor?: { created_at: string; id: string } | null,
): Promise<FeedPage> {
  let query = supabase
    .from("questions")
    .select(QUESTION_SELECT)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1); // fetch one extra to detect next page

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("getRecentFeed:", error);
    return { questions: [], nextCursor: null };
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const questions = page.map((q) => mapQuestionRow(q));

  const nextCursor = hasMore
    ? {
        created_at: page[page.length - 1].created_at as string,
        id: page[page.length - 1].id as string,
      }
    : null;

  return { questions, nextCursor };
}

// ── For You Feed (personalized ranking via RPC) ──────────────────
export async function getForYouFeed(
  userId: string,
  limit: number = FEED_PAGE_SIZE,
  cursor?: { created_at: string; id: string } | null,
): Promise<FeedPage> {
  const { data, error } = await supabase.rpc("get_for_you_feed", {
    p_user_id: userId,
    p_limit: limit + 1,
    p_cursor: cursor?.created_at ?? null,
    p_cursor_id: cursor?.id ?? null,
  } as any);

  if (error) {
    console.error("getForYouFeed:", error);
    return { questions: [], nextCursor: null };
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const questions = page.map(mapRpcRow);

  const nextCursor = hasMore
    ? {
        created_at: page[page.length - 1].created_at as string,
        id: page[page.length - 1].id as string,
      }
    : null;

  return { questions, nextCursor };
}

// ── Trending Feed (momentum-based via RPC) ───────────────────────
export async function getTrendingFeed(
  limit: number = FEED_PAGE_SIZE,
  cursor?: { created_at: string; id: string } | null,
): Promise<FeedPage> {
  const { data, error } = await supabase.rpc("get_trending_feed", {
    p_limit: limit + 1,
    p_cursor: cursor?.created_at ?? null,
    p_cursor_id: cursor?.id ?? null,
  } as any);

  if (error) {
    console.error("getTrendingFeed:", error);
    return { questions: [], nextCursor: null };
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const questions = page.map(mapRpcRow);

  const nextCursor = hasMore
    ? {
        created_at: page[page.length - 1].created_at as string,
        id: page[page.length - 1].id as string,
      }
    : null;

  return { questions, nextCursor };
}

// ── Following Feed (followed users via RPC) ──────────────────────
export async function getFollowingFeed(
  userId: string,
  limit: number = FEED_PAGE_SIZE,
  cursor?: { created_at: string; id: string } | null,
): Promise<FeedPage> {
  const { data, error } = await supabase.rpc("get_following_feed", {
    p_user_id: userId,
    p_limit: limit + 1,
    p_cursor: cursor?.created_at ?? null,
    p_cursor_id: cursor?.id ?? null,
  } as any);

  if (error) {
    console.error("getFollowingFeed:", error);
    return { questions: [], nextCursor: null };
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const questions = page.map(mapRpcRow);

  const nextCursor = hasMore
    ? {
        created_at: page[page.length - 1].created_at as string,
        id: page[page.length - 1].id as string,
      }
    : null;

  return { questions, nextCursor };
}
