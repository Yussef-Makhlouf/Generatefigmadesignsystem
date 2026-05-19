import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { EmptyState } from "../components/empty-state";
import { Bell, MessageSquare, ThumbsUp, UserPlus, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  type: "answer" | "vote" | "comment" | "follow";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "answer",
      title: "إجابة جديدة على سؤالك",
      description: 'أجابت سارة علي على سؤالك "كيف أتعلم البرمجة من الصفر؟"',
      timestamp: "منذ ساعتين",
      read: false,
      avatar: "",
    },
    {
      id: "2",
      type: "vote",
      title: "تصويت على إجابتك",
      description: "حصلت إجابتك على 5 تصويتات جديدة",
      timestamp: "منذ 3 ساعات",
      read: false,
    },
    {
      id: "3",
      type: "comment",
      title: "تعليق جديد",
      description: 'علّق خالد على إجابتك: "نصيحة رائعة، شكراً!"',
      timestamp: "منذ 5 ساعات",
      read: true,
      avatar: "",
    },
    {
      id: "4",
      type: "follow",
      title: "متابع جديد",
      description: "بدأ عمر يوسف بمتابعتك",
      timestamp: "منذ يوم",
      read: true,
      avatar: "",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "answer":
        return MessageSquare;
      case "vote":
        return ThumbsUp;
      case "comment":
        return MessageSquare;
      case "follow":
        return UserPlus;
      default:
        return Bell;
    }
  };

  const groupedNotifications = {
    today: notifications.filter((n) => n.timestamp.includes("ساعة")),
    thisWeek: notifications.filter((n) => n.timestamp.includes("يوم")),
    earlier: notifications.filter(
      (n) => n.timestamp.includes("أسبوع") || n.timestamp.includes("شهر")
    ),
  };

  if (notifications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
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
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              لديك {unreadCount} إشعار غير مقروء
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="rounded-lg">
            <CheckCheck className="h-4 w-4 ml-2" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Today */}
        {groupedNotifications.today.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">اليوم</h2>
            <div className="space-y-2">
              {groupedNotifications.today.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <Card
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? "bg-primary/5 border-primary/20" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback>
                              <Icon className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {notification.description}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* This Week */}
        {groupedNotifications.thisWeek.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              هذا الأسبوع
            </h2>
            <div className="space-y-2">
              {groupedNotifications.thisWeek.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <Card
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? "bg-primary/5 border-primary/20" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback>
                              <Icon className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {notification.description}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Earlier */}
        {groupedNotifications.earlier.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">سابقاً</h2>
            <div className="space-y-2">
              {groupedNotifications.earlier.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <Card
                    key={notification.id}
                    className="p-4 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
