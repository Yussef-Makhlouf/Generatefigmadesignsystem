import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { MessageSquare, PenSquare } from "lucide-react";
import { Button } from "../ui/button";
import { FeedSkeleton } from "./feed-skeleton";
import { FeedItem } from "./feed-item";
import { InfiniteScrollLoader } from "./infinite-scroll-loader";
import { useQuestionInteractions } from "../../../lib/hooks/use-question-interactions";
import { flattenFeedData } from "../../../lib/hooks/use-feed";
import type { FeedPage } from "../../../lib/services/feed.service";
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

interface FeedListProps {
  /** The infinite query result from any feed hook */
  query: UseInfiniteQueryResult<InfiniteData<FeedPage>, Error>;
  /** Message to show when the feed is empty */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Whether auth is required (shows login hint instead of "ask a question" CTA) */
  requireAuth?: boolean;
}

/**
 * Generic infinite-scroll feed component.
 * Handles loading skeletons, error states with retry, empty states,
 * and automatic next-page loading via IntersectionObserver.
 */
export function FeedList({
  query,
  emptyTitle = "لا توجد أسئلة بعد",
  emptyDescription = "كن أول من يطرح سؤالاً ويشارك المعرفة!",
  requireAuth = false,
}: FeedListProps) {
  const navigate = useNavigate();
  const { bookmarkedIds, userVotes } = useQuestionInteractions();

  const questions = useMemo(
    () => (query.data ? flattenFeedData(query.data) : []),
    [query.data],
  );

  const handleLoadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  // ── Loading state ──────────────────────────────────────────────
  if (query.isLoading) {
    return <FeedSkeleton count={4} />;
  }

  // ── Error state (initial load only) ────────────────────────────
  if (query.isError && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-2xl border border-border/40 py-12">
        <div className="p-3 bg-destructive/10 rounded-full mb-4 text-destructive">
          <MessageSquare className="h-8 w-8 stroke-[1.5]" />
        </div>
        <h3 className="font-semibold text-lg mb-1">حدث خطأ أثناء التحميل</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {query.error?.message ?? "تعذّر تحميل الأسئلة. حاول مرة أخرى."}
        </p>
        <Button
          variant="outline"
          onClick={() => query.refetch()}
          className="rounded-xl border-border hover:border-primary hover:text-primary"
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-2xl border border-border/40 py-12">
        <div className="p-3 bg-primary/5 rounded-full mb-4 text-primary">
          <MessageSquare className="h-8 w-8 stroke-[1.5]" />
        </div>
        <h3 className="font-semibold text-lg mb-1">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{emptyDescription}</p>
        {!requireAuth && (
          <Button
            onClick={() => navigate("/questions/new")}
            className="rounded-xl bg-primary hover:bg-primary/95 text-white gap-2 font-medium"
          >
            <PenSquare className="h-4 w-4" />
            اطرح سؤالاً الآن
          </Button>
        )}
      </div>
    );
  }

  // ── Feed with infinite scroll ──────────────────────────────────
  return (
    <div className="space-y-2 sm:space-y-3 stagger">
      {questions.map((q) => (
        <FeedItem
          key={q.id}
          question={q}
          isBookmarked={bookmarkedIds.includes(q.id)}
          userVote={userVotes[q.id]}
        />
      ))}

      <InfiniteScrollLoader
        onIntersect={handleLoadMore}
        isLoading={query.isFetchingNextPage}
        hasNextPage={!!query.hasNextPage}
        isError={!!query.isError}
        onRetry={() => query.refetch()}
      />
    </div>
  );
}
