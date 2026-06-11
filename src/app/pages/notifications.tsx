import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { EmptyState } from "../components/empty-state";
import { Bell, MessageSquare, ThumbsUp, CheckCheck, Award, User, Star, MessageCircle } from "lucide-react";
import { useAuthSession } from "../../lib/hooks/use-auth-session";
import { useNotifications } from "../../lib/hooks/use-engagement";
import { useAppActions } from "../../lib/hooks/use-app-actions";
import { useNavigate } from "react-router";
import { SEO } from "../components/seo";

export function NotificationsPage() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthSession();
  const { data: notifications = [] } = useNotifications(currentUserId);
  const { markNotificationAsRead, markAllNotificationsAsRead } = useAppActions();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "answer":
        return MessageSquare;
      case "comment":
        return MessageCircle;
      case "like":
        return ThumbsUp;
      case "achievement":
        return Award;
      case "follow":
        return User;
      case "review":
        return Star;
      default:
        return Bell;
    }
  };

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markNotificationAsRead(id);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const groupedNotifications = {
    today: notifications.filter((n) => n.timestamp.includes("دقيقة") || n.timestamp.includes("ساعة")),
    thisWeek: notifications.filter((n) => n.timestamp.includes("يوم") && !n.timestamp.includes("أيام")),
    earlier: notifications.filter(
      (n) => n.timestamp.includes("أيام") || n.timestamp.includes("أسبوع") || n.timestamp.includes("شهر")
    ),
  };

  if (notifications.length === 0) {
    return (
      <div className="max-w-3xl w-full mx-auto">
        <EmptyState
          icon={Bell}
          title="لا توجد إشعارات"
          description="عندما تتفاعل مع المجتمع، ستظهر التحديثات هنا"
          action={undefined}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full mx-auto animate-fade-in pb-4 relative">
      <SEO title="الإشعارات" description="تابع إشعاراتك وتفاعلاتك على منصة خبير." canonical="/notifications" noindex />
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary-hover to-secondary bg-clip-text text-transparent">
            الإشعارات
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-secondary mt-1.5 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
              لديك <span className="font-bold text-primary numeral">{unreadCount}</span> إشعار غير مقروء
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllNotificationsAsRead()}
            className="w-full sm:w-auto rounded-xl border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary transition-all duration-300 font-medium"
          >
            <CheckCheck className="h-4 w-4 me-2" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {/* Today */}
        {groupedNotifications.today.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-primary tracking-wider uppercase flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_4px_var(--primary)]" />
              اليوم
            </h2>
            <div className="space-y-3">
              {groupedNotifications.today.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`premium-glass-card p-5 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 border ${
                      !notification.read
                        ? "border-primary/25 bg-primary/[0.04] hover:bg-primary/[0.07] shadow-[0_4px_20px_rgba(0,242,254,0.04)]"
                        : "bg-card/45 border-border/45 hover:border-primary/20"
                    }`}
                    onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                  >
                    {!notification.read && (
                      <div className="absolute top-0 right-0 w-[4px] h-full bg-gradient-to-b from-primary to-primary-hover" />
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                          !notification.read
                            ? "bg-primary/15 border-primary/30 shadow-[0_0_12px_rgba(0,242,254,0.1)] text-primary"
                            : "bg-muted/50 border-border text-text-secondary"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-bold text-sm text-text-primary mb-1">
                              {notification.title}
                            </p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {notification.content}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1 shadow-[0_0_8px_var(--primary)] animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-3 font-numbers flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-text-placeholder/50" />
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* This Week */}
        {groupedNotifications.thisWeek.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-secondary tracking-wider uppercase flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_4px_var(--secondary)]" />
              هذا الأسبوع
            </h2>
            <div className="space-y-3">
              {groupedNotifications.thisWeek.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`premium-glass-card p-5 rounded-2xl cursor-pointer relative overflow-hidden transition-all duration-300 border ${
                      !notification.read
                        ? "border-primary/25 bg-primary/[0.04] hover:bg-primary/[0.07] shadow-[0_4px_20px_rgba(0,242,254,0.04)]"
                        : "bg-card/45 border-border/45 hover:border-primary/20"
                    }`}
                    onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                  >
                    {!notification.read && (
                      <div className="absolute top-0 right-0 w-[4px] h-full bg-gradient-to-b from-primary to-primary-hover" />
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                          !notification.read
                            ? "bg-primary/15 border-primary/30 shadow-[0_0_12px_rgba(0,242,254,0.1)] text-primary"
                            : "bg-muted/50 border-border text-text-secondary"
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-bold text-sm text-text-primary mb-1">
                              {notification.title}
                            </p>
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {notification.content}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1 shadow-[0_0_8px_var(--primary)] animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-3 font-numbers flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-text-placeholder/50" />
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Earlier */}
        {groupedNotifications.earlier.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-text-muted tracking-wider uppercase flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
              سابقاً
            </h2>
            <div className="space-y-3">
              {groupedNotifications.earlier.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className="premium-glass-card p-5 rounded-2xl cursor-pointer bg-card/45 border border-border/45 hover:border-primary/20 transition-all duration-300"
                    onClick={() => handleNotificationClick(notification.id, notification.action_url)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-11 w-11 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-text-secondary">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text-primary mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {notification.content}
                        </p>
                        <p className="text-xs text-text-muted mt-3 font-numbers flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-text-placeholder/50" />
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
