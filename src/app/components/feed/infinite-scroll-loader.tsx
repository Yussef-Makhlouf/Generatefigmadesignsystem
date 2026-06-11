import { useRef, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

interface InfiniteScrollLoaderProps {
  /** Called when the sentinel element enters the viewport */
  onIntersect: () => void;
  /** Whether a page is currently loading */
  isLoading: boolean;
  /** Whether there are more pages to load */
  hasNextPage: boolean;
  /** Whether the query has encountered an error */
  isError: boolean;
  /** Retry callback for error recovery */
  onRetry?: () => void;
}

/**
 * Sentinel element that triggers loading the next page via IntersectionObserver.
 * Shows appropriate states for loading, error, and end-of-list.
 */
export function InfiniteScrollLoader({
  onIntersect,
  isLoading,
  hasNextPage,
  isError,
  onRetry,
}: InfiniteScrollLoaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isLoading && !isError) {
        onIntersect();
      }
    },
    [onIntersect, hasNextPage, isLoading, isError],
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "400px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div ref={sentinelRef} className="py-4 flex flex-col items-center gap-2">
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>جاري التحميل...</span>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-2 text-destructive text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>حدث خطأ أثناء التحميل</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="rounded-xl text-xs">
              إعادة المحاولة
            </Button>
          )}
        </div>
      )}

      {!hasNextPage && !isLoading && !isError && (
        <p className="text-muted-foreground text-xs text-center">
          — وصلت إلى النهاية —
        </p>
      )}
    </div>
  );
}
