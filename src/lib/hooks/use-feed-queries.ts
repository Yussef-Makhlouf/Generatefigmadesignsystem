import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { queryKeys } from "../query-keys";
import { mapQuestionRow, mapProfileRow, mapReviewRow } from "../mappers/feed-mappers";
import type { Question } from "../database.types";

const QUESTION_SELECT = `
  *,
  author:profiles!author_id(*),
  question_tags(tag_id, tags(*)),
  question_attachments(*)
`;

export function useFeedQuestions() {
  return useQuery({
    queryKey: queryKeys.questions(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select(QUESTION_SELECT)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []).map((q) => mapQuestionRow(q as Record<string, unknown>)) as Question[];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useFeedUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return (data ?? []).map((u) => mapProfileRow(u as Record<string, unknown>));
    },
  });
}

export function useFeedReviews() {
  return useQuery({
    queryKey: queryKeys.reviews,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          reviewer:profiles!reviewer_id(*),
          entity:profiles!entity_id(*),
          review_attachments(*)
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []).map((r) => mapReviewRow(r as Record<string, unknown>));
    },
  });
}
