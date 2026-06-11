import { useInfiniteQuery } from "@tanstack/react-query";
import { getTrendingFeed, type FeedPage } from "../services/feed.service";
import { queryKeys } from "../query-keys";

/** Trending feed — momentum-based ranking from last 24h activity */
export function useTrendingFeed() {
  return useInfiniteQuery<FeedPage, Error>({
    queryKey: queryKeys.trendingFeed,
    queryFn: ({ pageParam }) =>
      getTrendingFeed(20, pageParam as { created_at: string; id: string } | null),
    initialPageParam: null as unknown,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
