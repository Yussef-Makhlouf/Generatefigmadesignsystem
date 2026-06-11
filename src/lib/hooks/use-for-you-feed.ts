import { useInfiniteQuery } from "@tanstack/react-query";
import { getForYouFeed, type FeedPage } from "../services/feed.service";
import { queryKeys } from "../query-keys";
import { useSession } from "./use-auth";

/** Personalized "For You" feed — ranked by weighted scoring formula in SQL */
export function useForYouFeed() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  return useInfiniteQuery<FeedPage, Error>({
    queryKey: queryKeys.forYouFeed(userId),
    queryFn: ({ pageParam }) =>
      getForYouFeed(userId!, 20, pageParam as { created_at: string; id: string } | null),
    initialPageParam: null as unknown,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
