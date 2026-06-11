import { useInfiniteQuery } from "@tanstack/react-query";
import { getFollowingFeed, type FeedPage } from "../services/feed.service";
import { queryKeys } from "../query-keys";
import { useSession } from "./use-auth";

/** Following feed — questions from followed users, ranked by engagement + freshness */
export function useFollowingFeed() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  return useInfiniteQuery<FeedPage, Error>({
    queryKey: queryKeys.followingFeed(userId),
    queryFn: ({ pageParam }) =>
      getFollowingFeed(userId!, 20, pageParam as { created_at: string; id: string } | null),
    initialPageParam: null as unknown,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
