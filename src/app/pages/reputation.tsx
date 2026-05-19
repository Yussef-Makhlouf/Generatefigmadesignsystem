import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAppState } from "../context/AppStateContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Zap,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  BookMarked,
  ArrowUp,
  ArrowDown,
  Star,
} from "lucide-react";

const weeklyData = [
  { day: "السبت", points: 850 },
  { day: "الأحد", points: 920 },
  { day: "الاثنين", points: 1050 },
  { day: "الثلاثاء", points: 980 },
  { day: "الأربعاء", points: 1100 },
  { day: "الخميس", points: 1180 },
  { day: "الجمعة", points: 1250 },
];

const monthlyData = [
  { week: "الأسبوع 1", earned: 120, lost: 10 },
  { week: "الأسبوع 2", earned: 95, lost: 5 },
  { week: "الأسبوع 3", earned: 180, lost: 15 },
  { week: "الأسبوع 4", earned: 145, lost: 8 },
];

const yearlyData = [
  { month: "يناير", points: 320 },
  { month: "فبراير", points: 450 },
  { month: "مارس", points: 580 },
  { month: "أبريل", points: 620 },
  { month: "مايو", points: 750 },
  { month: "يونيو", points: 890 },
  { month: "يوليو", points: 950 },
  { month: "أغسطس", points: 1050 },
  { month: "سبتمبر", points: 1100 },
  { month: "أكتوبر", points: 1150 },
  { month: "نوفمبر", points: 1200 },
  { month: "ديسمبر", points: 1250 },
];

const recentEvents = [
  {
    id: "1",
    type: "answer_accepted",
    icon: CheckCircle2,
    color: "text-success bg-success-light border border-success/10",
    title: "تم قبول إجابتك",
    description: 'على سؤال "كيف أتعلم البرمجة؟"',
    points: +25,
    timestamp: "منذ ساعة",
  },
  {
    id: "2",
    type: "upvote_received",
    icon: ThumbsUp,
    color: "text-primary bg-primary-light border border-primary/10",
    title: "تصويت إيجابي على إجابتك",
    description: 'على سؤال "ما هي أفضل IDE؟"',
    points: +10,
    timestamp: "منذ 3 ساعات",
  },
  {
    id: "3",
    type: "question_asked",
    icon: MessageSquare,
    color: "text-secondary bg-secondary-light border border-secondary/10",
    title: "طرحت سؤالاً",
    description: '"كيف أتعلم React؟"',
    points: +5,
    timestamp: "منذ 5 ساعات",
  },
  {
    id: "4",
    type: "downvote_received",
    icon: TrendingDown,
    color: "text-destructive bg-destructive/10 border border-destructive/10",
    title: "تصويت سلبي على إجابتك",
    description: 'على سؤال "ما هو الفرق بين...؟"',
    points: -2,
    timestamp: "منذ يوم",
  },
  {
    id: "5",
    type: "answer_accepted",
    icon: CheckCircle2,
    color: "text-success bg-success-light border border-success/10",
    title: "تم قبول إجابتك",
    description: 'على سؤال "كيف أنشئ API REST؟"',
    points: +25,
    timestamp: "منذ يوم",
  },
  {
    id: "6",
    type: "upvote_received",
    icon: ThumbsUp,
    color: "text-primary bg-primary-light border border-primary/10",
    title: "تصويت إيجابي على سؤالك",
    description: 'على سؤال "ما أفضل لغة للمبتدئين؟"',
    points: +10,
    timestamp: "منذ يومين",
  },
  {
    id: "7",
    type: "bookmark_received",
    icon: BookMarked,
    color: "text-accent-foreground bg-accent/20 border border-accent/30",
    title: "حُفظ سؤالك من قبل مستخدم",
    description: '"كيف أتعلم البرمجة من الصفر؟"',
    points: +2,
    timestamp: "منذ يومين",
  },
];

const REPUTATION_LEVELS = [
  { name: "مبتدئ", min: 0, max: 100, color: "bg-muted-foreground/30 text-muted-foreground" },
  { name: "عضو", min: 100, max: 500, color: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  { name: "مساهم", min: 500, max: 1000, color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  { name: "خبير", min: 1000, max: 2500, color: "bg-teal-500/20 text-teal-400 border border-teal-500/30" },
  { name: "محترف", min: 2500, max: 5000, color: "bg-secondary/20 text-secondary border border-secondary/30" },
  { name: "مشرف", min: 5000, max: Infinity, color: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="premium-glass-card border-strong/40 rounded-xl px-4 py-2.5 shadow-xl text-sm animate-scale-in">
        <p className="text-text-muted mb-1 text-xs font-heading">{label}</p>
        <p className="font-bold text-primary numeral">{payload[0].value.toLocaleString("ar-SA")} نقطة</p>
      </div>
    );
  }
  return null;
};

export function ReputationPage() {
  const navigate = useNavigate();
  const { currentUser, questions, answers } = useAppState();
  const [chartRange, setChartRange] = useState<"week" | "month" | "year">("week");

  const currentPoints = currentUser.reputation;
  const currentLevel = REPUTATION_LEVELS.find(
    (l) => currentPoints >= l.min && currentPoints < l.max
  ) || REPUTATION_LEVELS[0];
  const nextLevel = REPUTATION_LEVELS[REPUTATION_LEVELS.indexOf(currentLevel) + 1];
  const progressToNext = nextLevel
    ? ((currentPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  const chartData =
    chartRange === "week"
      ? weeklyData
      : chartRange === "month"
      ? yearlyData.slice(0, 8)
      : yearlyData;

  const xKey =
    chartRange === "week" ? "day" : chartRange === "month" ? "week" : "month";

  const userQuestionsCount = questions.filter(q => q.author.name === currentUser.name).length;
  const userAnswersCount = answers.filter(a => a.author.name === currentUser.name).length;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Dynamic Background Mesh & Ambient Glow */}
      <div className="absolute inset-0 arabic-geometric-mesh-fine pointer-events-none opacity-40 z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-15%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[150px] pointer-events-none z-0" />

      <div className="container relative mx-auto px-4 py-8 max-w-5xl animate-fade-in pb-24 md:pb-8 z-10">
        {/* Back */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl px-4 touch-target"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          رجوع
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2 font-heading tracking-tight">
            <div className="p-2 rounded-xl bg-primary-light border border-primary/20 text-primary animate-pulse-ring shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <span>سجل السمعة والأثر</span>
          </h1>
          <p className="text-text-secondary text-sm">تتبع تقدمك المعرفي ومساهماتك العلمية في مجتمع خبير</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "إجمالي النقاط",
              value: currentPoints.toLocaleString("ar-SA"),
              rawVal: currentPoints,
              icon: Star,
              color: "text-secondary",
              bg: "bg-secondary-light border-secondary/20",
              trend: "+٨٥ هذا الأسبوع",
              trendUp: true,
            },
            {
              label: "مكتسب هذا الشهر",
              value: (userAnswersCount * 25 + userQuestionsCount * 5).toLocaleString("ar-SA"),
              rawVal: userAnswersCount * 25 + userQuestionsCount * 5,
              icon: TrendingUp,
              color: "text-primary",
              bg: "bg-primary-light border-primary/20",
              trend: "+١٢٪ مقارنة بالشهر الماضي",
              trendUp: true,
            },
            {
              label: "الأسئلة المطروحة",
              value: userQuestionsCount.toLocaleString("ar-SA"),
              rawVal: userQuestionsCount,
              icon: MessageSquare,
              color: "text-secondary",
              bg: "bg-secondary-light border-secondary/20",
              trend: "+٢ هذا الأسبوع",
              trendUp: true,
            },
            {
              label: "الإجابات المعتمدة",
              value: userAnswersCount.toLocaleString("ar-SA"),
              rawVal: userAnswersCount,
              icon: CheckCircle2,
              color: "text-primary",
              bg: "bg-primary-light border-primary/20",
              trend: "+١ هذا الأسبوع",
              trendUp: true,
            },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.label}
                className="premium-glass-card border-strong/30 p-5 rounded-2xl flex flex-col justify-between hover:scale-[1.03] transition-all duration-300 stagger"
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <div>
                  <div className={`inline-flex p-2.5 rounded-xl mb-4 border ${s.bg}`}>
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className={`text-3xl font-extrabold mb-1 numeral ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-xs font-semibold text-text-secondary mb-3">{s.label}</div>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-bold ${
                    s.trendUp ? "text-success" : "text-destructive"
                  }`}
                >
                  {s.trendUp ? (
                    <ArrowUp className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{s.trend}</span>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Chart & Events */}
          <div className="md:col-span-2 space-y-6">
            {/* Chart */}
            <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold font-heading">نمو السمعة</h2>
                  <p className="text-xs text-text-muted">التمثيل البياني لزيادة النقاط وتراكم الأثر</p>
                </div>
                <div className="flex gap-1 bg-muted/60 dark:bg-muted/30 border border-strong/20 rounded-xl p-1">
                  {(["week", "month", "year"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 touch-target ${
                        chartRange === r
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-text-secondary hover:text-foreground"
                      }`}
                    >
                      {r === "week" ? "أسبوع" : r === "month" ? "شهر" : "سنة"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full overflow-hidden" style={{ direction: "ltr" }}>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                    <defs>
                      <linearGradient id="repGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                    <XAxis
                      dataKey={xKey}
                      tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Cairo", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Outfit", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      width={45}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="points"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fill="url(#repGradient)"
                      dot={{ fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "var(--secondary)", stroke: "var(--background)", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Monthly Breakdown */}
            <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
              <div className="mb-5">
                <h2 className="text-lg font-bold font-heading">توزيع النقاط الشهرية</h2>
                <p className="text-xs text-text-muted">مقارنة بين إجمالي النقاط المكتسبة والمفقودة</p>
              </div>
              <div className="w-full overflow-hidden" style={{ direction: "ltr" }}>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Cairo", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "Outfit", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip />
                    <Bar dataKey="earned" name="مكتسب" fill="var(--primary)" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="lost" name="مفقود" fill="var(--destructive)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <div className="w-3.5 h-3.5 rounded-md bg-primary shadow-sm" />
                  مكتسب
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <div className="w-3.5 h-3.5 rounded-md bg-destructive shadow-sm" />
                  مفقود
                </div>
              </div>
            </Card>

            {/* Recent Events */}
            <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
              <div className="mb-5">
                <h2 className="text-lg font-bold font-heading">سجل الأحداث الأخيرة</h2>
                <p className="text-xs text-text-muted">العمليات والتصويتات الأخيرة المؤثرة على سمعتك</p>
              </div>
              <div className="space-y-4">
                {recentEvents.map((event) => {
                  const Icon = event.icon;
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-primary/[0.02] border border-transparent hover:border-strong/10 transition-all duration-300"
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${event.color}`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{event.title}</p>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                          {event.description}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5 numeral">{event.timestamp}</p>
                      </div>
                      <Badge
                        className={`shrink-0 text-xs font-bold rounded-lg border px-2.5 py-1 ${
                          event.points > 0
                            ? "bg-success-light text-success border-success/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        <span className="numeral">
                          {event.points > 0 ? "+" : ""}
                          {event.points.toLocaleString("ar-SA")}
                        </span>
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Levels Sidebar */}
          <aside className="space-y-6">
            {/* Current Level */}
            <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-secondary" />
              <h3 className="font-bold text-sm text-text-secondary mb-5 flex items-center gap-2 font-heading">
                <Zap className="h-4 w-4 text-primary" />
                مستواك الحالي
              </h3>
              <div className="text-center mb-6">
                <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-extrabold mb-3 shadow-sm ${currentLevel.color}`}>
                  {currentLevel.name}
                </div>
                <p className="text-4xl font-extrabold text-primary mb-1 numeral tracking-tight">
                  {currentPoints.toLocaleString("ar-SA")}
                </p>
                <p className="text-xs text-text-muted font-medium">نقطة سمعة تراكمية</p>
              </div>

              {nextLevel && (
                <div className="border-t border-strong/20 pt-4">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-text-secondary">التالي: {nextLevel.name}</span>
                    <span className="text-primary numeral">
                      {(nextLevel.min - currentPoints).toLocaleString("ar-SA")} نقطة متبقية
                    </span>
                  </div>
                  <div className="h-2.5 bg-muted/60 dark:bg-muted/30 border border-strong/10 rounded-full overflow-hidden p-[2px]">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 animate-pulse-gold"
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted text-center mt-2 font-bold numeral">
                    مكتمل بنسبة {Math.round(progressToNext).toLocaleString("ar-SA")}%
                  </p>
                </div>
              )}
            </Card>

            {/* All Levels */}
            <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
              <h3 className="font-bold text-sm text-text-secondary mb-4 font-heading">مستويات السمعة</h3>
              <div className="space-y-3">
                {REPUTATION_LEVELS.map((level, i) => {
                  const isReached = currentPoints >= level.min;
                  const isCurrent =
                    currentPoints >= level.min &&
                    (i === REPUTATION_LEVELS.length - 1 || currentPoints < REPUTATION_LEVELS[i + 1].min);
                  return (
                    <div
                      key={level.name}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 border ${
                        isCurrent
                          ? "bg-primary/[0.04] border-primary/30 shadow-sm"
                          : "border-transparent"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          isReached ? "bg-primary animate-pulse-ring" : "bg-muted-foreground/30"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-bold ${
                            isReached ? "text-foreground" : "text-text-muted"
                          }`}
                        >
                          {level.name}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5 numeral font-semibold">
                          {level.max === Infinity
                            ? `${level.min.toLocaleString("ar-SA")}+`
                            : `${level.min.toLocaleString("ar-SA")} – ${level.max.toLocaleString("ar-SA")}`}
                        </p>
                      </div>
                      {isCurrent && (
                        <Badge variant="outline" className="text-[10px] font-bold border-primary/50 text-primary bg-primary-light">
                          أنت هنا
                        </Badge>
                      )}
                      {isReached && !isCurrent && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Earning Guide */}
            <Card className="premium-glass-card border-strong/30 p-6 rounded-2xl">
              <h3 className="font-bold text-sm text-text-secondary mb-4 font-heading">كيف تكسب نقاطاً؟</h3>
              <div className="space-y-3 text-xs font-semibold">
                {[
                  { action: "إجابة مقبولة ومعتمدة", points: "+٢٥" },
                  { action: "تصويت إيجابي على إجابتك", points: "+١٠" },
                  { action: "تصويت إيجابي على سؤالك", points: "+٥" },
                  { action: "طرح سؤال جديد مميز", points: "+٥" },
                  { action: "تصويت سلبي على إجابة", points: "-٢" },
                ].map((item) => (
                  <div
                    key={item.action}
                    className="flex items-center justify-between py-1.5 border-b border-strong/10 last:border-0"
                  >
                    <span className="text-text-secondary">{item.action}</span>
                    <span
                      className={`font-extrabold numeral text-sm ${
                        item.points.startsWith("+") ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
