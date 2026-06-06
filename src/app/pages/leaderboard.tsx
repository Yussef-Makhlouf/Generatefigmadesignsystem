import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Trophy, Medal, Flame, TrendingUp, Award, Star, Loader2 } from "lucide-react";
import { useAuthSession } from "../../lib/hooks/use-auth-session";
import { useLeaderboard } from "../../lib/hooks/use-leaderboard";
import type { LeaderboardPeriod } from "../../lib/services/stats.service";
import { BgPattern } from "../components/bg-pattern";

const rankMedal = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-secondary animate-float fill-secondary/20" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-[var(--rank-silver)]" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-[var(--rank-bronze)]" />;
  return <span className="numeral font-numbers text-xs font-bold text-muted-foreground w-5 text-center">{rank}</span>;
};

const rankBg = (rank: number) => {
  if (rank === 1) return "bg-secondary/5 hover:bg-secondary/10 border-r-4 border-secondary transition-all";
  if (rank === 2) return "bg-primary/5 hover:bg-primary/10 border-r-4 border-primary transition-all";
  if (rank === 3) return "bg-warning/5 hover:bg-warning/10 border-r-4 border-warning transition-all";
  return "hover:bg-muted/30 transition-all";
};

const RANK_ARABIC = ["١", "٢", "٣"];

export function LeaderboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthSession();
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");

  const { data: leaderboard = [], isLoading } = useLeaderboard(period, 20);

  // Merge current user if not already in the list
  const currentUserEntry = currentUser && currentUser.id && currentUser.id !== "1"
    ? {
        id: currentUser.id,
        name: currentUser.name ?? "أنت",
        username: currentUser.username ?? "you",
        avatar_url: currentUser.avatar ?? null,
        reputation: currentUser.reputation ?? 0,
        isCurrentUser: true,
      }
    : null;

  // Build final sorted data
  const baseData = leaderboard.map((u) => ({
    ...u,
    isCurrentUser: u.id === currentUser?.id,
  }));

  // If current user not in top N, add them at the bottom
  const isInList = baseData.some((u) => u.id === currentUser?.id);
  const allUsers = isInList || !currentUserEntry ? baseData : [...baseData, currentUserEntry];
  const data = allUsers
    .sort((a, b) => b.reputation - a.reputation)
    .map((user, index) => ({ ...user, rank: index + 1 }));

  const top3 = data.slice(0, 3);
  // Reorder podium: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="max-w-3xl w-full mx-auto animate-fade-in pb-4">
      {/* Header with geometric backgrounds */}
      <div className="text-center mb-8 relative overflow-hidden rounded-3xl py-6">
        <BgPattern variant={1} opacity="subtle" />
        <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        {/* Golden Trophy Holder */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/20 to-secondary-hover/5 border border-secondary/30 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden animate-pulse-gold">
          <Trophy className="h-10 w-10 text-secondary animate-float fill-secondary/10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold mb-2 tracking-tight text-foreground">لوحة المتصدرين</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">أكثر المساهمين نشاطاً في مجتمع خبير لتبادل المعرفة</p>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)} className="mb-8">
        <TabsList className="w-full bg-glass-bg/20 backdrop-blur-md border border-border/30 p-1 rounded-2xl mb-6 flex flex-wrap gap-1 h-auto">
          <TabsTrigger
            value="weekly"
            className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-primary shadow-sm hover:bg-muted/40 flex-1 flex items-center justify-center gap-1.5"
          >
            <Flame className="h-4 w-4 text-warning fill-current" />
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جارٍ تحميل بيانات المتصدرين…</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد بيانات لهذه الفترة بعد</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10 mt-6 px-2 sm:px-0">
              {/* 2nd place - Left */}
              <div
                className="flex flex-col items-center gap-2 flex-1 max-w-[125px] sm:max-w-[140px] group cursor-pointer"
                onClick={() => podium[0] && navigate(`/profile/${podium[0].username}`)}
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-4 ring-[color-mix(in_srgb,var(--rank-silver)_30%,transparent)] group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <AvatarImage src={podium[0]?.avatar_url ?? ""} />
                    <AvatarFallback className="rank-avatar--silver font-heading font-bold">
                      {podium[0]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1.5 -right-1.5 rank-badge--silver rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">٢</div>
                </div>
                <p className="text-xs font-bold text-center truncate w-full text-foreground mt-1">{podium[0]?.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold bg-muted/40 px-2 py-0.5 rounded-full border border-border/10">
                  {podium[0]?.reputation.toLocaleString("ar-SA")}
                </p>
                <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-[color-mix(in_srgb,var(--rank-silver)_20%,transparent)] via-[color-mix(in_srgb,var(--rank-silver)_5%,transparent)] to-transparent border-t-2 border-[color-mix(in_srgb,var(--rank-silver)_30%,transparent)] rounded-t-2xl flex items-center justify-center shadow-inner mt-1">
                  <Medal className="h-7 w-7 text-[var(--rank-silver)]" />
                </div>
              </div>

              {/* 1st place - Center */}
              <div
                className="flex flex-col items-center gap-2 flex-1 max-w-[145px] sm:max-w-[160px] group cursor-pointer -mt-6"
                onClick={() => podium[1] && navigate(`/profile/${podium[1].username}`)}
              >
                <Trophy className="h-7 w-7 text-secondary mb-1 animate-float fill-secondary/20" />
                <div className="relative">
                  <Avatar className="h-18 w-18 sm:h-20 sm:w-20 ring-4 ring-secondary shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={podium[1]?.avatar_url ?? ""} />
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary-hover text-white font-heading font-extrabold text-lg sm:text-xl">
                      {podium[1]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.4)]">١</div>
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-center truncate w-full text-foreground mt-1">{podium[1]?.name}</p>
                <p className="text-xs text-secondary-hover font-extrabold bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20">
                  {podium[1]?.reputation.toLocaleString("ar-SA")} نقطة
                </p>
                <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-secondary/35 via-secondary/10 to-transparent border-t-2 border-secondary rounded-t-3xl flex items-center justify-center shadow-lg mt-1">
                  <Trophy className="h-9 w-9 text-secondary animate-pulse" />
                </div>
              </div>

              {/* 3rd place - Right */}
              <div
                className="flex flex-col items-center gap-2 flex-1 max-w-[125px] sm:max-w-[140px] group cursor-pointer"
                onClick={() => podium[2] && navigate(`/profile/${podium[2].username}`)}
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-4 ring-[color-mix(in_srgb,var(--rank-bronze)_30%,transparent)] group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <AvatarImage src={podium[2]?.avatar_url ?? ""} />
                    <AvatarFallback className="rank-avatar--bronze font-heading font-bold">
                      {podium[2]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1.5 -right-1.5 rank-badge--bronze rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">٣</div>
                </div>
                <p className="text-xs font-bold text-center truncate w-full text-foreground mt-1">{podium[2]?.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold bg-muted/40 px-2 py-0.5 rounded-full border border-border/10">
                  {podium[2]?.reputation.toLocaleString("ar-SA")}
                </p>
                <div className="w-full h-12 sm:h-16 bg-gradient-to-t from-[color-mix(in_srgb,var(--rank-bronze)_20%,transparent)] via-[color-mix(in_srgb,var(--rank-bronze)_5%,transparent)] to-transparent border-t-2 border-[color-mix(in_srgb,var(--rank-bronze)_30%,transparent)] rounded-t-2xl flex items-center justify-center shadow-inner mt-1">
                  <Medal className="h-6 w-6 text-[var(--rank-bronze)]" />
                </div>
              </div>
            </div>
          )}

          {/* Full Rankings List */}
          <div className="premium-glass-card overflow-hidden rounded-3xl border border-border/20 shadow-xl relative">
            <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(var(--primary)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
            
            <div className="p-4 sm:p-5 border-b border-border/30 bg-glass-bg/10 backdrop-blur-sm flex items-center justify-between">
              <h2 className="font-heading font-bold text-sm sm:text-base text-foreground">الترتيب الكامل للأعضاء</h2>
              <span className="text-xs text-muted-foreground font-numbers">{data.length} عضو</span>
            </div>
            
            <div className="divide-y divide-border/20">
              {data.map((user) => (
                <div
                  key={user.id ?? user.rank}
                  className={`flex items-center gap-3 sm:gap-4 p-4 transition-all cursor-pointer relative group ${rankBg(user.rank)} ${
                    (user as any).isCurrentUser ? "ring-2 ring-primary/20 ring-inset" : ""
                  }`}
                  onClick={() => navigate(`/profile/${user.username}`)}
                >
                  {/* Top 3 border accent */}
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
                    <AvatarImage src={user.avatar_url ?? ""} />
                    <AvatarFallback className="font-heading font-bold bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                      {(user as any).isCurrentUser && (
                        <Badge variant="outline" className="text-[8px] sm:text-[10px] px-2 py-0 h-4 rounded-full border border-primary/20 bg-primary/5 text-primary font-semibold">
                          أنت
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">@{user.username}</p>
                  </div>

                  {/* Reputation */}
                  <div className="text-left flex-shrink-0 pl-1">
                    <p className="numeral font-numbers text-xs sm:text-sm font-extrabold text-primary">
                      {user.reputation.toLocaleString("ar-SA")}
                    </p>
                    <p className="text-[10px] text-muted-foreground text-left">نقطة</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
