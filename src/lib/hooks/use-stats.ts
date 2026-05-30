import { useQuery } from "@tanstack/react-query";
import {
  getPlatformStats,
  getTrendingTags,
  getHotQuestions,
  getTopContributors,
  type PlatformStats,
  type LeaderboardEntry,
} from "../services/stats.service";
import type { Tag, Question, Profile } from "../database.types";

// ── Platform Stats ────────────────────────────────────────────
export function usePlatformStats() {
  return useQuery<PlatformStats>({
    queryKey: ["platformStats"],
    queryFn: getPlatformStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
}

// ── Trending Tags ─────────────────────────────────────────────
export function useTrendingTags(limit = 10) {
  return useQuery<Tag[]>({
    queryKey: ["trendingTags", limit],
    queryFn: () => getTrendingTags(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ── Hot Questions ─────────────────────────────────────────────
export function useHotQuestions(limit = 5) {
  return useQuery<Question[]>({
    queryKey: ["hotQuestions", limit],
    queryFn: () => getHotQuestions(limit),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ── Top Contributors ──────────────────────────────────────────
export function useTopContributors(limit = 5) {
  return useQuery<Profile[]>({
    queryKey: ["topContributors", limit],
    queryFn: () => getTopContributors(limit),
    staleTime: 5 * 60 * 1000,
  });
}
