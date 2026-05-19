import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Trophy, Medal, Flame, TrendingUp, Award, Star } from "lucide-react";
import { useAppState } from "../context/AppStateContext";

const leaderboardData = {
  weekly: [
    { name: "سارة العمري", username: "sara_omari", reputation: 1240, answers: 34, badge: "خبير", streak: 7, avatar: "" },
    { name: "محمد الزهراني", username: "m_zahrani", reputation: 980, answers: 28, badge: "نشط", streak: 5, avatar: "" },
    { name: "نورة الرشيد", username: "noura_r", reputation: 850, answers: 22, badge: "متميز", streak: 4, avatar: "" },
    { name: "خالد المنصور", username: "khaled_m", reputation: 720, answers: 19, badge: "", streak: 3, avatar: "" },
    { name: "فاطمة الحسن", username: "fatima_h", reputation: 690, answers: 17, badge: "", streak: 3, avatar: "" },
    { name: "عمر يوسف", username: "omar_y", reputation: 630, answers: 15, badge: "", streak: 2, avatar: "" },
    { name: "لين السالم", username: "leen_s", reputation: 580, answers: 14, badge: "", streak: 2, avatar: "" },
    { name: "أحمد قاسم", username: "ahmed_q", reputation: 520, answers: 12, badge: "", streak: 1, avatar: "" },
    { name: "ريم العتيبي", username: "reem_a", reputation: 490, answers: 11, badge: "", streak: 1, avatar: "" },
    { name: "يوسف الدوسري", username: "yousuf_d", reputation: 450, answers: 10, badge: "", streak: 1, avatar: "" },
  ],
  monthly: [] as any[],
  alltime: [] as any[],
};

leaderboardData.monthly = leaderboardData.weekly.map((u, i) => ({
  ...u,
  reputation: u.reputation * 4 + 200,
  answers: u.answers * 4 + 5,
  streak: u.streak,
}));

leaderboardData.alltime = leaderboardData.weekly.map((u, i) => ({
  ...u,
  reputation: u.reputation * 20 + 800,
  answers: u.answers * 20 + 25,
  streak: u.streak,
}));

const rankMedal = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-secondary animate-float fill-secondary/20" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="numeral font-numbers text-xs font-bold text-muted-foreground w-5 text-center">{rank}</span>;
};

const rankBg = (rank: number) => {
  if (rank === 1) return "bg-secondary/5 hover:bg-secondary/10 dark:bg-secondary/5 dark:hover:bg-secondary/10 border-r-4 border-secondary transition-all";
  if (rank === 2) return "bg-primary/5 hover:bg-primary/10 border-r-4 border-primary transition-all";
  if (rank === 3) return "bg-orange-500/5 hover:bg-orange-500/10 border-r-4 border-orange-500 transition-all";
  return "hover:bg-muted/30 transition-all";
};

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { currentUser, answers } = useAppState();
  const [period, setPeriod] = useState("weekly");

  const userAnswersCount = answers.filter(a => a.author.name === currentUser.name).length;

  const baseUsers = leaderboardData[period as keyof typeof leaderboardData];
  const allUsers = [
    ...baseUsers,
    {
      name: currentUser.name,
      username: currentUser.username,
      reputation: currentUser.reputation,
      answers: userAnswersCount,
      badge: "أنت",
      streak: 5,
      avatar: currentUser.avatar
    }
  ];

  // Remove potential duplicates by username
  const uniqueUsersMap = new Map();
  allUsers.forEach(u => {
    uniqueUsersMap.set(u.username, u);
  });
  const uniqueUsers = Array.from(uniqueUsersMap.values());

  const data = uniqueUsers
    .sort((a, b) => b.reputation - a.reputation)
    .map((user, index) => ({
      ...user,
      rank: index + 1
    }));

  return (
    <div className="max-w-3xl w-full mx-auto animate-fade-in pb-4">
      {/* Header with geometric backgrounds */}
      <div className="text-center mb-8 relative">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        {/* Golden Trophy Holder */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/20 to-secondary-hover/5 border border-secondary/30 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden animate-pulse-gold">
          <Trophy className="h-10 w-10 text-secondary animate-float fill-secondary/10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold mb-2 tracking-tight text-foreground">لوحة المتصدرين</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">أكثر المساهمين نشاطاً في مجتمع خبير لتبادل المعرفة</p>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={setPeriod} className="mb-8">
        <TabsList className="w-full bg-glass-bg/20 backdrop-blur-md border border-border/30 p-1 rounded-2xl mb-6 flex flex-wrap gap-1 h-auto">
          <TabsTrigger 
            value="weekly" 
            className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary shadow-sm hover:bg-muted/40 flex-1 flex items-center justify-center gap-1.5"
          >
            <Flame className="h-4 w-4 text-orange-500 fill-current" />
            هذا الأسبوع
          </TabsTrigger>
          <TabsTrigger 
            value="monthly" 
            className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary shadow-sm hover:bg-muted/40 flex-1 flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="h-4 w-4 text-primary" />
            هذا الشهر
          </TabsTrigger>
          <TabsTrigger 
            value="alltime" 
            className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary shadow-sm hover:bg-muted/40 flex-1 flex items-center justify-center gap-1.5"
          >
            <Award className="h-4 w-4 text-secondary" />
            الكل
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10 mt-6 px-2 sm:px-0">
        {/* 2nd place - Left */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[125px] sm:max-w-[140px] group cursor-pointer" onClick={() => data[1] && navigate(`/profile/${data[1].username}`)}>
          <div className="relative">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-4 ring-slate-400/30 group-hover:scale-105 transition-transform duration-300 shadow-md">
              <AvatarImage src={data[1]?.avatar} />
              <AvatarFallback className="bg-slate-200 text-slate-700 font-heading font-bold">{data[1]?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -top-1.5 -right-1.5 bg-slate-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">٢</div>
          </div>
          <p className="text-xs font-bold text-center truncate w-full text-foreground mt-1">{data[1]?.name}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold bg-muted/40 px-2 py-0.5 rounded-full border border-border/10">
            {data[1]?.reputation.toLocaleString("ar-SA")}
          </p>
          <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-400/20 via-slate-400/5 to-transparent border-t-2 border-slate-400/30 rounded-t-2xl flex items-center justify-center shadow-inner mt-1">
            <Medal className="h-7 w-7 text-slate-400" />
          </div>
        </div>

        {/* 1st place - Center */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[145px] sm:max-w-[160px] group cursor-pointer -mt-6" onClick={() => data[0] && navigate(`/profile/${data[0].username}`)}>
          <Trophy className="h-7 w-7 text-secondary mb-1 animate-float fill-secondary/20" />
          <div className="relative">
            <Avatar className="h-18 w-18 sm:h-20 sm:w-20 ring-4 ring-secondary shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-300">
              <AvatarImage src={data[0]?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-secondary to-amber-500 text-white font-heading font-extrabold text-lg sm:text-xl">{data[0]?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.4)]">١</div>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-center truncate w-full text-foreground mt-1">{data[0]?.name}</p>
          <p className="text-xs text-secondary-hover font-extrabold bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20">
            {data[0]?.reputation.toLocaleString("ar-SA")} نقطة
          </p>
          <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-secondary/35 via-secondary/10 to-transparent border-t-2 border-secondary rounded-t-3xl flex items-center justify-center shadow-lg mt-1">
            <Trophy className="h-9 w-9 text-secondary animate-pulse" />
          </div>
        </div>

        {/* 3rd place - Right */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[125px] sm:max-w-[140px] group cursor-pointer" onClick={() => data[2] && navigate(`/profile/${data[2].username}`)}>
          <div className="relative">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-4 ring-amber-700/30 group-hover:scale-105 transition-transform duration-300 shadow-md">
              <AvatarImage src={data[2]?.avatar} />
              <AvatarFallback className="bg-amber-100 text-amber-800 font-heading font-bold">{data[2]?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -top-1.5 -right-1.5 bg-amber-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">٣</div>
          </div>
          <p className="text-xs font-bold text-center truncate w-full text-foreground mt-1">{data[2]?.name}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold bg-muted/40 px-2 py-0.5 rounded-full border border-border/10">
            {data[2]?.reputation.toLocaleString("ar-SA")}
          </p>
          <div className="w-full h-12 sm:h-16 bg-gradient-to-t from-amber-700/20 via-amber-700/5 to-transparent border-t-2 border-amber-700/30 rounded-t-2xl flex items-center justify-center shadow-inner mt-1">
            <Medal className="h-6 w-6 text-amber-800" />
          </div>
        </div>
      </div>

      {/* Full Rankings list */}
      <div className="premium-glass-card overflow-hidden rounded-3xl border border-border/20 shadow-xl relative">
        <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(var(--primary)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="p-4 sm:p-5 border-b border-border/30 bg-glass-bg/10 backdrop-blur-sm">
          <h2 className="font-heading font-bold text-sm sm:text-base text-foreground">الترتيب الكامل للأعضاء</h2>
        </div>
        
        <div className="divide-y divide-border/20">
          {data.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-3 sm:gap-4 p-4 transition-all cursor-pointer relative group ${rankBg(user.rank)}`}
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              {/* Left/Right border glow ribbons on top 3 ranks */}
              {user.rank <= 3 && (
                <div className={`absolute top-0 bottom-0 right-0 w-1 ${
                  user.rank === 1 ? "bg-secondary" : user.rank === 2 ? "bg-primary" : "bg-orange-500"
                }`} />
              )}

              {/* Rank / Medal */}
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {rankMedal(user.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0 ring-1 ring-border group-hover:scale-105 transition-transform">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="font-heading font-bold bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                  {user.badge && (
                    <Badge variant="outline" className={`text-[8px] sm:text-[10px] px-2 py-0 h-4 rounded-full border border-secondary/20 bg-secondary/5 text-secondary-hover font-semibold`}>
                      <Star className="h-2 w-2 ml-1 text-secondary fill-secondary" />
                      {user.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">@{user.username}</p>
              </div>

              {/* Reputation & Streak Stats */}
              <div className="text-left flex-shrink-0 pl-1">
                <p className="numeral font-numbers text-xs sm:text-sm font-extrabold text-primary">{user.reputation.toLocaleString("ar-SA")}</p>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground justify-end mt-0.5 font-medium">
                  <Flame className="h-3 w-3 text-orange-500 fill-orange-500/10" />
                  <span>{user.streak} أيام</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

