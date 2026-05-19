import { useState } from "react";
import { useNavigate } from "react-router";
import { QuestionCard } from "../components/question-card";
import { TrendingTopics } from "../components/trending-topics";
import { DailyChallenge } from "../components/daily-challenge";
import { ExpertCard, FEATURED_EXPERTS } from "../components/expert-card";
import { StatsBanner } from "../components/stats-banner";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Trophy, Sparkles, Flame, Zap, ChevronLeft } from "lucide-react";
import { mockQuestions } from "../data/mock-data";

const questions = mockQuestions.map((q) => ({ ...q, author: { ...q.author, avatar: "" } }));

const topContributors = [
  { name: "محمد الأحمد", reputation: 5420, answers: 234, streak: 14 },
  { name: "نورة السعيد", reputation: 4850, answers: 198, streak: 7 },
  { name: "عبدالرحمن الخالد", reputation: 3920, answers: 156, streak: 5 },
];

const topQuestionsToday = [
  { title: "كيف أبدأ في تعلم Python؟", votes: 89, hot: true },
  { title: "ما هي أفضل IDE للجافا؟", votes: 67 },
  { title: "نصائح للتحضير لمقابلة عمل تقنية", votes: 54 },
];

export function HomePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("recent");

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      {/* Mobile Stats (visible only on mobile) */}
      <div className="lg:hidden mb-4">
        <StatsBanner />
      </div>

      <div className="flex gap-6">
        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          {/* Daily Challenge */}
          <DailyChallenge />

          {/* Trending Topics */}
          <TrendingTopics />

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={setFilter} className="mb-6">
            <TabsList className="w-full justify-start bg-card border border-border overflow-x-auto">
              <TabsTrigger value="recent" className="flex items-center gap-1.5">
                الأحدث
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-orange-500" />
                الأكثر شعبية
              </TabsTrigger>
              <TabsTrigger value="foryou" className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-purple-500" />
                لك
              </TabsTrigger>
              <TabsTrigger value="unanswered" className="flex items-center gap-1.5">
                بدون إجابة
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* For You hint */}
          {filter === "foryou" && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-sm text-primary">
                أسئلة مختارة بناءً على اهتماماتك في <strong>تقنية، تعليم</strong>
              </p>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                {...question}
                onClick={() => navigate(`/questions/${question.id}`)}
              />
            ))}
          </div>

          {/* Load more */}
          <div className="mt-6 text-center">
            <Button variant="outline" className="rounded-xl px-8">
              تحميل المزيد
            </Button>
          </div>
        </div>

        {/* Right Panel - Desktop Only */}
        <aside className="hidden lg:block w-80 space-y-4 flex-shrink-0">
          {/* Platform Stats */}
          <StatsBanner />

          {/* Top Questions Today */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">أكثر نشاطاً اليوم</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2">
                الكل
                <ChevronLeft className="h-3 w-3 mr-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {topQuestionsToday.map((q, index) => (
                <div key={index} className="group cursor-pointer" onClick={() => navigate("/questions/1")}>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{q.votes}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                        {q.title}
                      </p>
                      {q.hot && (
                        <Badge variant="secondary" className="mt-1 text-[10px] h-4 px-1.5 py-0 rounded-full bg-orange-100 text-orange-600 border-0">
                          <Flame className="h-2.5 w-2.5 ml-0.5" />
                          رائج
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Featured Experts */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">خبراء مميزون</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2">
                الكل
                <ChevronLeft className="h-3 w-3 mr-1" />
              </Button>
            </div>
            <div className="space-y-1">
              {FEATURED_EXPERTS.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          </Card>

          {/* Active Contributors */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">أنشط المساهمين</h3>
            </div>
            <div className="space-y-2">
              {topContributors.map((user, index) => (
                <div key={index} className="flex items-center gap-3 cursor-pointer hover:bg-accent p-2 rounded-lg transition-colors">
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold text-sm">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.reputation.toLocaleString("ar-SA")} نقطة
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-orange-500">
                    <Flame className="h-3 w-3" />
                    <span>{user.streak}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-3 text-sm rounded-lg"
              onClick={() => navigate("/leaderboard")}
            >
              عرض المتصدرين
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
