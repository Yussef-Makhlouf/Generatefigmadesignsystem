import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAnswers, 
  createAnswer, 
  acceptAnswer,
  unacceptAnswer,
  uploadAnswerImage,
  addComment
} from "../services";
import { supabase } from "../supabase";
import type { Answer, CreateAnswerInput } from "../database.types";
import { useEffect } from "react";

// ── Answers Hooks ─────────────────────────────────────────────
export function useAnswers(questionId: string) {
  return useQuery({
    queryKey: ["answers", questionId],
    queryFn: () => getAnswers(questionId),
    enabled: !!questionId,
  });
}

export function useCreateAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ authorId, input }: { authorId: string; input: CreateAnswerInput }) =>
      createAnswer(authorId, input),
    onSuccess: (_newAnswer, variables) => {
      queryClient.invalidateQueries({ queryKey: ["answers", variables.input.question_id] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useAnswerImageUpload() {
  return useMutation({
    mutationFn: ({ answerId, file }: { answerId: string; file: File }) =>
      uploadAnswerImage(answerId, file),
  });
}

export function useAcceptAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (answerId: string) => acceptAnswer(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers"] });
    },
  });
}

export function useUnacceptAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (answerId: string) => unacceptAnswer(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers"] });
    },
  });
}


export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ answerId, authorId, content }: { answerId: string; authorId: string; content: string }) =>
      addComment(answerId, authorId, content),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["answers", variables.answerId] });
    },
  });
}

// ── Real-time answers subscription ───────────────────────────
export function useRealtimeAnswers(questionId: string, onNewAnswer: (a: Answer) => void) {
  useEffect(() => {
    if (!questionId) return;

    const channel = supabase
      .channel(`answers-${questionId}`)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "answers",
          filter: `question_id=eq.${questionId}`
        },
        (payload) => {
          onNewAnswer(payload.new as Answer);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, onNewAnswer]);
}