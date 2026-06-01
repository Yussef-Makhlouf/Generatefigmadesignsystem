import { Link, useLocation, useNavigate } from "react-router";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Home, TrendingUp, Globe, Bookmark, Settings, Trophy, Flame, Zap, LogOut, Shield } from "lucide-react";
import { ReputationBadge } from "./reputation-badge";
import { useAppState } from "../context/AppStateContext";
import { useCategories } from "../../lib/hooks/use-categories";
import { signOut } from "../../lib/services";
import { cn } from "./ui/utils";




const QUICK_LINKS = [
  { icon: Home,       label: "الرئيسية",     path: "/" },
  { icon: TrendingUp, label: "الأكثر نشاطاً", path: "/search?sort=popular" },
  { icon: Globe,      label: "المساحات",     path: "/spaces" },
  { icon: Trophy,     label: "المتصدرون",    path: "/leaderboard" },
  { icon: Bookmark,   label: "المحفوظات",    path: "/saved" },
  { icon: Zap,        label: "سجل السمعة",   path: "/reputation" },
  { icon: Settings,   label: "الإعدادات",    path: "/settings" },
];

export function DesktopSidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { currentUser, questions, answers } = useAppState();
  const { categories, isLoading: categoriesLoading } = useCategories(6);
  const navigate = useNavigate();

  const handleSidebarLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const isAuthenticated = Boolean(currentUser && currentUser.id !== "1" && currentUser.username !== "guest");
  const isAdmin = currentUser?.accountType === "admin";
  
  const userQuestionsCount = questions.filter(q => q.author_id === currentUser?.id).length;
  const userAnswersCount = answers.filter(a => a.author_id === currentUser?.id).length;

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname + location.search === path || location.pathname === path;

  const activeLinks = [...QUICK_LINKS];
  if (isAdmin) {
    activeLinks.push({ icon: Shield, label: "لوحة التحكم", path: "/admin" });
  }

  return (
    <aside className={cn("hidden md:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pb-6 gap-3 pt-4", className)}>

      {/* Quick Links */}
      <Card className="p-2 shadow-sm border-border/60" style={{ borderRadius: "var(--radius-lg)" }}>
        <nav className="space-y-0.5">
          {activeLinks.map((link) => {
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

      {/* Categories — loaded from Supabase */}
      <Card className="p-4 shadow-sm border-border/60" style={{ borderRadius: "var(--radius-lg)" }}>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          التصنيفات
        </h3>
        <div className="space-y-0.5">
          {categoriesLoading ? (
            // Skeleton placeholders while fetching
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-4 w-6 rounded-full bg-muted animate-pulse" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-2">لا توجد تصنيفات بعد</p>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/search?category=${encodeURIComponent(cat.name)}`}
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
            ))
          )}
        </div>
      </Card>

      {/* User Stats Card OR Guest Call to Action */}
      {isAuthenticated ? (
        <Card className="p-4 shadow-sm border-border/60 gradient-soft" style={{ borderRadius: "var(--radius-lg)" }}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            إحصائياتك
          </h3>
          <div className="mb-3">
            <ReputationBadge points={currentUser.reputation || 0} />
          </div>
          <div className="space-y-2">
            {[
              { label: "الأسئلة",  value: userQuestionsCount.toLocaleString("ar-EG"), color: "text-primary" },
              { label: "الإجابات", value: userAnswersCount.toLocaleString("ar-EG"), color: "text-secondary" },
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
          
          <Button
            variant="ghost"
            className="w-full mt-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 text-xs font-semibold gap-2 h-9"
            onClick={handleSidebarLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            تسجيل الخروج
          </Button>
        </Card>
      ) : (
        <Card 
          className="p-4 shadow-md border border-primary/20 bg-gradient-to-br from-neutral-900 via-neutral-950 to-primary/10 relative overflow-hidden" 
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-secondary animate-float fill-secondary/20" />
            <span>مجتمع خبير المعرفي</span>
          </h3>
          <p className="text-xs text-neutral-300 leading-relaxed mb-4">
            طوّر سمعتك الرقمية، اطرح أسئلتك، أجب عن استفسارات المطورين، واكسب شارات سمعة مرموقة اليوم!
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/auth/register"
              className="w-full h-9 rounded-xl bg-primary hover:bg-primary-hover border-0 shadow-sm transition-all duration-280 font-bold text-white text-xs flex items-center justify-center gap-1"
            >
              <span>إنشاء حساب مجاناً</span>
            </Link>
            <Link
              to="/auth/login"
              className="w-full h-9 rounded-xl border border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all text-xs flex items-center justify-center"
            >
              <span>تسجيل الدخول</span>
            </Link>
          </div>
        </Card>
      )}
    </aside>
  );
}
