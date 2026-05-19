import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { VoteButtons } from "../components/vote-buttons";
import {
  ArrowRight, Bookmark, Share2, MapPin, MessageSquare,
  Camera, MapPinIcon, Check, Eye, Flag, ThumbsUp, PenSquare,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export function QuestionDetailPage() {
  const navigate = useNavigate();
  const [newAnswer, setNewAnswer] = useState("");
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [bookmarked, setBookmarked] = useState(false);
  const [bestAnswer, setBestAnswer] = useState<string | null>(null);

  const question = {
    id: "1",
    title: "كيف يمكنني تعلم البرمجة من الصفر؟",
    description: "أنا مهتم بتعلم البرمجة ولكن لا أعرف من أين أبدأ. ما هي أفضل الموارد والمسارات للمبتدئين؟ هل يجب أن أبدأ بلغة معينة؟ وكيف أحافظ على استمراريتي في التعلم؟",
    author: { name: "أحمد محمد", avatar: "", reputation: 450 },
    votes: 42,
    tags: ["برمجة", "تعليم", "مبتدئين"],
    location: "الرياض",
    timestamp: "منذ ساعتين",
    views: 324,
  };

  const answers = [
    {
      id: "a1",
      content: "أنصحك بالبدء بلغة Python فهي سهلة التعلم وممتازة للمبتدئين. يمكنك استخدام منصات مثل Codecademy أو freeCodeCamp. المهم هو الممارسة اليومية وبناء مشاريع صغيرة.",
      author: { name: "سارة علي", avatar: "", reputation: 1250 },
      votes: 28,
      timestamp: "منذ ساعة",
      verified: { type: "photo" as const, label: "تم التحقق من الخبرة" },
      comments: [
        { id: "c1", author: "خالد", content: "نصيحة رائعة، شكراً!", timestamp: "منذ 30 دقيقة" },
      ],
    },
    {
      id: "a2",
      content: "بالإضافة لما ذكر، أنصحك بالانضمام لمجتمعات المطورين المحلية والعالمية. التعلم مع آخرين يساعد كثيراً في الاستمرارية والتحفيز.",
      author: { name: "عمر يوسف", avatar: "", reputation: 650 },
      votes: 15,
      timestamp: "منذ 45 دقيقة",
      verified: { type: "location" as const, label: "من نفس المدينة" },
      comments: [],
    },
    {
      id: "a3",
      content: "أهم شيء هو تحديد هدفك أولاً. هل تريد تطوير تطبيقات ويب؟ أم علم البيانات؟ أم تطوير الألعاب؟ كل مجال له مساره المناسب.",
      author: { name: "فاطمة حسن", avatar: "", reputation: 890 },
      votes: 11,
      timestamp: "منذ ساعتين",
      comments: [],
    },
  ];

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "تم إزالة السؤال من المحفوظات" : "تم حفظ السؤال");
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("تم نسخ رابط السؤال");
  };

  const handleSubmitAnswer = () => {
    if (newAnswer.length >= 10) {
      toast.success("تم نشر إجابتك بنجاح!", { duration: 2000 });
      setNewAnswer("");
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl pb-20 sm:pb-36 md:pb-8 animate-fade-in">
      {/* Back */}
      <Button variant="ghost" className="mb-3 sm:mb-4 -mr-2 hover:bg-muted rounded-xl text-sm h-9" onClick={() => navigate(-1)}>
        <ArrowRight className="h-4 w-4 ml-2" />
        رجوع
      </Button>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-3 sm:space-y-5">

          {/* Question Card */}
          <Card className="overflow-hidden border-border/60 shadow-sm" style={{ borderRadius: "var(--radius-lg)" }}>
            {/* Top accent */}
            <div className="h-1 gradient-primary" />

            <div className="p-4 sm:p-6">
              <div className="flex gap-3 sm:gap-5">
                <div className="shrink-0">
                  <VoteButtons votes={question.votes} size="md" />
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 leading-relaxed">
                    {question.title}
                  </h1>

                  <p className="prose-arabic text-foreground mb-3 sm:mb-4 leading-[1.9] text-sm sm:text-base">
                    {question.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                    {question.tags.map((tag) => (
                      <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}>
                        <Badge
                          variant="secondary"
                          className="rounded-full text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer border-0 tag-pill"
                        >
                          #{tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  <Separator className="mb-3 sm:mb-4" />

                  {/* Author & Actions */}
                  <div className="flex items-start sm:items-center justify-between flex-wrap gap-2 sm:gap-3">
                    <Link to={`/profile/${question.author.name}`} className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80 transition-opacity">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage src={question.author.avatar} />
                        <AvatarFallback className="gradient-primary text-white text-[10px] sm:text-xs font-bold">
                          {question.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold">{question.author.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {question.timestamp} · {question.author.reputation.toLocaleString("ar-SA")} نقطة
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
                      <div className="hidden xs:flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground px-1.5 sm:px-2">
                        <Eye className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                        <span>{question.views}</span>
                      </div>
                      {question.location && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground px-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{question.location}</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-xl h-7 sm:h-8 text-xs ${bookmarked ? "text-primary bg-primary/10" : "hover:bg-muted"}`}
                        onClick={handleBookmark}
                      >
                        <Bookmark className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ml-1 ${bookmarked ? "fill-current" : ""}`} />
                        <span className="hidden xs:inline">{bookmarked ? "محفوظ" : "حفظ"}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl h-7 sm:h-8 hover:bg-muted text-xs" onClick={handleShare}>
                        <Share2 className="h-3.5 sm:h-4 w-3.5 sm:w-4 ml-1" />
                        <span className="hidden xs:inline">مشاركة</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Answers Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-secondary" />
              {answers.length} إجابات
            </h2>
            <select className="text-[10px] sm:text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1 sm:py-1.5 border-0 outline-none">
              <option>الأحدث</option>
              <option>الأعلى تصويتاً</option>
            </select>
          </div>

          {/* Answer Cards */}
          <div className="space-y-3 sm:space-y-4">
            {answers.map((answer, idx) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card
                  className={`overflow-hidden border-border/60 shadow-sm ${
                    bestAnswer === answer.id ? "ring-2 ring-secondary" : ""
                  }`}
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  {bestAnswer === answer.id && (
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-secondary/10 text-secondary text-[10px] sm:text-xs font-semibold border-b border-secondary/20">
                      <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                      أفضل إجابة
                    </div>
                  )}
                  <div className="p-3 sm:p-5">
                    <div className="flex gap-2 sm:gap-4">
                      <div className="shrink-0">
                        <VoteButtons votes={answer.votes} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="prose-arabic text-foreground mb-3 sm:mb-4 text-sm sm:text-base">{answer.content}</p>

                        {/* Verification */}
                        {answer.verified && (
                          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-secondary/10 text-secondary rounded-xl text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 verified-glow">
                            {answer.verified.type === "photo"
                              ? <Camera className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                              : <MapPinIcon className="h-3 sm:h-3.5 w-3 sm:w-3.5" />}
                            <span className="hidden xs:inline">{answer.verified.label}</span>
                            <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                          </div>
                        )}

                        <Separator className="mb-2 sm:mb-3" />

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <Link to={`/profile/${answer.author.name}`} className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
                            <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                              <AvatarImage src={answer.author.avatar} />
                              <AvatarFallback className="gradient-primary text-white text-[9px] sm:text-[10px] font-bold">
                                {answer.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-[11px] sm:text-xs font-semibold">{answer.author.name}</p>
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                                {answer.timestamp} · {answer.author.reputation.toLocaleString("ar-SA")} نقطة
                              </p>
                            </div>
                          </Link>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs rounded-lg hover:bg-muted"
                              onClick={() => setShowComments((p) => ({ ...p, [answer.id]: !p[answer.id] }))}
                            >
                              <MessageSquare className="h-3.5 w-3.5 ml-1" />
                              {answer.comments.length} تعليق
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs rounded-lg hover:bg-muted"
                              onClick={() => toast.info("تم الإبلاغ عن الإجابة")}
                            >
                              <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 px-2 text-xs rounded-lg ${bestAnswer === answer.id ? "text-secondary bg-secondary/10" : "hover:bg-muted"}`}
                              onClick={() => setBestAnswer(bestAnswer === answer.id ? null : answer.id)}
                            >
                              <ThumbsUp className="h-3.5 w-3.5 ml-1" />
                              {bestAnswer === answer.id ? "الأفضل" : "اختر أفضل"}
                            </Button>
                          </div>
                        </div>

                        {/* Comments */}
                        {showComments[answer.id] && answer.comments.length > 0 && (
                          <div className="mt-4 pr-4 border-r-2 border-muted space-y-3">
                            {answer.comments.map((c) => (
                              <div key={c.id} className="text-sm">
                                <p className="text-foreground mb-0.5">{c.content}</p>
                                <p className="text-xs text-muted-foreground">{c.author} · {c.timestamp}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Write Answer */}
          <Card className="p-6 border-border/60 shadow-sm" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <PenSquare className="h-5 w-5 text-primary" />
              إجابتك
            </h3>
            <div className="input-glow rounded-xl mb-3">
              <Textarea
                placeholder="شارك معرفتك وساعد الآخرين... كن واضحاً ومفصلاً في إجابتك."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="min-h-[140px] rounded-xl bg-muted/40 border-0 focus:ring-0 resize-none"
                maxLength={5000}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <span className={newAnswer.length > 4500 ? "text-destructive font-medium" : ""}>{newAnswer.length}</span>/5000
              </p>
              <Button
                className="rounded-xl gradient-primary border-0 shadow-sm"
                disabled={newAnswer.length < 10}
                onClick={handleSubmitAnswer}
              >
                نشر الإجابة
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-4">
          {/* Question Stats */}
          <Card className="p-5 border-border/60 shadow-sm" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-4 text-sm">إحصائيات السؤال</h3>
            {[
              { label: "المشاهدات", value: question.views },
              { label: "الإجابات",  value: answers.length },
              { label: "التصويتات", value: question.votes },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="font-bold">{s.value}</span>
              </div>
            ))}
          </Card>

          {/* Related Questions */}
          <Card className="p-5 border-border/60 shadow-sm" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-4 text-sm">أسئلة مشابهة</h3>
            <div className="space-y-3">
              {[
                "ما هي أفضل لغة برمجة للمبتدئين؟",
                "كيف أتعلم البرمجة بسرعة؟",
                "ما الفرق بين Python و JavaScript؟",
                "هل يجب أن أتعلم الخوارزميات أولاً؟",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => navigate("/questions/1")}
                  className="w-full text-right text-sm text-muted-foreground hover:text-primary transition-colors leading-relaxed block py-1"
                >
                  · {q}
                </button>
              ))}
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-5 border-border/60 shadow-sm" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-3 text-sm">الوسوم</h3>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="rounded-full text-xs px-3 py-1 bg-muted border-0 hover:bg-primary hover:text-primary-foreground transition-colors tag-pill cursor-pointer">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-16 inset-x-0 bg-card/95 backdrop-blur-sm border-t border-border p-3 md:hidden z-30">
        <Button
          className="w-full rounded-xl h-11 gradient-primary border-0"
          onClick={() => document.getElementById("answer-box")?.focus()}
        >
          <PenSquare className="h-4 w-4 ml-2" />
          اكتب إجابة
        </Button>
      </div>
    </div>
  );
}

