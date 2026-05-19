import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { QuestionCard } from "../components/question-card";
import {
  ArrowRight,
  Tag,
  Users,
  MessageSquare,
  TrendingUp,
  Star,
  Hash,
  BookOpen,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

const TAG_DATA: Record<string, {
  description: string;
  color: string;
  bgColor: string;
  questionsCount: number;
  followersCount: number;
  weeklyActivity: number;
  relatedTags: string[];
  topContributors: { name: string; answers: number; reputation: number }[];
}> = {
  "برمجة": {
    description: "كل ما يتعلق بالبرمجة وتطوير البرمجيات، من اللغات والأطر إلى أفضل الممارسات العالمية والمحلية.",
    color: "text-primary",
    bgColor: "bg-primary-light border-primary/20",
    questionsCount: 1247,
    followersCount: 4520,
    weeklyActivity: 89,
    relatedTags: ["تقنية", "تطوير ويب", "Python", "JavaScript", "مبتدئين"],
    topContributors: [
      { name: "سارة علي", answers: 142, reputation: 2840 },
      { name: "عمر يوسف", answers: 98, reputation: 1650 },
      { name: "فاطمة حسن", answers: 76, reputation: 1320 },
    ],
  },
  "تقنية": {
    description: "أسئلة ونقاشات حول التكنولوجيا والأجهزة والأنظمة الحديثة وتأثيرها على المجتمعات.",
    color: "text-secondary",
    bgColor: "bg-secondary-light border-secondary/20",
    questionsCount: 956,
    followersCount: 3200,
    weeklyActivity: 67,
    relatedTags: ["برمجة", "ذكاء اصطناعي", "أجهزة", "شبكات"],
    topContributors: [
      { name: "أحمد محمد", answers: 87, reputation: 1250 },
      { name: "خالد عبدالله", answers: 54, reputation: 950 },
    ],
  },
  "تصميم": {
    description: "تصميم الجرافيك وتجربة المستخدم وواجهات التطبيقات والمنتجات الرقمية وتطبيقات الفن البصري.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100/50 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/20",
    questionsCount: 534,
    followersCount: 1850,
    weeklyActivity: 41,
    relatedTags: ["UI", "UX", "Figma", "تطوير ويب"],
    topContributors: [
      { name: "ريم الزهراني", answers: 63, reputation: 1100 },
      { name: "نور سالم", answers: 45, reputation: 890 },
    ],
  },
  "تعليم": {
    description: "مصادر تعليمية ونصائح وإرشادات للتعلم الذاتي والتطوير المهني والأكاديمي المستمر.",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/20",
    questionsCount: 723,
    followersCount: 2800,
    weeklyActivity: 58,
    relatedTags: ["برمجة", "لغات", "شهادات", "مبتدئين"],
    topContributors: [
      { name: "محمد الأحمد", answers: 112, reputation: 1980 },
      { name: "أسماء قاسم", answers: 78, reputation: 1340 },
    ],
  },
  "ذكاء اصطناعي": {
    description: "الذكاء الاصطناعي، تعلم الآلة، علوم البيانات، والشبكات العصبية العميقة وتطبيقاتها المستقبلية.",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100/50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-800/20",
    questionsCount: 689,
    followersCount: 5100,
    weeklyActivity: 112,
    relatedTags: ["برمجة", "Python", "تقنية", "بيانات"],
    topContributors: [
      { name: "يوسف العمري", answers: 134, reputation: 3200 },
      { name: "سارة علي", answers: 89, reputation: 2840 },
    ],
  },
};

const DEFAULT_TAG = {
  description: "أسئلة ومناقشات في هذا الموضوع الشيق.",
  color: "text-primary",
  bgColor: "bg-primary-light border-primary/20",
  questionsCount: 124,
  followersCount: 320,
  weeklyActivity: 18,
  relatedTags: ["تقنية", "برمجة", "تعليم"],
  topContributors: [
    { name: "أحمد محمد", answers: 22, reputation: 1250 },
    { name: "سارة علي", answers: 15, reputation: 2840 },
  ],
};

const mockTagQuestions = [
  {
    id: "1",
    title: "كيف يمكنني تعلم البرمجة من الصفر؟",
    description: "أنا مهتم بتعلم البرمجة ولكن لا أعرف من أين أبدأ. ما هي أفضل الموارد والمسارات للمبتدئين؟",
    author: { name: "أحمد محمد", avatar: "", reputation: 450 },
    votes: 42,
    answers: 15,
    tags: ["برمجة", "تعليم", "مبتدئين"],
    timestamp: "منذ ساعتين",
  },
  {
    id: "2",
    title: "ما هي أفضل الممارسات في تطوير تطبيقات الويب الحديثة؟",
    description: "أبحث عن نصائح وإرشادات حول أفضل الممارسات في تطوير تطبيقات الويب باستخدام التقنيات الحديثة.",
    author: { name: "سارة علي", avatar: "", reputation: 1250 },
    votes: 38,
    answers: 12,
    tags: ["تطوير ويب", "React", "تقنية"],
    timestamp: "منذ 3 ساعات",
  },
  {
    id: "3",
    title: "كيف أتعامل مع إدارة الحالة في React؟",
    description: "أواجه صعوبة في فهم متى أستخدم useState مقابل useContext مقابل Redux في تطبيقي.",
    author: { name: "خالد عبدالله", avatar: "", reputation: 320 },
    votes: 21,
    answers: 8,
    tags: ["React", "JavaScript", "برمجة"],
    timestamp: "منذ 5 ساعات",
  },
  {
    id: "4",
    title: "ما الفرق بين REST API و GraphQL؟",
    description: "أريد أن أفهم متى أختار REST وإمتى أختار GraphQL في مشاريعي.",
    author: { name: "عمر يوسف", avatar: "", reputation: 780 },
    votes: 17,
    answers: 6,
    tags: ["برمجة", "API", "تطوير ويب"],
    timestamp: "منذ يوم",
  },
];

export function TagDetailPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recent");
  const [isFollowing, setIsFollowing] = useState(false);

  const tagName = decodeURIComponent(tag || "");
  const tagInfo = TAG_DATA[tagName] || DEFAULT_TAG;

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? `إلغاء متابعة #${tagName}` : `تتابع الآن #${tagName}`);
  };

  return (
    <div className="max-w-5xl w-full mx-auto animate-fade-in pb-4 relative">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4 hover:bg-primary/5 text-muted-foreground hover:text-foreground rounded-xl gap-2 transition-all duration-300"
        onClick={() => navigate(-1)}
      >
        <ArrowRight className="h-4 w-4 ml-1 flip-rtl" />
        الرجوع للخلف
      </Button>

      <div className="grid md:grid-cols-3 gap-6 relative z-10">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Tag Header */}
          <Card className="p-6 premium-glass-card relative overflow-hidden animate-fade-in-up">
            {/* Fine Arabesque mesh overlay */}
            <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-[0.04] pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl border ${tagInfo.bgColor} shadow-sm backdrop-blur-sm`}>
                  <Hash className={`h-6 w-6 ${tagInfo.color}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold mb-2 tracking-tight">#{tagName}</h1>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
                    {tagInfo.description}
                  </p>
                </div>
              </div>
              <Button
                variant={isFollowing ? "outline" : "default"}
                className={`rounded-xl shrink-0 transition-all duration-300 shadow-sm ${
                  isFollowing 
                    ? "border-primary/30 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30" 
                    : "gradient-primary border-0 text-white hover:opacity-90"
                }`}
                onClick={handleFollow}
              >
                {isFollowing ? (
                  <>
                    <Star className="h-4 w-4 ml-2 fill-primary text-primary" />
                    متابَع
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 ml-2" />
                    متابعة الوسم
                  </>
                )}
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
              <div className="glass border border-border/50 rounded-xl p-3 text-center group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <MessageSquare className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-lg font-bold text-primary numeral">
                    {tagInfo.questionsCount.toLocaleString("ar-SA")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">سؤال</p>
              </div>
              <div className="glass border border-border/50 rounded-xl p-3 text-center group hover:border-secondary/30 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="text-lg font-bold text-secondary numeral">
                    {tagInfo.followersCount.toLocaleString("ar-SA")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">متابع</p>
              </div>
              <div className="glass border border-border/50 rounded-xl p-3 text-center group hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-lg font-bold text-emerald-500 numeral">
                    {tagInfo.weeklyActivity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">نشاط أسبوعي</p>
              </div>
            </div>
          </Card>

          {/* Questions Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-card/45 backdrop-blur-md border border-border/80 rounded-xl mb-4 p-1">
              <TabsTrigger value="recent" className="rounded-lg transition-all duration-200">الأحدث</TabsTrigger>
              <TabsTrigger value="popular" className="rounded-lg transition-all duration-200">الأكثر تصويتاً</TabsTrigger>
              <TabsTrigger value="unanswered" className="rounded-lg transition-all duration-200">بدون إجابة</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4 animate-fade-in">
              {mockTagQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  {...q}
                  onClick={() => navigate(`/questions/${q.id}`)}
                />
              ))}
            </TabsContent>

            <TabsContent value="popular" className="space-y-4 animate-fade-in">
              {[...mockTagQuestions].sort((a, b) => b.votes - a.votes).map((q) => (
                <QuestionCard
                  key={q.id}
                  {...q}
                  onClick={() => navigate(`/questions/${q.id}`)}
                />
              ))}
            </TabsContent>

            <TabsContent value="unanswered" className="space-y-4 animate-fade-in">
              {mockTagQuestions.filter((q) => q.answers < 3).map((q) => (
                <QuestionCard
                  key={q.id}
                  {...q}
                  onClick={() => navigate(`/questions/${q.id}`)}
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Related Tags */}
          <Card className="p-4 premium-glass-card relative overflow-hidden">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-ring" />
              <Tag className="h-4 w-4 text-primary" />
              وسوم مشابهة
            </h3>
            <div className="flex flex-wrap gap-2">
              {tagInfo.relatedTags.map((t) => (
                <Link key={t} to={`/tags/${encodeURIComponent(t)}`}>
                  <Badge
                    variant="secondary"
                    className="tag-pill rounded-xl px-3 py-1 cursor-pointer bg-muted/40 hover:bg-primary border border-border/40 hover:border-primary transition-all duration-300"
                  >
                    #{t}
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>

          {/* Top Contributors */}
          <Card className="p-4 premium-glass-card relative overflow-hidden">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse-gold" />
              <BookOpen className="h-4 w-4 text-secondary" />
              أبرز المساهمين
            </h3>
            <div className="space-y-3">
              {tagInfo.topContributors.map((contributor, i) => (
                <Link
                  key={contributor.name}
                  to={`/profile/${contributor.name}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all duration-300 group"
                >
                  <span className="text-xs text-muted-foreground w-4 shrink-0 font-bold numeral">
                    {i + 1}
                  </span>
                  <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border group-hover:ring-primary/40 transition-all duration-300">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20 text-text-primary font-bold">
                      {contributor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{contributor.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {contributor.answers} إجابة
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-primary shrink-0 numeral">
                    {contributor.reputation.toLocaleString("ar-SA")}
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Ask Question CTA */}
          <Card className="p-5 premium-glass-card relative overflow-hidden border-primary/20 group">
            {/* Ambient hover glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50 pointer-events-none" />
            <div className="absolute inset-0 gold-shimmer-effect opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500" />
            
            <p className="text-sm font-semibold mb-1 text-foreground relative z-10">لديك سؤال في #{tagName}؟</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed relative z-10">
              اطرح سؤالك وسيجيبك الخبراء المتخصصين في أسرع وقت.
            </p>
            <Button
              className="w-full rounded-xl gradient-primary text-white border-0 relative z-10 hover:shadow-primary shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              onClick={() => navigate(`/questions/new?tag=${encodeURIComponent(tagName)}`)}
            >
              اطرح سؤالاً الآن
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
