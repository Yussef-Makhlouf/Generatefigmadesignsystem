import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createQuestion,
  createAnswer,
  addComment,
  toggleBookmark as apiToggleBookmark,
  updateProfile as apiUpdateProfile,
  toggleEntityVerification,
  deleteReview as apiDeleteReview,
  deleteQuestion as apiDeleteQuestion,
  castVote,
  createReview,
} from "../services";
import { supabase } from "../supabase";
import { queryKeys } from "../query-keys";
import type { CreateQuestionInput, CreateAnswerInput, CreateReviewInput, NotificationType, TargetType, VoteType } from "../database.types";

export function useContentMutations(currentUserId: string | null) {
  const queryClient = useQueryClient();

  const invalidateQuestions = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.questions() });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    queryClient.invalidateQueries({ queryKey: queryKeys.platformStats });
    queryClient.invalidateQueries({ queryKey: queryKeys.hotQuestions });
    queryClient.invalidateQueries({ queryKey: queryKeys.trendingTags });
  };

  const createQuestionMutation = useMutation({
    mutationFn: ({ authorId, input }: { authorId: string; input: CreateQuestionInput }) =>
      createQuestion(authorId, input),
    onSuccess: invalidateQuestions,
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: apiDeleteQuestion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.questions() }),
  });

  const createAnswerMutation = useMutation({
    mutationFn: ({ authorId, input }: { authorId: string; input: CreateAnswerInput }) =>
      createAnswer(authorId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.answers(variables.input.question_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.questions() });
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: ({ userId, questionId }: { userId: string; questionId: string }) =>
      apiToggleBookmark(userId, questionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks(currentUserId) }),
  });

  const voteMutation = useMutation({
    mutationFn: ({
      userId,
      targetId,
      targetType,
      voteType,
    }: {
      userId: string;
      targetId: string;
      targetType: TargetType;
      voteType: VoteType;
    }) => castVote(userId, targetId, targetType, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions() });
      queryClient.invalidateQueries({ queryKey: ["answers"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.userVotes(currentUserId) });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ reviewerId, input }: { reviewerId: string; input: CreateReviewInput }) =>
      createReview(reviewerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser(currentUserId) });
    },
  });

  return {
    createQuestionMutation,
    deleteQuestionMutation,
    createAnswerMutation,
    toggleBookmarkMutation,
    voteMutation,
    createReviewMutation,
    queryClient,
  };
}

export async function markNotificationRead(currentUserId: string, id: string, queryClient: ReturnType<typeof useQueryClient>) {
  await supabase.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", currentUserId);
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications(currentUserId) });
}

export async function markAllNotificationsRead(currentUserId: string, queryClient: ReturnType<typeof useQueryClient>) {
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", currentUserId)
    .eq("is_read", false);
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications(currentUserId) });
}

export async function insertNotification(
  currentUserId: string,
  payload: { type: NotificationType; title: string; content: string },
  queryClient: ReturnType<typeof useQueryClient>
) {
  await supabase.from("notifications").insert({
    user_id: currentUserId,
    type: payload.type,
    title: payload.title,
    content: payload.content,
    is_read: false,
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications(currentUserId) });
}
