import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { supabase } from "../supabase";
import { getQuestionById } from "../services";
import { getAnswers } from "../services";
import type { Question, Answer, CommentAuthor } from "../database.types";

/**
 * Dedicated hook for the question-detail page.
 * - Fetches the question by ID with full joins (author, tags, attachments).
 * - Fetches all answers for that question with full joins
 *   (author, attachments, comments with author profiles).
 * - Maps raw Supabase rows into UI-ready shapes.
 * - Subscribes to realtime Postgres changes so new answers/comments
 *   appear automatically without a page refresh.
 */
export function useQuestionDetail(questionId: string) {
  const queryClient = useQueryClient();

  // ── Question ─────────────────────────────────────────────────
  const {
    data: question,
    isLoading: isQuestionLoading,
    error: questionError,
  } = useQuery<Question | null>({
    queryKey: ["question-detail", questionId],
    queryFn: () => getQuestionById(questionId),
    enabled: !!questionId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ── Answers ──────────────────────────────────────────────────
  const {
    data: rawAnswers,
    isLoading: isAnswersLoading,
    error: answersError,
  } = useQuery({
    queryKey: ["question-answers", questionId],
    queryFn: () => getAnswers(questionId),
    enabled: !!questionId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // ── Map raw answers → UI-ready shape ─────────────────────────
  const answers: Answer[] = useMemo(() => {
    return (rawAnswers ?? []).map((a: any) => {
      const authorProfile = a.author;
      const images = (a.answer_attachments ?? [])
        .filter((att: any) => att.type === "image")
        .map((att: any) => att.url as string);
      const links = (a.answer_attachments ?? [])
        .filter((att: any) => att.type === "link")
        .map((att: any) => ({ title: att.title ?? "", url: att.url ?? "" }));
      const locAtt = (a.answer_attachments ?? []).find(
        (att: any) => att.type === "location"
      );
      const locationDetail = locAtt
        ? {
            name: locAtt.title ?? "",
            address: locAtt.address ?? undefined,
            lat: locAtt.lat ? parseFloat(locAtt.lat) : undefined,
            lng: locAtt.lng ? parseFloat(locAtt.lng) : undefined,
          }
        : undefined;

      const verified = a.verified_type
        ? {
            type: a.verified_type as "photo" | "location",
            label:
              a.verified_label ??
              (a.verified_type === "photo"
                ? "مُثبت بصورة ميدانية"
                : "مُثبت بموقع جغرافي"),
          }
        : undefined;

      const mappedComments = (a.comments ?? []).map((c: any) => {
        const commentAuthor: CommentAuthor = {
          id: c.author?.id ?? c.author_id ?? "",
          name: c.author?.name ?? "مستخدم",
          username: c.author?.username ?? "",
          avatar_url: c.author?.avatar_url ?? null,
          reputation: c.author?.reputation ?? 0,
        };
        return {
          id: c.id,
          answer_id: c.answer_id,
          author_id: c.author_id,
          content: c.content,
          created_at: c.created_at,
          updated_at: c.updated_at ?? c.created_at,
          author: commentAuthor,
          timestamp: c.created_at,
        };
      });

      return {
        ...a,
        id: a.id,
        questionId: a.question_id,
        question_id: a.question_id,
        author_id: a.author_id,
        content: a.content,
        votes: a.votes_count ?? 0,
        votes_count: a.votes_count ?? 0,
        is_accepted: a.is_accepted,
        verified,
        images,
        links,
        locationDetail,
        author: {
          id: authorProfile?.id ?? a.author_id ?? "",
          name: authorProfile?.name ?? "مستخدم",
          username: authorProfile?.username ?? "",
          avatar: authorProfile?.avatar_url ?? undefined,
          avatar_url: authorProfile?.avatar_url ?? undefined,
          reputation: authorProfile?.reputation ?? 0,
        },
        timestamp: a.created_at,
        comments: mappedComments,
        is_deleted: a.is_deleted,
        created_at: a.created_at,
        updated_at: a.updated_at,
      } as unknown as Answer;
    });
  }, [rawAnswers]);

  // ── Realtime Subscription ─────────────────────────────────────
  useEffect(() => {
    if (!questionId) return;

    // Subscribe to answer inserts/updates for this question
    const answersChannel = supabase
      .channel(`question-detail-answers:${questionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
          filter: `question_id=eq.${questionId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["question-answers", questionId],
          });
          // Also refresh the question's answer count
          queryClient.invalidateQueries({
            queryKey: ["question-detail", questionId],
          });
        }
      )
      .subscribe();

    // Subscribe to comment inserts (any comment — we'll re-fetch all answers)
    const commentsChannel = supabase
      .channel(`question-detail-comments:${questionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["question-answers", questionId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(answersChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [questionId, queryClient]);

  return {
    question: question ?? null,
    answers,
    isLoading: isQuestionLoading,
    isAnswersLoading,
    error: questionError ?? answersError,
  };
}
