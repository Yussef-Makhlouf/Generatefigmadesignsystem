import { supabase } from "../supabase";
import type { Question, Tag, Profile } from "../database.types";

// ── Category with count shape ────────────────────────────────
export interface CategoryStat {
  name: string;
  count: number;
}

// Map English wizard IDs → Arabic display labels shown in the UI
export const CATEGORY_LABELS: Record<string, string> = {
  "tech":       "تقنية وبرمجيات",
  "education":  "تعليم وأكاديميا",
  "health":     "صحة وطب وعيادات",
  "business":   "ريادة وأعمال تجارية",
  "science":    "علوم وبحوث",
  "food":       "مطاعم ومأكولات",
  "activity":   "نشاطات وترفيه",
  "travel":     "سياحة وسفر",
  "legal":      "قانون وأنظمة",
  "finance":    "مالية واستثمار",
  "sports":     "رياضة ولياقة",
  "arts":       "فنون وإبداع",
};

// Map category names → Tailwind colour class (extends automatically for new values)
const CATEGORY_COLORS: Record<string, string> = {
  // Arabic labels
  "تقنية":          "bg-blue-500",
  "تعليم":          "bg-green-500",
  "برمجة":          "bg-indigo-500",
  "ذكاء اصطناعي":   "bg-purple-500",
  "تصميم":          "bg-pink-500",
  "صحة":            "bg-red-500",
  "أعمال":          "bg-amber-500",
  "علوم":           "bg-teal-500",
  // English IDs used by the wizard
  "tech":           "bg-blue-500",
  "education":      "bg-green-500",
  "health":         "bg-red-500",
  "business":       "bg-amber-500",
  "science":        "bg-teal-500",
  "food":           "bg-orange-500",
  "activity":       "bg-pink-500",
  "travel":         "bg-sky-500",
  "legal":          "bg-gray-500",
  "finance":        "bg-lime-500",
  "sports":         "bg-cyan-500",
  "arts":           "bg-fuchsia-500",
};

export function getCategoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? "bg-gray-500";
}

export async function getCategoriesWithCounts(limit = 8): Promise<CategoryStat[]> {
  // Fetch all non-deleted questions' category field
  const { data, error } = await supabase
    .from("questions")
    .select("category")
    .eq("is_deleted", false)
    .not("category", "is", null);

  if (error || !data) {
    console.error("getCategoriesWithCounts:", error);
    return [];
  }

  // Aggregate in-memory — split comma-joined multi-category values
  // Normalise raw IDs → Arabic display labels so the UI shows readable names
  const countMap = new Map<string, number>();
  for (const row of data as { category: string | null }[]) {
    const cat = row.category;
    if (!cat) continue;
    // Support comma-joined categories stored by the wizard (e.g. "finance,travel")
    const parts = cat.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      // Normalise: if stored as English ID, resolve to Arabic label
      const displayName = CATEGORY_LABELS[part] ?? part;
      countMap.set(displayName, (countMap.get(displayName) ?? 0) + 1);
    }
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
        author:profiles!author_id(id, name, username, avatar_url, reputation)
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

// ── Distinct Locations ───────────────────────────────────────
/**
 * Returns all unique, non-null location values from the questions table,
 * sorted alphabetically.  Used to populate the location filter dropdown.
 */
export async function getDistinctLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("location")
    .eq("is_deleted", false)
    .not("location", "is", null)
    .neq("location", "");

  if (error) {
    console.error("getDistinctLocations error:", error.message);
    return [];
  }

  // Deduplicate and sort alphabetically
  const seen = new Set<string>();
  for (const row of (data ?? []) as { location: string | null }[]) {
    if (row.location) seen.add(row.location.trim());
  }

  return Array.from(seen).sort((a, b) => a.localeCompare(b, "ar"));
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
      author:profiles!author_id(id, name, username, avatar_url, reputation),
      question_tags(tag_id, tags(id, name)),
      question_attachments(*)
    `)
    .eq("is_deleted", false);

  // Full-text search on title + content + category (label)
  if (opts.query && opts.query.trim()) {
    const safe = opts.query.trim().replace(/[%_\\]/g, "\\$&");
    q = q.or(`title.ilike.%${safe}%,content.ilike.%${safe}%,category.ilike.%${safe}%`);
  }

  if (opts.category && opts.category !== "all") {
    const LABEL_TO_ID: Record<string, string> = Object.fromEntries(
      Object.entries(CATEGORY_LABELS).map(([id, label]) => [label, id])
    );
    const categoryId = LABEL_TO_ID[opts.category] ?? opts.category;
    q = q.ilike("category", `%${categoryId}%`);
  }

  if (opts.location && opts.location !== "all") {
    q = q.ilike("location", `%${opts.location}%`);
  }

  // Handle unanswered filter — deduplicate when sortBy also implies unanswered
  const needsUnansweredFilter = opts.unansweredOnly || opts.sortBy === "unanswered";
  if (needsUnansweredFilter) {
    q = q.eq("answers_count", 0);
  }

  // Ordering
  if (opts.sortBy === "votes") {
    q = q.order("votes_count", { ascending: false });
  } else {
    q = q.order("created_at", { ascending: false });
  }

  q = q.range(offset, offset + limit - 1);

  const { data, error } = await q;
  if (error) {
    console.error("searchQuestions error:", error.message, error.details);
    return [];
  }

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

// ── Autocomplete Suggestions ──────────────────────────────────
export interface AutocompleteSuggestion {
  type: "question" | "tag" | "user";
  id: string;
  title: string;
  subtitle?: string;
  avatar_url?: string;
  metadata?: string;
}

/**
 * Executes high-performance parallel searches across questions, tags, and profiles
 * tables and aggregates them into a unified list of live suggestions.
 */
export async function getAutocompleteSuggestions(query: string): Promise<AutocompleteSuggestion[]> {
  if (!query || !query.trim()) return [];
  const safe = query.trim().replace(/[%_\\]/g, "\\$&");

  try {
    const [questionsRes, tagsRes, profilesRes] = await Promise.all([
      supabase
        .from("questions")
        .select("id, title, answers_count")
        .eq("is_deleted", false)
        .ilike("title", `%${safe}%`)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("tags")
        .select("id, name, usage_count")
        .ilike("name", `%${safe}%`)
        .order("usage_count", { ascending: false })
        .limit(3),
      supabase
        .from("profiles")
        .select("id, name, username, avatar_url, reputation")
        .or(`name.ilike.%${safe}%,username.ilike.%${safe}%`)
        .order("reputation", { ascending: false })
        .limit(3),
    ]);

    const suggestions: AutocompleteSuggestion[] = [];

    // 1. Add questions
    if (questionsRes.data) {
      for (const q of questionsRes.data) {
        suggestions.push({
          type: "question",
          id: q.id,
          title: q.title,
          subtitle: `${(q.answers_count ?? 0).toLocaleString("ar-SA")} إجابة`,
        });
      }
    }

    // 2. Add tags
    if (tagsRes.data) {
      for (const t of tagsRes.data) {
        suggestions.push({
          type: "tag",
          id: t.id,
          title: t.name,
          subtitle: `${(t.usage_count ?? 0).toLocaleString("ar-SA")} سؤال`,
          metadata: t.name,
        });
      }
    }

    // 3. Add profiles
    if (profilesRes.data) {
      for (const p of profilesRes.data) {
        suggestions.push({
          type: "user",
          id: p.id,
          title: p.name || `@${p.username}`,
          subtitle: `${(p.reputation ?? 0).toLocaleString("ar-SA")} نقطة سمعة`,
          avatar_url: p.avatar_url || undefined,
          metadata: p.username,
        });
      }
    }

    return suggestions;
  } catch (error) {
    console.error("getAutocompleteSuggestions error:", error);
    return [];
  }
}

