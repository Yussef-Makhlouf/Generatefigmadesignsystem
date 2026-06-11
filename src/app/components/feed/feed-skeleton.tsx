import { QuestionListSkeleton } from "../question-skeleton";

/**
 * Feed-specific skeleton wrapper.
 * Uses the existing QuestionListSkeleton for visual consistency.
 */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return <QuestionListSkeleton count={count} />;
}
