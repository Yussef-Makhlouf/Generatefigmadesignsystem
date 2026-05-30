import { useQuery } from "@tanstack/react-query";
import { getLeaderboardByPeriod, type LeaderboardPeriod, type LeaderboardEntry } from "../services/stats.service";

export function useLeaderboard(period: LeaderboardPeriod, limit = 20) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", period, limit],
    queryFn: () => getLeaderboardByPeriod(period, limit),
    staleTime: 3 * 60 * 1000, // 3 minutes
    placeholderData: (prev) => prev, // keep previous data while loading
  });
}
