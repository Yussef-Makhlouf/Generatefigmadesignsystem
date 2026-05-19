import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ReputationBadge } from "../components/reputation-badge";
import { QuestionCard } from "../components/question-card";
import { Settings, UserPlus, Flame, MapPin, Calendar, Star, Zap, Award, CheckCircle2, Trophy, Target, Gem } from "lucide-react";

const BADGES = [
  { icon: Trophy, label: "متصدر", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { icon: Zap, label: "مجيب سريع", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { icon: Target, label: "دقيق", color: "bg-green-100 text-green-700 border-green-200" },
  { icon: Flame, label: "سلسلة ٧", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { icon: Gem, label: "خبير موثق", color: "bg-purple-100 text-purple-700 border-purple-200" },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("questions");
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = username === "me";
  const user = {
    name: isOwnProfile ? "محمد الأحمد" : "أحمد محمد",
    username: username || "me",
    avatar: "",
    reputation: 1250,
    bio: "مطور برمجيات مهتم بالتقنية والتعليم. أحب مشاركة المعرفة ومساعدة المبتدئين.",
    location: "الرياض، السعودية",
    joined: "يناير ٢٠٢٥",
    streak: 7,
    level: "خبير",
    levelProgress: 72,
    stats: {
      questions: 12,
      answers: 48,
      upvotes: 156,
      followers: 23,
    },
  };

  const myQuestions = [
    {
      id: "1",
      title: "كيف يمكنني تعلم البرمجة من الصفر؟",
      description: "أنا مهتم بتعلم البرمجة ولكن لا أعرف من أين أبدأ.",
      author: { name: user.name, avatar: user.avatar, reputation: user.reputation },
      votes: 42,
      answers: 15,
      tags: ["برمجة", "تعليم", "مبتدئين"],
      timestamp: "منذ يومين",
    },
    {
      id: "2",
      title: "ما هي أفضل الممارسات في React؟",
      description: "أبحث عن نصائح لتحسين كود React الخاص بي.",
      author: { name: user.name, avatar: user.avatar, reputation: user.reputation },
      votes: 28,
      answers: 9,
      tags: ["React", "JavaScript", "تطوير ويب"],
      timestamp: "منذ أسبوع",
    },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl animate-fade-in pb-20 sm:pb-8">
      {/* Profile Header */}
      <Card className="overflow-hidden mb-4 sm:mb-6">
        {/* Cover */}
        <div className="h-24 sm:h-32 bg-gradient-to-l from-primary/30 via-secondary/20 to-primary/10 relative">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_left,_var(--primary)_0%,_transparent_60%)]" />
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3 sm:mb-4">
            <div className="relative">
              <Avatar className="h-16 w-16 sm:h-24 sm:w-24 ring-4 ring-card shadow-lg">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xl sm:text-3xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* Verified badge */}
              <div className="absolute bottom-0.5 sm:bottom-1 right-0.5 sm:right-1 bg-secondary rounded-full p-0.5">
                <CheckCircle2 className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
              </div>
            </div>

            <div className="flex gap-1.5 sm:gap-2 pb-1">
              {isOwnProfile ? (
                <Button variant="outline" className="rounded-xl h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm">
                  <Settings className="h-3.5 sm:h-4 w-3.5 sm:w-4 ml-1.5 sm:ml-2" />
                  <span className="hidden xs:inline">تعديل الملف</span>
                  <span className="xs:hidden">تعديل</span>
                </Button>
              ) : (
                <Button
                  className={`rounded-xl h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm ${isFollowing ? "variant-outline" : ""}`}
                  variant={isFollowing ? "outline" : "default"}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  <UserPlus className="h-3.5 sm:h-4 w-3.5 sm:w-4 ml-1.5 sm:ml-2" />
                  {isFollowing ? "متابَع" : "متابعة"}
                </Button>
              )}
            </div>
          </div>

          {/* Name & bio */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold">{user.name}</h1>
              <Badge variant="secondary" className="rounded-full text-[10px] sm:text-xs px-2 py-0.5">
                <Star className="h-2.5 sm:h-3 w-2.5 sm:w-3 ml-1 text-amber-500" />
                {user.level}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed">{user.bio}</p>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                <span className="hidden xs:inline">{user.location}</span>
                <span className="xs:hidden">الرياض</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                <span className="hidden sm:inline">انضم في {user.joined}</span>
                <span className="sm:hidden">{user.joined}</span>
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                <span>سلسلة {user.streak} أيام</span>
              </div>
            </div>
          </div>

          {/* Reputation & Level */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between mb-1">
              <ReputationBadge points={user.reputation} />
              {isOwnProfile && (
                <Link
                  to="/reputation"
                  className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  <span className="hidden xs:inline">سجل السمعة</span>
                </Link>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="h-2.5 sm:h-3 w-2.5 sm:w-3 text-primary" />
                  <span className="hidden xs:inline">المستوى التالي: محترف</span>
                  <span className="xs:hidden">التالي: محترف</span>
                </span>
                <span>{user.levelProgress}%</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{ width: `${user.levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-4 sm:mb-5">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Award className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              الشارات
            </p>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs border ${badge.color}`}
                >
                  <badge.icon className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                  <span className="hidden xs:inline">{badge.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: "أسئلة", value: user.stats.questions, color: "text-primary" },
              { label: "إجابات", value: user.stats.answers, color: "text-secondary" },
              { label: "تصويتات", value: user.stats.upvotes, color: "text-green-600" },
              { label: "متابعين", value: user.stats.followers, color: "text-foreground" },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted rounded-xl p-2 sm:p-3 text-center">
                <div className={`text-base sm:text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start bg-card border border-border mb-6">
          <TabsTrigger value="questions">أسئلتي</TabsTrigger>
          <TabsTrigger value="answers">إجاباتي</TabsTrigger>
          <TabsTrigger value="saved">المحفوظات</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          {myQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              {...question}
              onClick={() => navigate(`/questions/${question.id}`)}
            />
          ))}
        </TabsContent>

        <TabsContent value="answers" className="space-y-4">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">لم تقدم أي إجابات بعد</p>
            <Button className="mt-4 rounded-xl" onClick={() => navigate("/")}>
              استعرض الأسئلة
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">لا توجد أسئلة محفوظة</p>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">النشاط الأخير</h3>
            <div className="space-y-4">
              {[
                { dot: "bg-primary", text: 'صوّت على سؤال "كيف أتعلم البرمجة؟"', time: "منذ ساعة" },
                { dot: "bg-secondary", text: 'أجاب على سؤال "ما هي أفضل IDE؟"', time: "منذ 3 ساعات" },
                { dot: "bg-orange-500", text: "حصل على شارة سلسلة ٧ أيام", time: "منذ يوم" },
                { dot: "bg-muted-foreground", text: "طرح سؤالاً جديداً", time: "منذ يومين" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${item.dot}`} />
                  <div className="flex-1">
                    <p className="text-sm leading-snug">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
