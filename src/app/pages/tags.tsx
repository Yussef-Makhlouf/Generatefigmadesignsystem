import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { QuestionCard } from "../components/question-card";
import { EmptyState } from "../components/empty-state";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { questionToCardProps } from "../../lib/database.types";
import type { Question } from "../../lib/database.types";
import { useQuestionInteractions } from "../../lib/hooks/use-question-interactions";

const TAG_COLORS: Record<string, { color: string; bgColor: string }> = {
  "برمجة":        { color: "text-primary",                          bgColor: "bg-primary-light border-primary/20" },
  "تقنية":        { color: "text-secondary",                        bgColor: "bg-secondary-light border-secondary/20" },
  "تصميم":        { color: "text-purple-600 dark:text-purple-400",  bgColor: "bg-purple-100/50 dark:bg-purple-950/20 border-purple-200/50" },
  "تعليم":        { color: "text-emerald-600 dark:text-emerald-400",bgColor: "bg-emerald-100/50 dark:bg-emerald-950/20 border-emerald-200/50" },
  "ذكاء اصطناعي": { color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-100/50 dark:bg-indigo-950/20 border-indigo-200/50" },
};
const DEFAULT_COLORS = { color: "text-primary", bgColor: "bg-primary-light border-primary/20" };

export function TagDetailPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { bookmarkedIds, voteQuestion, toggleBookmark, userVotes } = useQuestionInteractions();
  const [activeTab, setActiveTab] = useState("recent");
  const [isFollowing, setIsFollowing] = useState(false);

  const tagName = decodeURIComponent(tag || "");
  const tagColors = TAG_COLORS[tagName] ?? DEFAULT_COLORS;

  // ── Load tag metadata from DB ─────────────────────────────
  const { data: tagMeta } = useQuery({
    queryKey: ["tag", tagName],
    queryFn: async () => {
      const { data } = await supabase
        .from("tags")
        .select("id, name, usage_count")
        .eq("name", tagName)
        .maybeSingle();
      return data;
    },
    enabled: !!tagName,
  });

  // ── Load questions for this tag ───────────────────────────
  const { data: tagQuestions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["tagQuestions", tagName, activeTab],
    queryFn: async () => {
      // Find tag id first
      const { data: tagRow } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .maybeSingle();

      if (!tagRow) return [];

      let q = supabase
        .from("question_tags")
        .select(`
          question:questions(
            *,
            author:profiles!author_id(id, name, username, avatar_url, reputation),
            question_tags(tag_id, tags(id, name)),
            question_attachments(*)
          )
        `)
        .eq("tag_id", tagRow.id);

      const { data } = await q;
      if (!data) return [];

      const questions = (data as any[])
        .map((row) => row.question)
        .filter((q) => q && !q.is_deleted);

      const mapped = questions.map((q: any) => {
        const tagNames = (q.question_tags ?? []).map((qt: any) => qt.tags?.name).filter(Boolean);
        return {
          ...q,
          tags: tagNames,
          votes: q.votes_count,
          votes_count: q.votes_count,
          answers: q.answers_count,
          answers_count: q.answers_count,
          views: q.views_count,
          description: q.content,
          timestamp: q.created_at,
        };
      });

      if (activeTab === "popular") {
        return mapped.sort((a: any, b: any) => b.votes_count - a.votes_count);
      } else if (activeTab === "unanswered") {
        return mapped.filter((q: any) => q.answers_count === 0);
      }
      return mapped.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!tagName,
  });

  // ── Top contributors for this tag ─────────────────────────
  const { data: topContributors = [] } = useQuery({
    queryKey: ["tagContributors", tagName],
    queryFn: async () => {
      const { data: tagRow } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .maybeSingle();

      if (!tagRow) return [];

      // Get question IDs with this tag, then get answer authors
      const { data: qtRows } = await supabase
        .from("question_tags")
        .select("question_id")
        .eq("tag_id", tagRow.id)
        .limit(100);

      if (!qtRows || qtRows.length === 0) return [];

      const questionIds = qtRows.map((r: any) => r.question_id);

      const { data: answers } = await supabase
        .from("answers")
        .select("author_id, author:profiles!author_id(id, name, username, avatar_url, reputation)")
        .in("question_id", questionIds)
        .eq("is_deleted", false);

      if (!answers) return [];

      // Count answers per author
      const authorMap = new Map<string, { profile: any; count: number }>();
      for (const a of answers as any[]) {
        const profile = a.author;
        if (!profile) continue;
        if (!authorMap.has(profile.id)) {
          authorMap.set(profile.id, { profile, count: 0 });
        }
        authorMap.get(profile.id)!.count++;
      }

      return Array.from(authorMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(({ profile, count }) => ({ ...profile, answers: count }));
    },
    enabled: !!tagName,
  });

  // ── Related tags (from questions with the same tag) ───────
  const { data: relatedTags = [] } = useQuery<string[]>({
    queryKey: ["relatedTags", tagName],
    queryFn: async () => {
      const { data: tagRow } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .maybeSingle();
      if (!tagRow) return [];

      const { data: qtRows } = await supabase
        .from("question_tags")
        .select("question_id")
        .eq("tag_id", tagRow.id)
        .limit(50);

      if (!qtRows || qtRows.length === 0) return [];

      const questionIds = qtRows.map((r: any) => r.question_id);
      const { data: otherTags } = await supabase
        .from("question_tags")
        .select("tag_id, tags(name)")
        .in("question_id", questionIds)
        .neq("tag_id", tagRow.id);

      if (!otherTags) return [];

      const counts = new Map<string, number>();
      for (const row of otherTags as any[]) {
        const name = row.tags?.name;
        if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
      }

      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name]) => name);
    },
    enabled: !!tagName,
  });

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
            <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-[0.04] pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl border ${tagColors.bgColor} shadow-sm backdrop-blur-sm`}>
                  <Hash className={`h-6 w-6 ${tagColors.color}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold mb-2 tracking-tight">#{tagName}</h1>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
                    أسئلة ومناقشات في موضوع <span className="font-semibold text-primary">#{tagName}</span>. انضم إلى المجتمع وأضف مساهمتك.
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

            {/* Stats Grid — Real data */}
            <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
              <div className="glass border border-border/50 rounded-xl p-3 text-center group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <MessageSquare className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-lg font-bold text-primary numeral">
                    {tagMeta ? tagMeta.usage_count.toLocaleString("ar-SA") : tagQuestions.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">سؤال</p>
              </div>
              <div className="glass border border-border/50 rounded-xl p-3 text-center group hover:border-secondary/30 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="text-lg font-bold text-secondary numeral">
                    {topContributors.length}+
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">مساهم</p>
              </div>
              <div className="glass border border-border/50 rounded-xl p-3 text-center group hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-lg font-bold text-emerald-500 numeral">
                    {relatedTags.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">وسم مشابه</p>
              </div>
            </div>
          </Card>

          {/* Questions Tabs — Real data */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-card/45 backdrop-blur-md border border-border/80 rounded-xl mb-4 p-1">
              <TabsTrigger value="recent" className="rounded-lg transition-all duration-200">الأحدث</TabsTrigger>
              <TabsTrigger value="popular" className="rounded-lg transition-all duration-200">الأكثر تصويتاً</TabsTrigger>
              <TabsTrigger value="unanswered" className="rounded-lg transition-all duration-200">بدون إجابة</TabsTrigger>
            </TabsList>

            {["recent", "popular", "unanswered"].map((tabKey) => (
              <TabsContent key={tabKey} value={tabKey} className="space-y-4 animate-fade-in">
                {questionsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : tagQuestions.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="لا توجد أسئلة بعد"
                    description={`لم يُطرح أي سؤال في وسم #${tagName} بعد. كن أول من يطرح سؤالاً!`}
                    action={{ label: "اطرح سؤالاً", onClick: () => navigate(`/questions/new?tag=${encodeURIComponent(tagName)}`) }}
                  />
                ) : (
                  tagQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      {...questionToCardProps(q)}
                      isBookmarked={bookmarkedIds.includes(q.id)}
                      userVote={userVotes[q.id]}
                      onVote={(dir) => voteQuestion(q.id, dir)}
                      onBookmark={() => toggleBookmark(q.id)}
                      onClick={() => navigate(`/questions/${q.id}`)}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Related Tags — Real data */}
          <Card className="p-4 premium-glass-card relative overflow-hidden">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-ring" />
              <Tag className="h-4 w-4 text-primary" />
              وسوم مشابهة
            </h3>
            {relatedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {relatedTags.map((t) => (
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
            ) : (
              <p className="text-xs text-muted-foreground">لا توجد وسوم مشابهة بعد</p>
            )}
          </Card>

          {/* Top Contributors — Real data */}
          <Card className="p-4 premium-glass-card relative overflow-hidden">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse-gold" />
              <BookOpen className="h-4 w-4 text-secondary" />
              أبرز المساهمين
            </h3>
            {topContributors.length > 0 ? (
              <div className="space-y-3">
                {topContributors.map((contributor: any, i) => (
                  <Link
                    key={contributor.id}
                    to={`/profile/${contributor.username}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all duration-300 group"
                  >
                    <span className="text-xs text-muted-foreground w-4 shrink-0 font-bold numeral">
                      {i + 1}
                    </span>
                    <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border group-hover:ring-primary/40 transition-all duration-300">
                      <AvatarImage src={contributor.avatar_url ?? ""} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-secondary/20 text-text-primary font-bold">
                        {contributor.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{contributor.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {contributor.answers} إجابة
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-primary shrink-0 numeral">
                      {contributor.reputation?.toLocaleString("ar-SA")}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">لا يوجد مساهمون بعد</p>
            )}
          </Card>

          {/* Ask Question CTA */}
          <Card className="p-5 premium-glass-card relative overflow-hidden border-primary/20 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50 pointer-events-none" />
            
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
