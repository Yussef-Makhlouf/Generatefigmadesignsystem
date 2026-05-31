import { supabase } from "../supabase";
import type { Notification, NotificationType, NotificationPriority } from "../database.types";

// ── Fetch notifications for user ───────────────────────────────
export async function getNotifications(
  userId: string,
  options?: {
    limit?: number;
    onlyUnread?: boolean;
  }
): Promise<Notification[]> {
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.onlyUnread) {
    query = query.eq("is_read", false);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getNotifications:", error);
    return [];
  }
  return (data ?? []) as Notification[];
}

// ── Mark notification as read ──────────────────────────────────
export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("markNotificationRead:", error);
    return false;
  }
  return true;
}

// ── Mark all notifications as read ─────────────────────────────
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId);

  if (error) {
    console.error("markAllNotificationsRead:", error);
    return false;
  }
  return true;
}

// ── Create notification ───────────────────────────────────────
// ✅ ENHANCED: supports notification_data, action_url, and priority (schema v2.0)
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  content: string,
  options?: {
    notification_data?: Record<string, unknown>;
    action_url?: string;
    priority?: NotificationPriority;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      content,
      notification_data: options?.notification_data ?? {},
      action_url: options?.action_url ?? null,
      priority: options?.priority ?? "normal",
    });

  if (error) {
    console.error("createNotification:", error);
    return false;
  }
  return true;
}

// ── Get unread count ────────────────────────────────────────────
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}