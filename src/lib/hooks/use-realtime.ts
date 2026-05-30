import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import type { Question } from "../../lib/database.types";

// Real-time questions subscription hook
export function useRealtimeQuestions(onNewQuestion: (q: Question) => void) {
  const queryClient = useQueryClient();

  const setupRealtime = useCallback(() => {
    const channel = supabase
      .channel("questions-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "questions" },
        (payload) => {
          onNewQuestion(payload.new as Question);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "questions" },
        () => queryClient.invalidateQueries({ queryKey: ["questions"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewQuestion, queryClient]);

  useEffect(() => {
    return setupRealtime();
  }, [setupRealtime]);
}

// Real-time answers subscription hook
export function useRealtimeAnswers(questionId: string, onNewAnswer: (a: any) => void) {
  const queryClient = useQueryClient();

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
          onNewAnswer(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, onNewAnswer]);
}