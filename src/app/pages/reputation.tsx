import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
  Cell,
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
    color: "text-green-600 bg-green-100",
    title: "تم قبول إجابتك",
    description: 'على سؤال "كيف أتعلم البرمجة؟"',
    points: +25,
    timestamp: "منذ ساعة",
  },
  {
    id: "2",
    type: "upvote_received",
    icon: ThumbsUp,
    color: "text-blue-600 bg-blue-100",
    title: "تصويت إيجابي على إجابتك",
    description: 'على سؤال "ما هي أفضل IDE؟"',
    points: +10,
    timestamp: "منذ 3 ساعات",
  },
  {
    id: "3",
    type: "question_asked",
    icon: MessageSquare,
    color: "text-primary bg-primary/10",
    title: "طرحت سؤالاً",
    description: '"كيف أتعلم React؟"',
    points: +5,
    timestamp: "منذ 5 ساعات",
  },
  {
    id: "4",
    type: "downvote_received",
    icon: TrendingDown,
    color: "text-red-600 bg-red-100",
    title: "تصويت سلبي على إجابتك",
    description: 'على سؤال "ما هو الفرق بين...؟"',
    points: -2,
    timestamp: "منذ يوم",
  },
  {
    id: "5",
    type: "answer_accepted",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-100",
    title: "تم قبول إجابتك",
    description: 'على سؤال "كيف أنشئ API REST؟"',
    points: +25,
    timestamp: "منذ يوم",
  },
  {
    id: "6",
    type: "upvote_received",
    icon: ThumbsUp,
    color: "text-blue-600 bg-blue-100",
    title: "تصويت إيجابي على سؤالك",
    description: 'على سؤال "ما أفضل لغة للمبتدئين؟"',
    points: +10,
    timestamp: "منذ يومين",
  },
  {
    id: "7",
    type: "bookmark_received",
    icon: BookMarked,
    color: "text-purple-600 bg-purple-100",
    title: "حُفظ سؤالك من قبل مستخدم",
    description: '"كيف أتعلم البرمجة من الصفر؟"',
    points: +2,
    timestamp: "منذ يومين",
  },
];

const REPUTATION_LEVELS = [
  { name: "مبتدئ", min: 0, max: 100, color: "bg-gray-400" },
  { name: "عضو", min: 100, max: 500, color: "bg-blue-400" },
  { name: "مساهم", min: 500, max: 1000, color: "bg-green-500" },
  { name: "خبير", min: 1000, max: 2500, color: "bg-primary" },
  { name: "محترف", min: 2500, max: 5000, color: "bg-secondary" },
  { name: "مشرف", min: 5000, max: Infinity, color: "bg-amber-500" },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="text-muted-foreground mb-1">{label}</p>
        <p className="font-bold text-primary">{payload[0].value.toLocaleString("ar-SA")} نقطة</p>
      </div>
    );
  }
  return null;
};

export function ReputationPage() {
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<"week" | "month" | "year">("week");

  const currentPoints = 1250;
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl animate-fade-in pb-24 md:pb-8">
      {/* Back */}
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowRight className="h-4 w-4 ml-2" />
        رجوع
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Zap className="h-6 w-6 text-primary" />
          سجل السمعة
        </h1>
        <p className="text-muted-foreground text-sm">تتبع تقدمك ومساهماتك في المنصة</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "إجمالي النقاط",
            value: currentPoints.toLocaleString("ar-SA"),
            icon: Star,
            color: "text-primary",
            bg: "bg-primary/10",
            trend: "+85 هذا الأسبوع",
            trendUp: true,
          },
          {
            label: "مكتسب هذا الشهر",
            value: "540",
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-100",
            trend: "+12% مقارنة بالشهر الماضي",
            trendUp: true,
          },
          {
            label: "الأسئلة",
            value: "12",
            icon: MessageSquare,
            color: "text-secondary",
            bg: "bg-secondary/10",
            trend: "+2 هذا الأسبوع",
            trendUp: true,
          },
          {
            label: "الإجابات المقبولة",
            value: "8",
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-100",
            trend: "+1 هذا الأسبوع",
            trendUp: true,
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className={`inline-flex p-2 rounded-lg mb-3 ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold mb-0.5 ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mb-2">{s.label}</div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  s.trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {s.trendUp ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {s.trend}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Chart & Events */}
        <div className="md:col-span-2 space-y-6">
          {/* Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-semibold">نمو السمعة</h2>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {(["week", "month", "year"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      chartRange === r
                        ? "bg-card shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r === "week" ? "أسبوع" : r === "month" ? "شهر" : "سنة"}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="repGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #2563EB)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary, #2563EB)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey={xKey}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#repGradient)"
                  dot={{ fill: "#2563EB", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Breakdown */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">توزيع النقاط الشهرية</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip />
                <Bar dataKey="earned" name="مكتسب" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" name="مفقود" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded bg-secondary" />
                مكتسب
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded bg-destructive" />
                مفقود
              </div>
            </div>
          </Card>

          {/* Recent Events */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4">سجل الأحداث</h2>
            <div className="space-y-4">
              {recentEvents.map((event) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${event.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {event.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                    </div>
                    <Badge
                      variant={event.points > 0 ? "default" : "destructive"}
                      className={`shrink-0 ${
                        event.points > 0
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {event.points > 0 ? "+" : ""}
                      {event.points}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Levels Sidebar */}
        <aside className="space-y-4">
          {/* Current Level */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              مستواك الحالي
            </h3>
            <div className="text-center mb-4">
              <div className={`inline-flex px-4 py-2 rounded-full text-white font-bold mb-2 ${currentLevel.color}`}>
                {currentLevel.name}
              </div>
              <p className="text-3xl font-bold text-primary">
                {currentPoints.toLocaleString("ar-SA")}
              </p>
              <p className="text-xs text-muted-foreground">نقطة سمعة</p>
            </div>

            {nextLevel && (
              <>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>التالي: {nextLevel.name}</span>
                  <span>{nextLevel.min - currentPoints} نقطة متبقية</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {Math.round(progressToNext)}%
                </p>
              </>
            )}
          </Card>

          {/* All Levels */}
          <Card className="p-5">
            <h3 className="font-semibold mb-4">مستويات السمعة</h3>
            <div className="space-y-2">
              {REPUTATION_LEVELS.map((level, i) => {
                const isReached = currentPoints >= level.min;
                const isCurrent =
                  currentPoints >= level.min &&
                  (i === REPUTATION_LEVELS.length - 1 || currentPoints < REPUTATION_LEVELS[i + 1].min);
                return (
                  <div
                    key={level.name}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      isCurrent ? "bg-primary/5 border border-primary/20" : ""
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isReached ? level.color : "bg-muted"
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isReached ? "" : "text-muted-foreground"
                        }`}
                      >
                        {level.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {level.max === Infinity
                          ? `${level.min.toLocaleString("ar-SA")}+`
                          : `${level.min.toLocaleString("ar-SA")} – ${level.max.toLocaleString("ar-SA")}`}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs border-primary text-primary">
                        أنت هنا
                      </Badge>
                    )}
                    {isReached && !isCurrent && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Earning Guide */}
          <Card className="p-5">
            <h3 className="font-semibold mb-3">كيف تكسب نقاطاً؟</h3>
            <div className="space-y-2 text-sm">
              {[
                { action: "إجابة مقبولة", points: "+25" },
                { action: "تصويت إيجابي على إجابة", points: "+10" },
                { action: "تصويت إيجابي على سؤال", points: "+5" },
                { action: "طرح سؤال", points: "+5" },
                { action: "تصويت سلبي على إجابة", points: "-2" },
              ].map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground">{item.action}</span>
                  <span
                    className={`font-bold ${
                      item.points.startsWith("+") ? "text-green-600" : "text-red-500"
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
  );
}
