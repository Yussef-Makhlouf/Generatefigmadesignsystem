import { Link, useLocation } from "react-router";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Home, TrendingUp, Globe, Bookmark, Settings, Trophy, Flame, Zap } from "lucide-react";
import { ReputationBadge } from "./reputation-badge";

const CATEGORIES = [
  { name: "تقنية",       count: 245, color: "bg-blue-500" },
  { name: "تعليم",       count: 189, color: "bg-green-500" },
  { name: "برمجة",       count: 156, color: "bg-indigo-500" },
  { name: "ذكاء اصطناعي", count: 134, color: "bg-purple-500" },
  { name: "تصميم",       count: 98,  color: "bg-pink-500" },
];

const QUICK_LINKS = [
  { icon: Home,       label: "الرئيسية",     path: "/" },
  { icon: TrendingUp, label: "الأكثر نشاطاً", path: "/search?sort=popular" },
  { icon: Globe,      label: "المساحات",     path: "/spaces" },
  { icon: Trophy,     label: "المتصدرون",    path: "/leaderboard" },
  { icon: Bookmark,   label: "المحفوظات",    path: "/saved" },
  { icon: Zap,        label: "سجل السمعة",   path: "/reputation" },
  { icon: Settings,   label: "الإعدادات",    path: "/settings" },
];

export function DesktopSidebar() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname + location.search === path || location.pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pb-6 gap-3 pt-4">

      {/* Quick Links */}
      <Card className="p-2 shadow-sm border-border/60" style={{ borderRadius: "var(--radius-lg)" }}>
        <nav className="space-y-0.5">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                  active
                    ? "gradient-primary text-white shadow-sm shadow-primary/30"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </Card>

      {/* Categories */}
      <Card className="p-4 shadow-sm border-border/60" style={{ borderRadius: "var(--radius-lg)" }}>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          التصنيفات
        </h3>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/tags/${encodeURIComponent(cat.name)}`}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cat.color}`} />
                <span className="text-sm group-hover:text-foreground text-muted-foreground transition-colors">
                  {cat.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </Card>

      {/* User Stats */}
      <Card className="p-4 shadow-sm border-border/60 gradient-soft" style={{ borderRadius: "var(--radius-lg)" }}>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          إحصائياتك
        </h3>
        <div className="mb-3">
          <ReputationBadge points={1250} />
        </div>
        <div className="space-y-2">
          {[
            { label: "الأسئلة",  value: "١٢", color: "text-primary" },
            { label: "الإجابات", value: "٤٨", color: "text-secondary" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">السلسلة</span>
            <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
              <Flame className="h-3.5 w-3.5" />
              <span>٧ أيام</span>
            </div>
          </div>
        </div>

        {/* Streak progress */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>الهدف: ١٤ يوم</span>
            <span>٧/١٤</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/2 gradient-primary rounded-full" />
          </div>
        </div>
      </Card>
    </aside>
  );
}
