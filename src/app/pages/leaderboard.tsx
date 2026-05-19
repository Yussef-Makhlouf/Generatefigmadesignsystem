import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Trophy, Medal, Flame, TrendingUp, Award, Star } from "lucide-react";

const leaderboardData = {
  weekly: [
    { rank: 1, name: "سارة العمري", username: "sara_omari", reputation: 1240, answers: 34, badge: "خبير", streak: 7, avatar: "" },
    { rank: 2, name: "محمد الزهراني", username: "m_zahrani", reputation: 980, answers: 28, badge: "نشط", streak: 5, avatar: "" },
    { rank: 3, name: "نورة الرشيد", username: "noura_r", reputation: 850, answers: 22, badge: "متميز", streak: 4, avatar: "" },
    { rank: 4, name: "خالد المنصور", username: "khaled_m", reputation: 720, answers: 19, badge: "", streak: 3, avatar: "" },
    { rank: 5, name: "فاطمة الحسن", username: "fatima_h", reputation: 690, answers: 17, badge: "", streak: 3, avatar: "" },
    { rank: 6, name: "عمر يوسف", username: "omar_y", reputation: 630, answers: 15, badge: "", streak: 2, avatar: "" },
    { rank: 7, name: "لين السالم", username: "leen_s", reputation: 580, answers: 14, badge: "", streak: 2, avatar: "" },
    { rank: 8, name: "أحمد قاسم", username: "ahmed_q", reputation: 520, answers: 12, badge: "", streak: 1, avatar: "" },
    { rank: 9, name: "ريم العتيبي", username: "reem_a", reputation: 490, answers: 11, badge: "", streak: 1, avatar: "" },
    { rank: 10, name: "يوسف الدوسري", username: "yousuf_d", reputation: 450, answers: 10, badge: "", streak: 1, avatar: "" },
  ],
  monthly: [],
  alltime: [],
};

leaderboardData.monthly = leaderboardData.weekly.map((u, i) => ({
  ...u,
  reputation: u.reputation * 4 + Math.floor(Math.random() * 200),
  answers: u.answers * 4 + Math.floor(Math.random() * 10),
  rank: i + 1,
}));

leaderboardData.alltime = leaderboardData.weekly.map((u, i) => ({
  ...u,
  reputation: u.reputation * 20 + Math.floor(Math.random() * 1000),
  answers: u.answers * 20 + Math.floor(Math.random() * 50),
  rank: i + 1,
}));

const rankMedal = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
};

const rankBg = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-l from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-950/20 dark:to-amber-950/20 dark:border-yellow-800/30";
  if (rank === 2) return "bg-gradient-to-l from-slate-50 to-gray-50 border-slate-200 dark:from-slate-900/20 dark:border-slate-700/30";
  if (rank === 3) return "bg-gradient-to-l from-orange-50 to-amber-50 border-orange-200 dark:from-orange-950/20 dark:border-orange-800/30";
  return "";
};

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("weekly");
  const data = leaderboardData[period as keyof typeof leaderboardData];

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-1">لوحة المتصدرين</h1>
        <p className="text-muted-foreground text-sm">أكثر المساهمين نشاطاً في مجتمع Khapeer</p>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList className="w-full bg-card border border-border">
          <TabsTrigger value="weekly" className="flex-1 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            هذا الأسبوع
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            هذا الشهر
          </TabsTrigger>
          <TabsTrigger value="alltime" className="flex-1 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-secondary" />
            الكل
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {/* 2nd place */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
          <Avatar className="h-14 w-14 ring-2 ring-slate-300">
            <AvatarImage src={data[1]?.avatar} />
            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">{data[1]?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-xs font-medium text-center truncate w-full text-center">{data[1]?.name}</p>
          <p className="text-xs text-muted-foreground">{data[1]?.reputation.toLocaleString("ar-SA")}</p>
          <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-t-xl flex items-center justify-center">
            <Medal className="h-8 w-8 text-slate-400" />
          </div>
        </div>

        {/* 1st place */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
          <Trophy className="h-6 w-6 text-yellow-500 mb-1" />
          <Avatar className="h-16 w-16 ring-4 ring-yellow-400 shadow-lg">
            <AvatarImage src={data[0]?.avatar} />
            <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-lg">{data[0]?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-bold text-center truncate w-full text-center">{data[0]?.name}</p>
          <p className="text-xs text-amber-600 font-semibold">{data[0]?.reputation.toLocaleString("ar-SA")} نقطة</p>
          <div className="w-full h-24 bg-gradient-to-t from-amber-400 to-yellow-300 rounded-t-xl flex items-center justify-center shadow-md">
            <Trophy className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* 3rd place */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
          <Avatar className="h-14 w-14 ring-2 ring-amber-600">
            <AvatarImage src={data[2]?.avatar} />
            <AvatarFallback className="bg-amber-50 text-amber-700 font-bold">{data[2]?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-xs font-medium text-center truncate w-full text-center">{data[2]?.name}</p>
          <p className="text-xs text-muted-foreground">{data[2]?.reputation.toLocaleString("ar-SA")}</p>
          <div className="w-full h-12 bg-amber-200 dark:bg-amber-800/40 rounded-t-xl flex items-center justify-center">
            <Medal className="h-7 w-7 text-amber-700" />
          </div>
        </div>
      </div>

      {/* Full Rankings */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">الترتيب الكامل</h2>
        </div>
        <div className="divide-y divide-border">
          {data.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-4 p-4 hover:bg-accent transition-colors cursor-pointer ${rankBg(user.rank)}`}
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              {/* Rank */}
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                {rankMedal(user.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="font-semibold bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{user.name}</p>
                  {user.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 rounded-full">
                      <Star className="h-2.5 w-2.5 ml-0.5 text-amber-500" />
                      {user.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>

              {/* Stats */}
              <div className="text-left flex-shrink-0">
                <p className="text-sm font-bold text-primary">{user.reputation.toLocaleString("ar-SA")}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                  <Flame className="h-3 w-3 text-orange-400" />
                  <span>{user.streak} يوم</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
