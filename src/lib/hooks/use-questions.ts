import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getQuestions, 
  getQuestionById, 
  createQuestion,
  uploadQuestionImage,
  toggleBookmark,
  getBookmarkedQuestions
} from "../services";
import { supabase } from "../supabase";
import { useSession } from "./use-auth";
import type { Question, CreateQuestionInput } from "../database.types";
import { queryKeys } from "../query-keys";
import { useEffect } from "react";

// ── Questions Hooks ───────────────────────────────────────────
export function useQuestions(
  options?: { filter?: "recent" | "popular" | "unanswered"; tag?: string; category?: string; search?: string; limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: queryKeys.questions(options),
    queryFn: () => getQuestions(options),
    staleTime: 1000 * 60 * 5,
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: queryKeys.question(id),
    queryFn: () => getQuestionById(id),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ authorId, input }: { authorId: string; input: CreateQuestionInput }) =>
      createQuestion(authorId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions() });
    },
  });
}

export function useQuestionImageUpload() {
  return useMutation({
    mutationFn: ({ questionId, file }: { questionId: string; file: File }) =>
      uploadQuestionImage(questionId, file),
  });
}

// ── Users Hooks ───────────────────────────────────────────────
export function useUsers() {
  const { data: questions } = useQuestions();
  return questions?.map((q) => q.author).filter(Boolean) ?? [];
}

// ── Bookmarks Hooks ───────────────────────────────────────────
export function useBookmarks() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const bookmarksQuery = useQuery({
    queryKey: queryKeys.bookmarks(currentUserId),
    queryFn: () => getBookmarkedQuestions(currentUserId!),
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 2,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, questionId }: { userId: string; questionId: string }) =>
      toggleBookmark(userId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks(currentUserId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.questions() });
    },
  });

  return {
    bookmarks: bookmarksQuery.data ?? [],
    isLoading: bookmarksQuery.isLoading,
    toggleBookmark: toggleMutation.mutate,
  };
}