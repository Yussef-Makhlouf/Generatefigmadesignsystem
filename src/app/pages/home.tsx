import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { QuestionCard } from "../components/question-card";
import { ExpertCard, FEATURED_EXPERTS } from "../components/expert-card";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Trophy, Sparkles, Flame, Zap, ChevronLeft,
  MessageSquare, Users, TrendingUp, PenSquare, Hash,
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { motion } from "motion/react";

const topContributors = [
  { name: "محمد الأحمد",    reputation: 5420, answers: 234, streak: 14 },
  { name: "نورة السعيد",    reputation: 4850, answers: 198, streak: 7 },
  { name: "عبدالرحمن الخالد", reputation: 3920, answers: 156, streak: 5 },
];

const hotToday = [
  { id: "1", title: "كيف أبدأ في تعلم Python من الصفر؟", votes: 89, hot: true, answers: 22 },
  { id: "2", title: "ما هي أفضل IDE للجافا في ٢٠٢٥؟",    votes: 67, answers: 14 },
  { id: "3", title: "نصائح للتحضير لمقابلة عمل تقنية",    votes: 54, answers: 9 },
];

const PLATFORM_STATS = [
  { icon: MessageSquare, value: "٨٢٣٤",  label: "سؤال", color: "text-primary",   bg: "bg-primary/10" },
  { icon: Users,         value: "٢٤٥٨",  label: "عضو",  color: "text-secondary", bg: "bg-secondary/10" },
  { icon: TrendingUp,    value: "١٥٦٧٨", label: "إجابة",color: "text-green-600", bg: "bg-green-100" },
];

const TRENDING_TAGS = ["برمجة", "ذكاء اصطناعي", "React", "تصميم", "Python", "تعليم", "تطوير ويب"];

const FILTERS = [
  { key: "recent",     label: "الأحدث",         icon: null },
  { key: "popular",    label: "الأكثر شعبية",    icon: Flame },
  { key: "foryou",     label: "مخصص لك",         icon: Sparkles },
  { key: "unanswered", label: "بدون إجابة",       icon: null },
];

export function HomePage() {
  const navigate = useNavigate();
  const { questions, bookmarkedIds, voteQuestion, toggleBookmark } = useAppState();
  const [filter, setFilter] = useState("recent");

  const filteredQuestions = filter === "popular"
    ? [...questions].sort((a, b) => b.votes - a.votes)
    : filter === "unanswered"
    ? questions.filter((q) => q.answers === 0)
    : questions;

  return (
    <div className="max-w-7xl w-full">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-4 sm:mb-6 p-4 sm:p-6 md:p-8 border border-primary/20 bg-primary/5"
      >
        {/* Arabic geometric bg pattern */}
        <div className="absolute inset-0 pattern-arabic opacity-25" />
        {/* Ambient color blobs — solid blur, no gradients */}
        <div className="absolute top-0 left-0 w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/15 text-primary border border-primary/25 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5 ml-1 text-secondary" />
                مجتمع المعرفة العربي
              </Badge>
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mb-2 font-heading text-foreground">
              ابدأ بسؤال،{" "}
              <span className="text-primary">انهِ بمعرفة</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md">
              اطرح أسئلتك واحصل على إجابات من خبراء المجتمع العربي. شارك خبرتك وساعد الآخرين.
            </p>
            {/* Platform stats */}
            <div className="flex flex-wrap gap-3 sm:gap-5 mt-3 sm:mt-4">
              {PLATFORM_STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-bold text-foreground font-numbers">{s.value}</span>
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Buttons — stack on mobile, row on sm+ */}
          <div className="flex flex-col xs:flex-row sm:flex-col gap-2 sm:shrink-0">
            <Button
              className="rounded-xl h-11 px-5 bg-primary border-0 shadow-primary shadow-md text-sm font-semibold text-white hover:bg-primary/90 transition-all ripple"
              onClick={() => navigate("/questions/new")}
            >
              <PenSquare className="h-4 w-4 ml-2" />
              اطرح سؤالاً
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-11 px-5 border-border/50 text-foreground hover:bg-muted/30 text-sm"
              onClick={() => navigate("/search")}
            >
              استعرض الأسئلة
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Trending Tags Strip ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 overflow-x-auto pb-1 scrollbar-none">
        <Hash className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground shrink-0" />
        {TRENDING_TAGS.map((tag, i) => (
          <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}>
            <Badge
              variant="outline"
              className="shrink-0 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs cursor-pointer border-border/80 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all tag-pill whitespace-nowrap"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {tag}
            </Badge>
          </Link>
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
                  {...q}
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

          {/* Hot Today */}
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
              {hotToday.map((q, i) => (
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
                    {q.votes}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                      {q.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-numbers">
                      {q.answers} إجابة
                    </p>
                  </div>
                </button>
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
              {FEATURED_EXPERTS.slice(0, 3).map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          </Card>
 
          {/* Top Contributors */}
          <Card className="p-4 premium-gold-card overflow-hidden relative" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-secondary/5 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-secondary/15 border border-secondary/30 animate-pulse-gold">
                <Trophy className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="font-semibold text-sm">أنشط المساهمين</h3>
            </div>
            <div className="space-y-2">
              {topContributors.map((user, i) => (
                <Link
                  key={user.name}
                  to={`/profile/${user.name}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 border border-transparent hover:border-border/30 transition-all duration-300"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-8 w-8 border border-border/40">
                      <AvatarImage src="" />
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
                    <span>{user.streak}</span>
                  </div>
                </Link>
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
