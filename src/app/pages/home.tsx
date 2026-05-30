import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { QuestionCard } from "../components/question-card";
import { ExpertCard } from "../components/expert-card";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../components/ui/utils";
import {
  Trophy, Sparkles, Flame, Zap, ChevronLeft,
  MessageSquare, Users, TrendingUp, PenSquare, Hash, Loader2,
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { questionToCardProps } from "../../lib/database.types";
import { motion } from "motion/react";
import { usePlatformStats, useTrendingTags, useHotQuestions, useTopContributors } from "../../lib/hooks/use-stats";

const FILTERS = [
  { key: "recent",     label: "الأحدث",         icon: null },
  { key: "popular",    label: "الأكثر شعبية",    icon: Flame },
  { key: "foryou",     label: "مخصص لك",         icon: Sparkles },
  { key: "unanswered", label: "بدون إجابة",       icon: null },
];

function formatArabicNumber(n: number): string {
  return n.toLocaleString("ar-SA");
}

export function HomePage() {
  const navigate = useNavigate();
  const { questions, bookmarkedIds, voteQuestion, toggleBookmark, users = [] } = useAppState();
  const [filter, setFilter] = useState("recent");

  // Map real database profiles of experts/businesses or high reputation users
  const realFeaturedExperts = [...users]
    .sort((a, b) => (b.reputation ?? 0) - (a.reputation ?? 0))
    .map((u) => ({
      id: u.username ?? u.id,
      name: u.name,
      avatar: u.avatar_url ?? undefined,
      title: u.bio || u.business_category || "خبير معتمد",
      specialty: u.business_category || "مساهم",
      rating: parseFloat(u.business_rating ?? "5.0"),
      answers: u.reputation ?? 0,
      verified: u.is_verified_entity || false,
    }))
    .slice(0, 3);

  // ── Real backend data ─────────────────────────────────────
  const { data: stats } = usePlatformStats();
  const { data: trendingTags = [] } = useTrendingTags(10);
  const { data: hotQuestions = [] } = useHotQuestions(5);
  const { data: topContributors = [] } = useTopContributors(3);

  const PLATFORM_STATS = [
    {
      icon: MessageSquare,
      value: stats ? formatArabicNumber(stats.questions_count) : "…",
      label: "سؤال",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Users,
      value: stats ? formatArabicNumber(stats.users_count) : "…",
      label: "عضو",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      icon: TrendingUp,
      value: stats ? formatArabicNumber(stats.answers_count) : "…",
      label: "إجابة",
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  const filteredQuestions = filter === "popular"
    ? [...questions].sort((a, b) => b.votes_count - a.votes_count)
    : filter === "unanswered"
    ? questions.filter((q) => q.answers_count === 0)
    : questions;

  return (
    <div className="max-w-7xl w-full">

      {/* ── Bento Grid Hero Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        
        {/* Bento Cell 1: Main Core Hero Banner (2/3 width on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="md:col-span-2 relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent flex flex-col justify-between min-h-[260px] sm:min-h-[280px]"
        >
          {/* Subtle Arabesque Mesh Pattern background */}
          <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-15 pointer-events-none" />
          <div className="absolute inset-0 pattern-arabic opacity-10 pointer-events-none" />
          
          {/* Ambient glassmorphic blobs */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-secondary/5 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] sm:text-xs px-3 py-1 rounded-full flex items-center font-medium">
                <Sparkles className="h-3 w-3 ml-1.5 text-secondary animate-pulse-gold shrink-0" />
                مجتمع المعرفة العربي الراقي
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 font-heading text-neutral-900 dark:text-neutral-50">
              ابدأ بسؤال،{" "}
              <span className="text-primary bg-clip-text">انهِ بمعرفة</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-lg mb-6">
              اطرح أسئلتك واحصل على إجابات موثوقة من خبراء المجتمع العربي. شارك خبرتك، راكم سمعتك، وساعد الآخرين على الازدهار.
            </p>
          </div>

          <div className="relative z-10 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
            {/* Stats list */}
            <div className="flex items-center gap-4 sm:gap-6">
              {PLATFORM_STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className={cn("p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0", s.bg, s.color)}>
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-900 dark:text-neutral-50 font-numbers leading-none mb-0.5">{s.value}</span>
                      <span className="text-muted-foreground text-[10px] leading-none">{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Magnetic/Premium buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                className="rounded-xl h-11 px-5 bg-primary border-0 shadow-primary shadow-md hover:shadow-lg text-sm font-semibold text-white transition-all duration-280 ease-spring active:scale-95 flex items-center gap-2"
                onClick={() => navigate("/questions/new")}
              >
                <PenSquare className="h-4 w-4" />
                <span>اطرح سؤالاً</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-11 px-4 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium"
                onClick={() => navigate("/search")}
              >
                <span>استعرض الأسئلة</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bento Cell 2: Live Daily Challenge (1/3 width on desktop) */}
        {hotQuestions[0] ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="md:col-span-1 relative overflow-hidden rounded-2xl p-6 border border-secondary/20 bg-gradient-to-br from-secondary/[0.04] via-transparent to-transparent flex flex-col justify-between min-h-[260px] sm:min-h-[280px]"
          >
            <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-10 pointer-events-none" />
            {/* Accent light source */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-secondary/15 text-secondary border border-secondary/25 text-[10px] px-2.5 py-0.5 rounded-full flex items-center font-semibold">
                  <Zap className="h-3 w-3 ml-1 text-yellow-500 animate-bounce shrink-0" />
                  الأكثر تصويتاً اليوم
                </Badge>
                <span className="text-[10px] text-muted-foreground font-numbers">
                  {hotQuestions[0].votes_count} تصويت
                </span>
              </div>

              <h3
                className="font-bold text-neutral-800 dark:text-neutral-100 text-base leading-snug mb-3 hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/questions/${hotQuestions[0].id}`)}
              >
                {hotQuestions[0].title}
              </h3>
              
              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                {hotQuestions[0].content}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60 mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-secondary font-bold font-numbers">
                <Trophy className="h-4 w-4 text-secondary animate-float shrink-0" />
                <span>+٥٠ نقطة سمعة</span>
              </div>
              <Button
                className="rounded-xl h-9 text-xs px-4 bg-secondary border-0 shadow-secondary shadow-sm hover:shadow-md text-white font-semibold"
                onClick={() => navigate(`/questions/${hotQuestions[0].id}`)}
              >
                أجب الآن
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="md:col-span-1 relative overflow-hidden rounded-2xl p-6 border border-secondary/20 bg-gradient-to-br from-secondary/[0.04] via-transparent to-transparent flex items-center justify-center min-h-[260px] sm:min-h-[280px]"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </motion.div>
        )}
        
      </div>

      {/* ── Trending Tags Strip (Real backend data) ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 overflow-x-auto pb-1 scrollbar-none">
        <Hash className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground shrink-0" />
        {trendingTags.length > 0
          ? trendingTags.map((tag, i) => (
              <Link key={tag.id} to={`/tags/${encodeURIComponent(tag.name)}`}>
                <Badge
                  variant="outline"
                  className="shrink-0 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs cursor-pointer border-border/80 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all tag-pill whitespace-nowrap"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {tag.name}
                </Badge>
              </Link>
            ))
          : // Skeleton placeholder tags while loading
            Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 h-6 rounded-full bg-muted/40 animate-pulse"
                style={{ width: `${50 + i * 10}px` }}
              />
            ))}
      </div>

      <div className="flex gap-4 lg:gap-6">
        {/* ── Main Feed ── */}
        <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 overflow-hidden">

          {/* Filter Tabs */}
          <div className="flex gap-0.5 sm:gap-1 bg-muted/30 backdrop-blur-sm border border-border/20 rounded-xl p-1 overflow-x-auto scrollbar-none">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 min-w-fit flex items-center justify-center gap-1 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    active
                      ? "bg-card text-foreground shadow-sm border border-border/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                  {/* Show short label on tiny screens, full label on xs+ */}
                  <span className="hidden xs:inline">{f.label}</span>
                  <span className="xs:hidden">{f.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* "For You" hint */}
          {filter === "foryou" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 p-2.5 sm:p-3 bg-primary/5 rounded-xl border border-primary/20"
            >
              <Sparkles className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary shrink-0" />
              <p className="text-xs sm:text-sm text-primary">
                أسئلة مختارة بناءً على اهتماماتك في <strong>تقنية، تعليم</strong>
              </p>
            </motion.div>
          )}

          {/* Questions */}
          <div className="space-y-2 sm:space-y-3 stagger">
            {(filteredQuestions.length > 0 ? filteredQuestions : questions).map((q) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <QuestionCard
                  {...questionToCardProps(q)}
                  isBookmarked={bookmarkedIds.includes(q.id)}
                  onVote={(dir) => voteQuestion(q.id, dir)}
                  onBookmark={() => toggleBookmark(q.id)}
                  onClick={() => navigate(`/questions/${q.id}`)}
                />
              </motion.div>
            ))}
          </div>

          {/* Load More */}
          <div className="pt-2 text-center pb-20 sm:pb-24 md:pb-4">
            <Button variant="outline" className="rounded-xl px-6 sm:px-8 h-10 sm:h-11 border-border/60 hover:border-primary/40 hover:text-primary transition-all text-sm">
              تحميل المزيد
            </Button>
          </div>
        </div>

        {/* ── Right Panel (Desktop) ── */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-4">

          {/* Hot Today — Real backend data */}
          <Card className="p-4 premium-glass-card" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-secondary/15 border border-secondary/30">
                  <Flame className="h-4 w-4 text-secondary" />
                </div>
                <h3 className="font-semibold text-sm">رائج اليوم</h3>
              </div>
              <Link to="/search?sort=popular" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                الكل <ChevronLeft className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {hotQuestions.length > 0
                ? hotQuestions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => navigate(`/questions/${q.id}`)}
                      className="w-full flex gap-3 text-right group hover:bg-muted/40 rounded-xl p-2 -m-2 transition-all duration-300 border border-transparent hover:border-border/30"
                    >
                      <div
                        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-numbers border"
                        style={{
                          background: i === 0 ? "var(--gradient-primary)" : "var(--muted)",
                          color: i === 0 ? "#fff" : "var(--foreground)",
                          borderColor: i === 0 ? "var(--primary)" : "var(--border)",
                        }}
                      >
                        {q.votes_count}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                          {q.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-numbers">
                          {q.answers_count} إجابة
                        </p>
                      </div>
                    </button>
                  ))
                : // Skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="shrink-0 w-8 h-8 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  ))}
            </div>
          </Card>
 
          {/* Featured Experts */}
          <Card className="p-4 premium-glass-card" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">خبراء مميزون</h3>
              </div>
              <Link to="/leaderboard" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                الكل <ChevronLeft className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-1">
              {realFeaturedExperts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          </Card>
 
          {/* Top Contributors — Real backend data */}
          <Card className="p-4 premium-gold-card overflow-hidden relative" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-secondary/5 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-secondary/15 border border-secondary/30 animate-pulse-gold">
                <Trophy className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="font-semibold text-sm">أنشط المساهمين</h3>
            </div>
            <div className="space-y-2">
              {topContributors.length > 0
                ? topContributors.map((user, i) => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.username}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border/30 transition-all duration-300"
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-8 w-8 border border-border/40">
                          <AvatarImage src={user.avatar_url ?? ""} />
                          <AvatarFallback className="gradient-primary text-white text-xs font-bold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-background shadow-sm ${
                            i === 0 ? "bg-secondary" : i === 1 ? "bg-slate-400" : "bg-amber-700"
                          }`}
                        >
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground font-numbers">
                          {user.reputation.toLocaleString("ar-SA")} نقطة
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 text-[10px] text-secondary font-semibold font-numbers">
                        <Flame className="h-3 w-3 animate-float" />
                      </div>
                    </Link>
                  ))
                : // Skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2.5 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-3 text-xs rounded-xl border-secondary/35 text-secondary hover:border-secondary hover:bg-secondary/10 hover:text-secondary-foreground transition-all duration-300"
              onClick={() => navigate("/leaderboard")}
            >
              عرض لوحة الصدارة الكاملة
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
