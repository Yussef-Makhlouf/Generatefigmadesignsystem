import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { VoteButtons } from "../components/vote-buttons";
import { ArrowRight, Bookmark, Share2, MapPin, MessageSquare, Camera, MapPinIcon, Check } from "lucide-react";

export function QuestionDetailPage() {
  const navigate = useNavigate();
  const [newAnswer, setNewAnswer] = useState("");
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  const question = {
    id: "1",
    title: "كيف يمكنني تعلم البرمجة من الصفر؟",
    description: "أنا مهتم بتعلم البرمجة ولكن لا أعرف من أين أبدأ. ما هي أفضل الموارد والمسارات للمبتدئين؟ هل يجب أن أبدأ بلغة معينة؟ وكيف أحافظ على استمراريتي في التعلم؟",
    author: { name: "أحمد محمد", avatar: "", reputation: 450 },
    votes: 42,
    tags: ["برمجة", "تعليم", "مبتدئين"],
    location: "الرياض",
    timestamp: "منذ ساعتين",
  };

  const answers = [
    {
      id: "a1",
      content: "أنصحك بالبدء بلغة Python فهي سهلة التعلم وممتازة للمبتدئين. يمكنك استخدام منصات مثل Codecademy أو freeCodeCamp. المهم هو الممارسة اليومية وبناء مشاريع صغيرة.",
      author: { name: "سارة علي", avatar: "", reputation: 1250 },
      votes: 28,
      timestamp: "منذ ساعة",
      verified: { type: "photo", label: "تم التحقق من الخبرة" },
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
      verified: { type: "location", label: "من نفس المدينة" },
      comments: [],
    },
  ];

  const toggleComments = (answerId: string) => {
    setShowComments((prev) => ({ ...prev, [answerId]: !prev[answerId] }));
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl pb-24 md:pb-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate("/")}
      >
        <ArrowRight className="h-4 w-4 ml-2" />
        العودة للرئيسية
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Question Card */}
          <Card className="p-6">
            <div className="flex gap-4">
              {/* Vote Section */}
              <div className="flex-shrink-0">
                <VoteButtons votes={question.votes} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-4 leading-relaxed">
                  {question.title}
                </h1>

                <p className="text-foreground mb-4 leading-relaxed whitespace-pre-wrap">
                  {question.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <Link key={index} to={`/tags/${encodeURIComponent(tag)}`}>
                      <Badge
                        variant="secondary"
                        className="rounded-full text-xs px-3 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Author & Meta */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={question.author.avatar} />
                      <AvatarFallback>{question.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{question.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {question.timestamp} • {question.author.reputation} نقطة
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Bookmark className="h-4 w-4 ml-1" />
                      حفظ
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Share2 className="h-4 w-4 ml-1" />
                      مشاركة
                    </Button>
                  </div>
                </div>

                {question.location && (
                  <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{question.location}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Answers Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {answers.length} إجابة
            </h2>

            <div className="space-y-4">
              {answers.map((answer) => (
                <Card key={answer.id} className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex-shrink-0">
                      <VoteButtons votes={answer.votes} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground mb-4 leading-relaxed">
                        {answer.content}
                      </p>

                      {/* Verification Badge */}
                      {answer.verified && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium mb-4">
                          {answer.verified.type === "photo" ? (
                            <Camera className="h-3 w-3" />
                          ) : (
                            <MapPinIcon className="h-3 w-3" />
                          )}
                          <span>{answer.verified.label}</span>
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      <Separator className="my-4" />

                      {/* Author & Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={answer.author.avatar} />
                            <AvatarFallback>{answer.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{answer.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {answer.timestamp} • {answer.author.reputation} نقطة
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComments(answer.id)}
                        >
                          <MessageSquare className="h-4 w-4 ml-1" />
                          {answer.comments.length} تعليق
                        </Button>
                      </div>

                      {/* Comments */}
                      {showComments[answer.id] && answer.comments.length > 0 && (
                        <div className="mt-4 pr-4 border-r-2 border-muted space-y-3">
                          {answer.comments.map((comment) => (
                            <div key={comment.id} className="text-sm">
                              <p className="text-foreground mb-1">{comment.content}</p>
                              <p className="text-xs text-muted-foreground">
                                {comment.author} • {comment.timestamp}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Write Answer */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">إجابتك</h3>
            <Textarea
              placeholder="شارك معرفتك وساعد الآخرين... كن واضحاً ومفصلاً في إجابتك."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="min-h-[150px] mb-4 bg-input-background"
              maxLength={5000}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {newAnswer.length}/5000 حرف
              </p>
              <Button className="rounded-lg" disabled={newAnswer.length < 10}>
                نشر الإجابة
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="hidden md:block space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">أسئلة مشابهة</h3>
            <div className="space-y-3">
              {[
                "ما هي أفضل لغة برمجة للمبتدئين؟",
                "كيف أتعلم البرمجة بسرعة؟",
                "ما الفرق بين Python و JavaScript؟",
              ].map((q, i) => (
                <button
                  key={i}
                  className="w-full text-right text-sm hover:text-primary transition-colors leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">إحصائيات السؤال</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المشاهدات</span>
                <span className="font-semibold">324</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الإجابات</span>
                <span className="font-semibold">{answers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التصويتات</span>
                <span className="font-semibold">{question.votes}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* Sticky Bottom Bar - Mobile */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 md:hidden z-30">
        <Button className="w-full rounded-lg" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
          اكتب إجابة
        </Button>
      </div>
    </div>
  );
}
