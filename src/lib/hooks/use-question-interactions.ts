import { useCallback } from "react";
import { useAuthSession } from "./use-auth-session";
import { useBookmarkIds, useUserVotesMap } from "./use-engagement";
import { useContentMutations } from "./use-content-mutations";

/** Bookmarks, votes, and vote/bookmark actions for question cards and feeds */
export function useQuestionInteractions() {
  const { currentUserId } = useAuthSession();
  const { data: bookmarkedIds = [] } = useBookmarkIds(currentUserId);
  const userVotes = useUserVotesMap(currentUserId);
  const { voteMutation, toggleBookmarkMutation } = useContentMutations(currentUserId);

  const voteQuestion = useCallback(
    (questionId: string, dir: "up" | "down") => {
      if (!currentUserId) return;
      voteMutation.mutate({
        userId: currentUserId,
        targetId: questionId,
        targetType: "question",
        voteType: dir,
      });
    },
    [currentUserId, voteMutation]
  );

  const voteAnswer = useCallback(
    (answerId: string, dir: "up" | "down") => {
      if (!currentUserId) return;
      voteMutation.mutate({
        userId: currentUserId,
        targetId: answerId,
        targetType: "answer",
        voteType: dir,
      });
    },
    [currentUserId, voteMutation]
  );

  const toggleBookmark = useCallback(
    (questionId: string): boolean => {
      if (!currentUserId) return false;
      const existing = bookmarkedIds.includes(questionId);
      toggleBookmarkMutation.mutate({ userId: currentUserId, questionId });
      return !existing;
    },
    [bookmarkedIds, currentUserId, toggleBookmarkMutation]
  );

  return {
    bookmarkedIds,
    userVotes,
    voteQuestion,
    voteAnswer,
    toggleBookmark,
  };
}
