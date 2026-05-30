import { supabase } from "../supabase";
import type { Question, Tag, Profile } from "../database.types";

// ── Category with count shape ────────────────────────────────
export interface CategoryStat {
  name: string;
  count: number;
}

// Map category names → Tailwind colour class (extends automatically for new values)
const CATEGORY_COLORS: Record<string, string> = {
  "تقنية":         "bg-blue-500",
  "تعليم":         "bg-green-500",
  "برمجة":         "bg-indigo-500",
  "ذكاء اصطناعي":  "bg-purple-500",
  "تصميم":         "bg-pink-500",
  "صحة":           "bg-red-500",
  "أعمال":         "bg-amber-500",
  "علوم":          "bg-teal-500",
  "tech":          "bg-blue-500",
  "education":     "bg-green-500",
  "health":        "bg-red-500",
  "business":      "bg-amber-500",
  "science":       "bg-teal-500",
};

export function getCategoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? "bg-gray-500";
}

export async function getCategoriesWithCounts(limit = 8): Promise<CategoryStat[]> {
  // Fetch all non-deleted questions' category field (head=false so we get rows)
  const { data, error } = await supabase
    .from("questions")
    .select("category")
    .eq("is_deleted", false)
    .not("category", "is", null);

  if (error || !data) {
    console.error("getCategoriesWithCounts:", error);
    return [];
  }

  // Aggregate in-memory (Supabase JS client doesn't support GROUP BY directly)
  const countMap = new Map<string, number>();
  for (const row of data as { category: string | null }[]) {
    const cat = row.category;
    if (!cat) continue;
    countMap.set(cat, (countMap.get(cat) ?? 0) + 1);
  }

  return Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

// ── Platform Statistics ──────────────────────────────────────
export interface PlatformStats {
  questions_count: number;
  users_count: number;
  answers_count: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [qRes, uRes, aRes] = await Promise.all([
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("is_deleted", false),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("answers").select("id", { count: "exact", head: true }).eq("is_deleted", false),
  ]);

  return {
    questions_count: qRes.count ?? 0,
    users_count: uRes.count ?? 0,
    answers_count: aRes.count ?? 0,
  };
}

// ── Trending Tags ────────────────────────────────────────────
export async function getTrendingTags(limit = 10): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("usage_count", { ascending: false })
    .limit(limit);
  if (error) { console.error("getTrendingTags:", error); return []; }
  return (data ?? []) as Tag[];
}

// ── Hot Today (most voted recently) ──────────────────────────
export async function getHotQuestions(limit = 5): Promise<Question[]> {
  const since = new Date();
  since.setDate(since.getDate() - 7); // last 7 days

  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      author:profiles(id, name, username, avatar_url, reputation)
    `)
    .eq("is_deleted", false)
    .gte("created_at", since.toISOString())
    .order("votes_count", { ascending: false })
    .limit(limit);

  if (error) { console.error("getHotQuestions:", error); return []; }
  return (data ?? []) as unknown as Question[];
}

// ── Top Contributors (by reputation) ─────────────────────────
export async function getTopContributors(limit = 5): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url, reputation")
    .order("reputation", { ascending: false })
    .limit(limit);
  if (error) { console.error("getTopContributors:", error); return []; }
  return (data ?? []) as Profile[];
}

// ── Leaderboard with period ──────────────────────────────────
export type LeaderboardPeriod = "weekly" | "monthly" | "alltime";

export interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  reputation: number;
  answers_count?: number;
}

export async function getLeaderboardByPeriod(
  period: LeaderboardPeriod,
  limit = 20
): Promise<LeaderboardEntry[]> {
  if (period === "alltime") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, username, avatar_url, reputation")
      .order("reputation", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as LeaderboardEntry[];
  }

  // For weekly/monthly, filter reputation_logs by date range
  const since = new Date();
  if (period === "weekly") since.setDate(since.getDate() - 7);
  if (period === "monthly") since.setMonth(since.getMonth() - 1); 

  // Aggregate points from reputation_logs in date range, join profiles
  const { data, error } = await supabase
    .from("reputation_logs")
    .select("user_id, points, profiles!inner(id, name, username, avatar_url, reputation)")
    .gte("created_at", since.toISOString());

  if (error || !data) {
    // Fallback: just return all-time leaderboard
    const { data: fallback } = await supabase
      .from("profiles")
      .select("id, name, username, avatar_url, reputation")
      .order("reputation", { ascending: false })
      .limit(limit);
    return (fallback ?? []) as LeaderboardEntry[];
  }

  // Aggregate by user
  const userMap = new Map<string, { profile: any; points: number }>();
  for (const row of data as any[]) {
    const profile = row.profiles;
    if (!profile) continue;
    const uid = profile.id;
    if (!userMap.has(uid)) {
      userMap.set(uid, { profile, points: 0 });
    }
    userMap.get(uid)!.points += row.points ?? 0;
  }

  return Array.from(userMap.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map(({ profile, points }) => ({
      id: profile.id,
      name: profile.name,
      username: profile.username,
      avatar_url: profile.avatar_url,
      reputation: points, // period-specific points
    }));
}

// ── Backend full-text search ─────────────────────────────────
export interface SearchOptions {
  query: string;
  category?: string;
  location?: string;
  sortBy?: "newest" | "votes" | "unanswered";
  unansweredOnly?: boolean;
  limit?: number;
  offset?: number;
}

export async function searchQuestions(opts: SearchOptions): Promise<Question[]> {
  const limit = opts.limit ?? 20;
  const offset = opts.offset ?? 0;

  let q = supabase
    .from("questions")
    .select(`
      *,
      author:profiles(id, name, username, avatar_url, reputation),
      question_tags(tag_id, tags(id, name)),
      question_attachments(*)
    `)
    .eq("is_deleted", false);

  // Full-text search on title + content
  if (opts.query) {
    q = q.or(`title.ilike.%${opts.query}%,content.ilike.%${opts.query}%`);
  }

  if (opts.category && opts.category !== "all") {
    q = q.eq("category", opts.category);
  }

  if (opts.location && opts.location !== "all") {
    q = q.eq("location", opts.location);
  }

  if (opts.unansweredOnly) {
    q = q.eq("answers_count", 0);
  }

  if (opts.sortBy === "votes") {
    q = q.order("votes_count", { ascending: false });
  } else if (opts.sortBy === "unanswered") {
    q = q.eq("answers_count", 0).order("created_at", { ascending: false });
  } else {
    q = q.order("created_at", { ascending: false });
  }

  q = q.range(offset, offset + limit - 1);

  const { data, error } = await q;
  if (error) { console.error("searchQuestions:", error); return []; }

  return ((data ?? []).map((item: any) => {
    const tagNames = (item.question_tags ?? []).map((qt: any) => qt.tags?.name).filter(Boolean);
    const images = (item.question_attachments ?? []).filter((a: any) => a.type === "image").map((a: any) => a.url);
    const links = (item.question_attachments ?? []).filter((a: any) => a.type === "link").map((a: any) => ({ title: a.title ?? "", url: a.url ?? "" }));
    return {
      ...item,
      tags: tagNames,
      images,
      links,
      votes: item.votes_count,
      votes_count: item.votes_count,
      answers: item.answers_count,
      answers_count: item.answers_count,
      views: item.views_count,
      description: item.content,
      timestamp: item.created_at,
    };
  })) as unknown as Question[];
}
