import { useInfiniteQuery } from "@tanstack/react-query";
import { getRecentFeed, type FeedPage } from "../services/feed.service";
import { queryKeys } from "../query-keys";
import type { Question } from "../database.types";

/** Cursor-paginated recent feed — no ranking, pure chronological order */
export function useRecentFeed() {
  return useInfiniteQuery<FeedPage, Error, InfiniteFeedData, typeof queryKeys.recentFeed>({
    queryKey: queryKeys.recentFeed,
    queryFn: ({ pageParam }) =>
      getRecentFeed(20, pageParam as { created_at: string; id: string } | null),
    initialPageParam: null as unknown,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

/** Flattened, deduplicated feed data shape */
export interface InfiniteFeedData {
  pages: FeedPage[];
  pageParams: unknown[];
  questions: Question[];
}

/** Helper: flatten infinite query data into a deduplicated question list */
export function flattenFeedData(data: {
  pages: FeedPage[];
  pageParams: unknown[];
}): Question[] {
  const seen = new Set<string>();
  const result: Question[] = [];
  for (const page of data.pages) {
    for (const q of page.questions) {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        result.push(q);
      }
    }
  }
  return result;
}
