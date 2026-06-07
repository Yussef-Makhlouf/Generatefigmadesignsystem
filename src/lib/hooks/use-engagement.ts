import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { queryKeys } from "../query-keys";
import { notificationToItem } from "../database.types";
import type { NotificationItem } from "../database.types";

export function useBookmarkIds(currentUserId: string | null) {
  return useQuery({
    queryKey: queryKeys.bookmarks(currentUserId),
    queryFn: async () => {
      if (!currentUserId) return [] as string[];
      const { data } = await supabase
        .from("bookmarks")
        .select("question_id")
        .eq("user_id", currentUserId);
      return (data?.map((b) => b.question_id) as string[]) ?? [];
    },
    enabled: !!currentUserId,
  });
}

export function useUserVotesMap(currentUserId: string | null) {
  const { data: userVotes = [] } = useQuery({
    queryKey: queryKeys.userVotes(currentUserId),
    queryFn: async () => {
      if (!currentUserId) return [];
      const { data, error } = await supabase
        .from("votes")
        .select("target_id, vote_type")
        .eq("user_id", currentUserId);
      if (error) {
        console.error("Error fetching user votes:", error);
        return [];
      }
      return data ?? [];
    },
    enabled: !!currentUserId,
  });

  return useMemo(() => {
    const map: Record<string, "up" | "down"> = {};
    userVotes.forEach((v) => {
      if (v.target_id && v.vote_type) {
        map[v.target_id] = v.vote_type as "up" | "down";
      }
    });
    return map;
  }, [userVotes]);
}

export function useNotifications(currentUserId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<NotificationItem[]>({
    queryKey: queryKeys.notifications(currentUserId),
    queryFn: async () => {
      if (!currentUserId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(notificationToItem);
    },
    enabled: !!currentUserId,
  });

  useEffect(() => {
    if (!currentUserId) return;

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      // Remove any existing channel with the same topic before re-subscribing
      const topic = `notifications:${currentUserId}`;
      try {
        const existing = supabase.getChannels().find((c: any) => c.topic === `realtime:${topic}`);
        if (existing) {
          await supabase.removeChannel(existing);
        }
      } catch {
        // ignore errors from getChannels in older SDK versions
      }

      if (cancelled) return;

      channel = supabase
        .channel(`notifications:${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUserId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications(currentUserId) });
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);

  return query;
}
