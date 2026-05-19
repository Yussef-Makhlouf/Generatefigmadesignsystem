import { Link, useLocation } from "react-router";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Home, TrendingUp, Globe, Bookmark, Settings, Trophy, Flame, Zap } from "lucide-react";

export function DesktopSidebar() {
  const location = useLocation();

  const categories = [
    { name: "تقنية", count: 245, color: "bg-blue-500" },
    { name: "تعليم", count: 189, color: "bg-green-500" },
    { name: "برمجة", count: 156, color: "bg-indigo-500" },
    { name: "ذكاء اصطناعي", count: 134, color: "bg-purple-500" },
    { name: "تصميم", count: 98, color: "bg-pink-500" },
  ];

  const quickLinks = [
    { icon: Home, label: "الرئيسية", path: "/" },
    { icon: TrendingUp, label: "الأكثر نشاطاً", path: "/search?sort=popular" },
    { icon: Globe, label: "المساحات", path: "/spaces" },
    { icon: Trophy, label: "المتصدرون", path: "/leaderboard" },
    { icon: Bookmark, label: "المحفوظات", path: "/saved" },
    { icon: Zap, label: "سجل السمعة", path: "/reputation" },
    { icon: Settings, label: "الإعدادات", path: "/settings" },
  ];

  return (
    <aside className="hidden md:block w-64 border-l border-border p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-shrink-0">
      {/* Quick Links */}
      <Card className="p-3 mb-4">
        <nav className="space-y-0.5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname + location.search === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </Card>

      {/* Categories */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-3 text-sm">التصنيفات</h3>
        <div className="space-y-1.5">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/tags/${encodeURIComponent(category.name)}`}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors text-right"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${category.color}`} />
                <span className="text-sm">{category.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{category.count}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* User Stats */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 text-sm">إحصائياتك</h3>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">الأسئلة</span>
            <span className="font-bold text-primary">12</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">الإجابات</span>
            <span className="font-bold text-secondary">48</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">النقاط</span>
            <span className="font-bold">١٬٢٥٠</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">السلسلة</span>
            <div className="flex items-center gap-1 text-orange-500 font-bold">
              <Flame className="h-4 w-4" />
              <span>٧ أيام</span>
            </div>
          </div>
        </div>

        {/* Streak progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>الهدف: ١٤ يوم</span>
            <span>٧/١٤</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-primary w-1/2 rounded-full" />
          </div>
        </div>
      </Card>
    </aside>
  );
}
