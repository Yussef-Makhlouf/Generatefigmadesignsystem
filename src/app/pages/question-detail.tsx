import { useState } from "react";
import { useNavigate, Link, useParams } from "react-router";
import { useAppState } from "../context/AppStateContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { VoteButtons } from "../components/vote-buttons";
import {
  ArrowRight, Bookmark, Share2, MapPin, MessageSquare,
  Camera, Check, Eye, Flag, ThumbsUp, PenSquare,
  Plus, Trash2, Image as ImageIcon, Link2, Globe, Send,
  MessageCircle, Map, ExternalLink, X
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { AttachmentLink, AttachmentLocation } from "../data/mock-data";

export function QuestionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    questions,
    answers: allAnswers,
    bookmarkedIds,
    voteQuestion,
    voteAnswer,
    addAnswer,
    addComment,
    toggleBookmark
  } = useAppState();

  const question = questions.find((q) => q.id === id);
  const answers = question ? allAnswers.filter((a) => a.questionId === question.id) : [];

  const [newAnswer, setNewAnswer] = useState("");
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [bestAnswer, setBestAnswer] = useState<string | null>(null);

  // States for Answer Attachments
  const [showAnswerAttachPanel, setShowAnswerAttachPanel] = useState<"none" | "images" | "location" | "links">("none");
  const [answerImages, setAnswerImages] = useState<string[]>([]);
  const [answerLinks, setAnswerLinks] = useState<AttachmentLink[]>([]);
  const [answerLocation, setAnswerLocation] = useState<AttachmentLocation | undefined>(undefined);

  // Answer attachment inputs
  const [ansImgPreset, setAnsImgPreset] = useState("");
  const [ansLinkTitle, setAnsLinkTitle] = useState("");
  const [ansLinkUrl, setAnsLinkUrl] = useState("");
  const [ansLocName, setAnsLocName] = useState("");
  const [ansLocAddress, setAnsLocAddress] = useState("");

  // States for writing comments under answers
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [showCommentAttachPanel, setShowCommentAttachPanel] = useState<{ [key: string]: "none" | "images" | "links" }>({});
  const [commentImages, setCommentImages] = useState<{ [key: string]: string[] }>({});
  const [commentLinks, setCommentLinks] = useState<{ [key: string]: AttachmentLink[] }>({});

  // Comment attachment inputs
  const [commLinkTitle, setCommLinkTitle] = useState("");
  const [commLinkUrl, setCommLinkUrl] = useState("");

  const bookmarked = question ? bookmarkedIds.includes(question.id) : false;

  const handleBookmark = () => {
    if (question) {
      toggleBookmark(question.id);
      toast.success(bookmarked ? "تم إزالة السؤال من المحفوظات" : "تم حفظ السؤال");
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("تم نسخ رابط السؤال");
  };

  const handleAddAnswerImage = (presetUrl: string) => {
    if (answerImages.length >= 4) {
      toast.error("يمكنك إرفاق 4 صور كحد أقصى بالإجابة");
      return;
    }
    setAnswerImages([...answerImages, presetUrl]);
    toast.success("تم إضافة الصورة للإجابة");
  };

  const handleSimulateAnswerImageUpload = () => {
    if (answerImages.length >= 4) {
      toast.error("يمكنك إرفاق 4 صور كحد أقصى");
      return;
    }
    const randId = Math.floor(Math.random() * 1000);
    const url = `https://images.unsplash.com/photo-${randId % 2 === 0 ? "1498050108023-c5249f4df085" : "1504384308090-c894fdcc538d"}?w=500&auto=format&fit=crop&q=80`;
    setAnswerImages([...answerImages, url]);
    toast.success("تمت محاكاة إرفاق صورة مع الإجابة");
  };

  const handleRemoveAnswerImage = (index: number) => {
    setAnswerImages(answerImages.filter((_, i) => i !== index));
  };

  const handleAddAnswerLink = () => {
    if (!ansLinkTitle.trim() || !ansLinkUrl.trim()) {
      toast.error("يرجى ملء تفاصيل الرابط");
      return;
    }
    const newLink: AttachmentLink = { title: ansLinkTitle.trim(), url: ansLinkUrl.trim() };
    setAnswerLinks([...answerLinks, newLink]);
    setAnsLinkTitle("");
    setAnsLinkUrl("");
    toast.success("تم إضافة الرابط المرجعي للإجابة");
  };

  const handleRemoveAnswerLink = (index: number) => {
    setAnswerLinks(answerLinks.filter((_, i) => i !== index));
  };

  const handleSetAnswerLocation = () => {
    if (!ansLocName.trim()) {
      toast.error("يرجى إدخال اسم المكان");
      return;
    }
    setAnswerLocation({
      name: ansLocName.trim(),
      address: ansLocAddress.trim() || undefined,
      lat: 24.7136,
      lng: 46.6753
    });
    toast.success("تم تثبيت الموقع الجغرافي للإجابة");
  };

  const handleRemoveAnswerLocation = () => {
    setAnswerLocation(undefined);
    setAnsLocName("");
    setAnsLocAddress("");
    toast.success("تم إزالة الموقع الجغرافي");
  };

  const handleSubmitAnswer = () => {
    if (newAnswer.length >= 10 && question) {
      addAnswer(
        question.id,
        newAnswer,
        answerImages.length > 0 ? "photo" : answerLocation ? "location" : undefined,
        answerImages,
        answerLinks,
        answerLocation
      );
      toast.success("تم نشر إجابتك الموثقة بنجاح!", { duration: 2000 });
      setNewAnswer("");
      setAnswerImages([]);
      setAnswerLinks([]);
      setAnswerLocation(undefined);
      setShowAnswerAttachPanel("none");
    }
  };

  // Comments functions
  const handleSimulateCommentImage = (ansId: string) => {
    const current = commentImages[ansId] || [];
    if (current.length >= 2) {
      toast.error("يمكنك إرفاق صورتين كحد أقصى بالتعليق");
      return;
    }
    const url = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80`;
    setCommentImages({ ...commentImages, [ansId]: [...current, url] });
    toast.success("تم إرفاق صورة بالتعليق");
  };

  const handleRemoveCommentImage = (ansId: string, index: number) => {
    const current = commentImages[ansId] || [];
    setCommentImages({ ...commentImages, [ansId]: current.filter((_, i) => i !== index) });
  };

  const handleAddCommentLink = (ansId: string) => {
    if (!commLinkTitle.trim() || !commLinkUrl.trim()) {
      toast.error("يرجى إدخال عنوان ورابط صحيح");
      return;
    }
    const current = commentLinks[ansId] || [];
    const newL = { title: commLinkTitle.trim(), url: commLinkUrl.trim() };
    setCommentLinks({ ...commentLinks, [ansId]: [...current, newL] });
    setCommLinkTitle("");
    setCommLinkUrl("");
    toast.success("تم إضافة الرابط للتعليق");
  };

  const handleRemoveCommentLink = (ansId: string, index: number) => {
    const current = commentLinks[ansId] || [];
    setCommentLinks({ ...commentLinks, [ansId]: current.filter((_, i) => i !== index) });
  };

  const handleSubmitComment = (ansId: string) => {
    const content = commentContent[ansId] || "";
    if (!content.trim()) return;

    addComment(ansId, content.trim(), commentImages[ansId], commentLinks[ansId]);
    toast.success("تم إضافة تعليقك بنجاح");
    
    // Clear state
    setCommentContent({ ...commentContent, [ansId]: "" });
    setCommentImages({ ...commentImages, [ansId]: [] });
    setCommentLinks({ ...commentLinks, [ansId]: [] });
    setShowCommentAttachPanel({ ...showCommentAttachPanel, [ansId]: "none" });
  };

  if (!question) {
    return (
      <div className="max-w-md w-full mx-auto py-16 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6 shadow-sm">
          <Flag className="h-10 w-10 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold mb-3">السؤال غير موجود</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          عذراً، قد يكون هذا السؤال قد تم حذفه بواسطة الكاتب أو المشرف، أو أن الرابط غير صحيح.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm text-sm py-5 font-bold"
            onClick={() => navigate("/")}
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-border hover:bg-muted text-sm py-5 font-semibold"
            onClick={() => navigate("/questions/new")}
          >
            اطرح سؤالاً جديداً
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto pb-4 animate-fade-in">
      {/* Back */}
      <Button variant="ghost" className="mb-3 sm:mb-4 -mr-2 hover:bg-muted rounded-xl text-sm h-9" onClick={() => navigate(-1)}>
        <ArrowRight className="h-4 w-4 ml-2" />
        رجوع
      </Button>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Q&A Stream */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">

          {/* Question Card */}
          <Card className="overflow-hidden premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="p-4 sm:p-6">
              <div className="flex gap-3 sm:gap-5">
                <div className="shrink-0">
                  <VoteButtons
                    votes={question.votes}
                    onVote={(dir) => voteQuestion(question.id, dir)}
                    size="md"
                  />
                </div>
 
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 leading-relaxed font-heading text-foreground">
                    {question.title}
                  </h1>
 
                  <p className="prose-arabic text-foreground mb-4 leading-[1.95] text-sm sm:text-base whitespace-pre-line">
                    {question.description}
                  </p>

                  {/* ──── Render Question Attachments ──── */}
                  {(question.images && question.images.length > 0 || question.locationDetail || question.links && question.links.length > 0) && (
                    <div className="mt-4 p-4 bg-muted/15 border border-border/40 rounded-2xl space-y-4">
                      <span className="text-xs font-bold text-foreground block border-b border-border/30 pb-1">المرفقات التوضيحية للسؤال:</span>

                      {/* Images Gallery */}
                      {question.images && question.images.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5 text-primary" />
                            الصور المرفقة:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {question.images.map((img, idx) => (
                              <div key={idx} className="group relative h-28 rounded-xl overflow-hidden border border-border/40 cursor-zoom-in">
                                <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" alt="Question attachment" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Geographic Pin details */}
                      {question.locationDetail && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                            <Map className="h-3.5 w-3.5 text-secondary" />
                            الموقع الجغرافي المستهدف:
                          </span>
                          <div className="p-3 bg-card border border-primary/20 rounded-xl flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-foreground block truncate">{question.locationDetail.name}</span>
                              {question.locationDetail.address && (
                                <span className="text-[10px] text-muted-foreground block truncate">{question.locationDetail.address}</span>
                              )}
                            </div>
                            <Button size="sm" variant="ghost" className="h-8 text-[10px] text-primary hover:bg-primary/5 shrink-0 gap-1" onClick={() => window.open(`https://maps.google.com/?q=${question.locationDetail?.name}`, "_blank")}>
                              <ExternalLink className="h-3 w-3" />
                              خرائط جوجل
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Reference Links details */}
                      {question.links && question.links.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-muted-foreground font-bold flex items-center gap-1">
                            <Link2 className="h-3.5 w-3.5 text-primary" />
                            روابط مرجعية ومصادر:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {question.links.map((link, idx) => (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border/30 hover:border-primary/45 rounded-xl text-xs font-medium text-foreground hover:text-primary transition-all shadow-sm"
                              >
                                <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>{link.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
 
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5 mt-4">
                    {question.tags.map((tag) => (
                      <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}>
                        <Badge
                          variant="secondary"
                          className="rounded-full text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 bg-muted/40 text-foreground/80 border border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-300 font-medium tag-pill"
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
                        <AvatarFallback className="bg-primary text-white text-[10px] sm:text-xs font-bold">
                          {question.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">{question.author.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground font-numbers">
                          {question.timestamp} · {question.author.reputation.toLocaleString("ar-SA")} نقطة
                        </p>
                      </div>
                    </Link>
 
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
                      <div className="hidden xs:flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground px-1.5 sm:px-2">
                        <Eye className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                        <span>{question.views || 42}</span>
                      </div>
                      {question.location && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground px-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
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
            <h2 className="font-bold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-foreground">
              <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-secondary" />
              {answers.length} إجابات من الخبراء والأعضاء
            </h2>
            <select className="text-[10px] sm:text-xs text-muted-foreground bg-muted rounded-lg px-2 py-1 sm:py-1.5 border-0 outline-none">
              <option>الأحدث</option>
              <option>الأعلى تصويتاً</option>
            </select>
          </div>

          {/* Answer Cards Stream */}
          <div className="space-y-4">
            {answers.map((answer, idx) => (
              <motion.div
                key={answer.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card
                  className={`overflow-hidden premium-glass-card transition-all duration-300 border border-border/30 ${
                    bestAnswer === answer.id ? "ring-2 ring-secondary/50 shadow-secondary/15" : ""
                  }`}
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  {bestAnswer === answer.id && (
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-secondary/10 text-secondary text-[10px] sm:text-xs font-semibold border-b border-secondary/20">
                      <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                      أفضل إجابة نموذجية معتمدة
                    </div>
                  )}
                  <div className="p-3 sm:p-5">
                    <div className="flex gap-2 sm:gap-4">
                      <div className="shrink-0">
                        <VoteButtons
                          votes={answer.votes}
                          onVote={(dir) => voteAnswer(answer.id, dir)}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="prose-arabic text-foreground mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                          {answer.content}
                        </p>

                        {/* ──── Render Answer Attachments ──── */}
                        {(answer.images && answer.images.length > 0 || answer.locationDetail || answer.links && answer.links.length > 0) && (
                          <div className="mt-3 p-3.5 bg-muted/10 border border-border/20 rounded-xl space-y-3 mb-4">
                            <span className="text-[11px] font-bold text-foreground block">إثباتات ومرفقات مع الإجابة:</span>

                            {/* Images Grid */}
                            {answer.images && answer.images.length > 0 && (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                                {answer.images.map((img, i) => (
                                  <div key={i} className="group relative h-16 rounded-lg overflow-hidden border border-border/40 cursor-zoom-in">
                                    <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" alt="Answer proof" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Location Pin */}
                            {answer.locationDetail && (
                              <div className="p-2.5 bg-card border border-primary/20 rounded-lg flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-xs font-semibold text-foreground block truncate">{answer.locationDetail.name}</span>
                                    {answer.locationDetail.address && (
                                      <span className="text-[9px] text-muted-foreground block truncate">{answer.locationDetail.address}</span>
                                    )}
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost" className="h-7 text-[9px] text-primary shrink-0" onClick={() => window.open(`https://maps.google.com/?q=${answer.locationDetail?.name}`, "_blank")}>
                                  خرائط جوجل
                                </Button>
                              </div>
                            )}

                            {/* Reference Links */}
                            {answer.links && answer.links.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {answer.links.map((link, i) => (
                                  <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-card border border-border/30 rounded-lg text-xs font-semibold text-foreground hover:text-primary transition-colors"
                                  >
                                    <Globe className="h-3 w-3 text-primary shrink-0" />
                                    <span>{link.title}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Verification Badge */}
                        {answer.verified && (
                          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-secondary/10 text-secondary rounded-xl text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 verified-glow">
                            <Camera className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                            <span className="hidden xs:inline">{answer.verified.label}</span>
                            <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                          </div>
                        )}

                        <Separator className="mb-2 sm:mb-3" />

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <Link to={`/profile/${answer.author.name}`} className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
                            <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                              <AvatarImage src={answer.author.avatar} />
                              <AvatarFallback className="bg-primary text-white text-[9px] sm:text-[10px] font-bold">
                                {answer.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-[11px] sm:text-xs font-semibold text-foreground">{answer.author.name}</p>
                              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-numbers">
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
                              {bestAnswer === answer.id ? "المفضلة" : "اعتماد كأفضل إجابة"}
                            </Button>
                          </div>
                        </div>

                        {/* Comments Panel */}
                        {showComments[answer.id] && (
                          <div className="mt-4 pr-4 border-r-2 border-border/60 space-y-4">
                            
                            {/* Comments List */}
                            {answer.comments.length > 0 ? (
                              <div className="space-y-3">
                                {answer.comments.map((c) => (
                                  <div key={c.id} className="text-sm bg-muted/20 p-2.5 rounded-xl border border-border/25">
                                    <p className="text-foreground leading-relaxed font-medium">{c.content}</p>
                                    
                                    {/* Comment Attachments */}
                                    {((c.images && c.images.length > 0) || (c.links && c.links.length > 0)) && (
                                      <div className="mt-2 flex flex-wrap gap-2 items-center">
                                        {c.images && c.images.map((img, i) => (
                                          <img key={i} src={img} className="w-10 h-10 object-cover rounded-md border border-border/40" alt="comment attached" />
                                        ))}
                                        {c.links && c.links.map((lnk, i) => (
                                          <a key={i} href={lnk.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary bg-card border border-border/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                                            <Globe className="h-3 w-3" />
                                            {lnk.title}
                                          </a>
                                        ))}
                                      </div>
                                    )}

                                    <p className="text-[10px] text-muted-foreground mt-1.5 font-numbers">بواسطة: <strong className="text-text-secondary">{c.author}</strong> · {c.timestamp}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground pr-1">لا توجد تعليقات بعد، كن أول من يضيف تعليقاً!</p>
                            )}

                            {/* Dynamic glassmorphism comment input with attachments */}
                            <div className="bg-glass-bg/10 border border-border/30 rounded-xl p-2.5 mt-2 space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="اكتب تعليقك التوضيحي هنا..."
                                  value={commentContent[answer.id] || ""}
                                  onChange={(e) => setCommentContent({ ...commentContent, [answer.id]: e.target.value })}
                                  className="h-9 text-xs rounded-lg border-border/50 bg-background/30 flex-1"
                                />
                                
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitComment(answer.id)}
                                  disabled={!(commentContent[answer.id] || "").trim()}
                                  className="h-9 w-9 p-0 rounded-lg bg-primary hover:bg-primary-hover text-white shrink-0"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Comment Attachment controls */}
                              <div className="flex items-center gap-2 pt-1 border-t border-border/20 justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSimulateCommentImage(answer.id)}
                                    className="p-1 text-muted-foreground hover:text-primary rounded hover:bg-muted/40 transition-colors"
                                    title="إرفاق صورة بالتعليق"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowCommentAttachPanel({
                                      ...showCommentAttachPanel,
                                      [answer.id]: showCommentAttachPanel[answer.id] === "links" ? "none" : "links"
                                    })}
                                    className={`p-1 rounded transition-colors ${
                                      showCommentAttachPanel[answer.id] === "links" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted/40"
                                    }`}
                                    title="إرفاق رابط بالتعليق"
                                  >
                                    <Link2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                
                                {/* Current attached indicator */}
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-numbers">
                                  {(commentImages[answer.id] || []).length > 0 && <span>📸 {(commentImages[answer.id] || []).length} صورة</span>}
                                  {(commentLinks[answer.id] || []).length > 0 && <span>🔗 {(commentLinks[answer.id] || []).length} رابط</span>}
                                </div>
                              </div>

                              {/* Comment Links Attachment Form */}
                              {showCommentAttachPanel[answer.id] === "links" && (
                                <div className="bg-card border border-border/30 p-2 rounded-lg space-y-2 text-xs">
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      placeholder="عنوان الرابط"
                                      value={commLinkTitle}
                                      onChange={(e) => setCommLinkTitle(e.target.value)}
                                      className="h-7 text-[10px] rounded"
                                    />
                                    <Input
                                      placeholder="https://"
                                      value={commLinkUrl}
                                      onChange={(e) => setCommLinkUrl(e.target.value)}
                                      className="h-7 text-[10px] rounded text-left"
                                      dir="ltr"
                                    />
                                  </div>
                                  <Button size="sm" className="h-7 text-[10px] bg-primary hover:bg-primary-hover text-white w-full" onClick={() => handleAddCommentLink(answer.id)}>
                                    إضافة الرابط للتعليق
                                  </Button>
                                </div>
                              )}

                              {/* Comment Images Grid Preview */}
                              {(commentImages[answer.id] || []).length > 0 && (
                                <div className="flex gap-1 flex-wrap pt-1.5">
                                  {(commentImages[answer.id] || []).map((img, i) => (
                                    <div key={i} className="relative group/img">
                                      <img src={img} className="w-10 h-10 object-cover rounded-md border border-border" alt="preview" />
                                      <button type="button" onClick={() => handleRemoveCommentImage(answer.id, i)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 hover:scale-105">
                                        <X className="h-2 w-2" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Comment Links Grid Preview */}
                              {(commentLinks[answer.id] || []).length > 0 && (
                                <div className="flex gap-1 flex-wrap pt-1">
                                  {(commentLinks[answer.id] || []).map((link, i) => (
                                    <Badge key={i} variant="outline" className="text-[9px] rounded-lg px-2 py-0.5 bg-muted/40 pr-1 gap-1">
                                      {link.title}
                                      <button type="button" onClick={() => handleRemoveCommentLink(answer.id, i)} className="text-destructive font-bold">×</button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Write Answer Card with robust attachment options */}
          <Card className="p-5 sm:p-6 premium-glass-card relative overflow-hidden border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />
            <h3 className="font-bold mb-3.5 flex items-center gap-2 relative z-10 font-heading text-foreground">
              <PenSquare className="h-5 w-5 text-primary" />
              صغ إجابتك النموذجية الموثقة
            </h3>
            
            <div className="input-glow rounded-xl mb-3">
              <Textarea
                id="answer-box"
                placeholder="شارك معرفتك وساعد الآخرين... كن واضحاً ومفصلاً ومستنداً لصور أو روابط إثبات أو موقع جغرافي."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="min-h-[140px] rounded-xl bg-muted/40 border border-border/40 focus:ring-1 focus:ring-primary resize-none p-3 text-sm leading-relaxed"
                maxLength={5000}
              />
            </div>

            {/* Q&A Attachment Bar */}
            <div className="border border-border/30 bg-muted/15 rounded-xl p-3 mb-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-foreground">إرفاق مستندات أو إثباتات مع الإجابة (اختياري):</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowAnswerAttachPanel(showAnswerAttachPanel === "images" ? "none" : "images")}
                    className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                      showAnswerAttachPanel === "images" ? "bg-primary text-white border-primary" : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    صور ({answerImages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAnswerAttachPanel(showAnswerAttachPanel === "location" ? "none" : "location")}
                    className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                      showAnswerAttachPanel === "location" ? "bg-primary text-white border-primary" : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    موقع جغرافي
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAnswerAttachPanel(showAnswerAttachPanel === "links" ? "none" : "links")}
                    className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                      showAnswerAttachPanel === "links" ? "bg-primary text-white border-primary" : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    رابط مرجعي ({answerLinks.length})
                  </button>
                </div>
              </div>

              {/* Panel Details */}
              {showAnswerAttachPanel === "images" && (
                <div className="pt-2 border-t border-border/20 space-y-3">
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-8 text-[10px] border-primary/20 text-primary" onClick={handleSimulateAnswerImageUpload}>
                      رفع صورة محاكاة
                    </Button>
                    <Input
                      placeholder="أو الصق رابط صورة مباشرة..."
                      value={ansImgPreset}
                      onChange={(e) => setAnsImgPreset(e.target.value)}
                      className="h-8 text-xs rounded bg-background/30 flex-1"
                    />
                    <Button type="button" size="sm" className="h-8 text-[10px] bg-primary hover:bg-primary-hover text-white" onClick={() => { if(ansImgPreset) { handleAddAnswerImage(ansImgPreset); setAnsImgPreset(""); } }}>
                      إرفاق
                    </Button>
                  </div>
                  
                  {answerImages.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {answerImages.map((img, i) => (
                        <div key={i} className="relative group/img h-12 w-12 rounded border overflow-hidden">
                          <img src={img} className="w-full h-full object-cover" alt="attached preview" />
                          <button type="button" onClick={() => handleRemoveAnswerImage(i)} className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full p-0.5">
                            <X className="h-2 w-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showAnswerAttachPanel === "location" && (
                <div className="pt-2 border-t border-border/20 space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">اسم المعلم أو المكان</Label>
                      <Input
                        placeholder="مثال: مستشفى التخصصي"
                        value={ansLocName}
                        onChange={(e) => setAnsLocName(e.target.value)}
                        className="h-8 text-xs bg-background/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">العنوان</Label>
                      <Input
                        placeholder="حي الياسمين، الرياض"
                        value={ansLocAddress}
                        onChange={(e) => setAnsLocAddress(e.target.value)}
                        className="h-8 text-xs bg-background/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" className="h-8 text-[10px] bg-primary hover:bg-primary-hover text-white" onClick={handleSetAnswerLocation}>
                      تثبيت موقع الإجابة
                    </Button>
                    {answerLocation && (
                      <Button type="button" variant="ghost" size="sm" className="h-8 text-[10px] text-destructive hover:bg-destructive/5" onClick={handleRemoveAnswerLocation}>
                        إزالة الموقع
                      </Button>
                    )}
                  </div>

                  {answerLocation && (
                    <div className="p-2 bg-card border border-primary/20 rounded flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold block truncate">{answerLocation.name}</span>
                        {answerLocation.address && <span className="text-[10px] text-muted-foreground block truncate">{answerLocation.address}</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showAnswerAttachPanel === "links" && (
                <div className="pt-2 border-t border-border/20 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="عنوان الرابط (مثال: الموقع الرسمي)"
                      value={ansLinkTitle}
                      onChange={(e) => setAnsLinkTitle(e.target.value)}
                      className="h-8 text-xs bg-background/30"
                    />
                    <Input
                      placeholder="رابط URL (https://...)"
                      value={ansLinkUrl}
                      onChange={(e) => setAnsLinkUrl(e.target.value)}
                      className="h-8 text-xs bg-background/30 text-left"
                      dir="ltr"
                    />
                  </div>
                  <Button type="button" size="sm" className="h-8 text-[10px] bg-primary hover:bg-primary-hover text-white" onClick={handleAddAnswerLink}>
                    إضافة الرابط
                  </Button>

                  {answerLinks.length > 0 && (
                    <div className="space-y-1 mt-1.5">
                      {answerLinks.map((lnk, i) => (
                        <div key={i} className="flex justify-between items-center bg-card p-1.5 rounded border border-border/30">
                          <span className="font-semibold truncate">{lnk.title} ({lnk.url})</span>
                          <button type="button" onClick={() => handleRemoveAnswerLink(i)} className="text-destructive font-bold">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between relative z-10">
              <p className="text-xs text-muted-foreground font-numbers">
                <span className={newAnswer.length > 4500 ? "text-destructive font-medium" : ""}>{newAnswer.length}</span>/5000 حرف
              </p>
              <Button
                className="rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm font-bold"
                disabled={newAnswer.length < 10}
                onClick={handleSubmitAnswer}
              >
                نشر الإجابة الموثقة
              </Button>
            </div>
          </Card>
        </div>
 
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-4">
          {/* Question Stats */}
          <Card className="p-5 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-4 text-sm font-heading text-foreground">إحصائيات السؤال</h3>
            {[
              { label: "المشاهدات", value: question.views || 42 },
              { label: "الإجابات",  value: answers.length },
              { label: "التصويتات", value: question.votes },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="font-bold font-numbers text-foreground">{s.value}</span>
              </div>
            ))}
          </Card>
 
          {/* Related Questions */}
          <Card className="p-5 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-4 text-sm font-heading text-foreground">أسئلة مشابهة</h3>
            <div className="space-y-3">
              {[
                "ما هي أفضل عيادة أسنان مجربة في جدة؟",
                "أبحث عن مطعم عائلي هادئ في التحلية بالرياض",
                "أفضل أنشطة ترفيهية للأطفال في إجازة الصيف",
                "أطباء متميزون لعلاج الحساسية لدى الصغار",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/questions/${question.id}`)}
                  className="w-full text-right text-sm text-muted-foreground hover:text-primary transition-colors leading-relaxed block py-1 border-b border-border/10 last:border-0 pb-2"
                >
                  · {q}
                </button>
              ))}
            </div>
          </Card>
 
          {/* Tags */}
          <Card className="p-5 premium-glass-card border border-border/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="font-semibold mb-3 text-sm font-heading text-foreground">الوسوم</h3>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Link key={tag} to={`/tags/${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="rounded-full text-xs px-3 py-1 bg-muted/40 border border-border/20 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-300 font-medium tag-pill cursor-pointer">
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
          className="w-full rounded-xl h-11 bg-primary hover:bg-primary-hover text-white"
          onClick={() => document.getElementById("answer-box")?.focus()}
        >
          <PenSquare className="h-4 w-4 ml-2" />
          اكتب إجابة موثقة
        </Button>
      </div>
    </div>
  );
}
