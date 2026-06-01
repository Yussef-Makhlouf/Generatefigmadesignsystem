import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ReputationBadge } from "../components/reputation-badge";
import { QuestionCard } from "../components/question-card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Settings,
  UserPlus,
  Flame,
  MapPin,
  Calendar,
  Star,
  Zap,
  Eye,
  Award,
  CheckCircle2,
  Trophy,
  Target,
  Gem,
  HelpCircle,
  MessageSquare,
  Bookmark,
  Activity,
  Clock,
  FileText,
  Link2,
  Plus,
  X,
  Building2,
  Utensils,
  Stethoscope,
  Compass,
  ThumbsUp,
  Shield,
  ChevronLeft,
  Briefcase,
  Globe
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { toast } from "sonner";
import { isFollowing as checkFollowing, toggleFollow, getFollowerCount, getFollowingCount } from "../../lib/services";

const BADGES = [
  { icon: Trophy, label: "متصدر", color: "border-[hsla(43,96%,45%,0.3)] bg-[hsla(43,96%,45%,0.08)] text-[hsl(43,96%,54%)] dark:text-[hsl(43,96%,60%)] shadow-[0_0_10px_rgba(245,158,11,0.08)]" },
  { icon: Zap, label: "مجيب سريع", color: "border-[hsla(170,95%,34%,0.3)] bg-[hsla(170,95%,34%,0.08)] text-[hsl(170,95%,43%)] dark:text-[hsl(170,95%,50%)] shadow-[0_0_10px_rgba(0,242,254,0.08)]" },
  { icon: Target, label: "دقيق", color: "border-[hsla(150,80%,38%,0.3)] bg-[hsla(150,80%,38%,0.08)] text-[hsl(150,84%,43%)] dark:text-[hsl(150,84%,50%)] shadow-[0_0_10px_rgba(16,185,129,0.08)]" },
  { icon: Flame, label: "سلسلة ٧", color: "border-[hsla(32,90%,46%,0.3)] bg-[hsla(32,90%,46%,0.08)] text-[hsl(32,95%,52%)] dark:text-[hsl(32,95%,58%)] shadow-[0_0_10px_rgba(245,158,11,0.08)]" },
  { icon: Gem, label: "خبير موثق", color: "border-[hsla(265,80%,48%,0.3)] bg-[hsla(265,80%,48%,0.08)] text-[hsl(265,90%,65%)] dark:text-[hsl(265,90%,72%)] shadow-[0_0_10px_rgba(168,85,247,0.08)]" },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const {
    currentUser,
    questions,
    answers,
    bookmarkedIds,
    voteQuestion,
    toggleBookmark,
    users,
    reviews,
    addReview,
    userVotes,
  } = useAppState();

  const decodedUsername = (() => {
    try {
      return decodeURIComponent(username || "");
    } catch {
      return username || "";
    }
  })();

  const isOwnProfile =
    !username ||
    username === "me" ||
    username === currentUser.username ||
    username === currentUser.id ||
    decodedUsername === currentUser.username ||
    decodedUsername === currentUser.name;

  const user = isOwnProfile
    ? currentUser
    : users.find(
        (u) =>
          u.username === username ||
          u.id === username ||
          u.username === decodedUsername ||
          u.name === decodedUsername ||
          u.name === username
      );

  // Tabs state
  const [activeTab, setActiveTab] = useState(
    user && user.accountType !== "individual" ? "reviews" : "questions"
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowingLoaded, setIsFollowingLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getFollowerCount(user.id).then(setFollowersCount);
    getFollowingCount(user.id).then(setFollowingCount);
    
    if (currentUser?.id && currentUser.id !== "1" && currentUser.id !== user.id) {
      checkFollowing(currentUser.id, user.id).then((status) => {
        setIsFollowing(status);
        setIsFollowingLoaded(true);
      });
    } else {
      setIsFollowing(false);
      setIsFollowingLoaded(true);
    }
  }, [user?.id, currentUser?.id]);

  // Write Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewVisitDate, setReviewVisitDate] = useState("");
  
  // Custom review attachments simulation
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewLinks, setReviewLinks] = useState<{ title: string; url: string }[]>([]);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  if (!user) {
    return (
      <div className="max-w-md w-full mx-auto py-16 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6 shadow-sm">
          <HelpCircle className="h-10 w-10 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-foreground">العضو غير موجود</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          عذراً، قد يكون اسم المستخدم غير صحيح، أو أنه تم تعطيل هذا الحساب.
        </p>
        <Button
          className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11"
          onClick={() => navigate("/")}
        >
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  const isBusiness = user.accountType !== "individual";
  const userQuestions = questions.filter((q) => q.author_id === user.id);
  const userAnswers = questions.filter((q) =>
    answers.some((a) => a.questionId === q.id && a.author_id === user.id)
  );
  const savedQuestions = questions.filter((q) => bookmarkedIds.includes(q.id));

  // Reviews for this business entity
  const receivedReviews = reviews.filter((r) => r.entityId === user.id);
  // Reviews written by this normal user
  const writtenReviews = reviews.filter((r) => r.userId === user.id);

  // Dynamic account labels in Arabic
  const getAccountLabel = () => {
    switch (user.accountType) {
      case "restaurant":
        return "مطعم / مقهى معتمد";
      case "clinic":
        return "مجمع طبي مرخص";
      case "doctor":
        return "طبيب ممارس موثق";
      case "activity":
        return "جهة نشاط ترفيهي";
      case "business":
        return "شركة / جهة تجارية";
      default:
        return user.reputation >= 1000 ? "خبير" : user.reputation >= 500 ? "محترف" : "مساهم";
    }
  };

  const getAccountIcon = () => {
    switch (user.accountType) {
      case "restaurant":
        return Utensils;
      case "clinic":
        return Building2;
      case "doctor":
        return Stethoscope;
      case "activity":
        return Compass;
      case "business":
        return Shield;
      default:
        return Trophy;
    }
  };

  const AccountIcon = getAccountIcon();

  // Ratings calculation breakdown
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = receivedReviews.filter((r) => r.rating === stars).length;
    const percentage = receivedReviews.length > 0 ? (count / receivedReviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  const handleAddReviewLink = () => {
    if (linkTitle.trim() && linkUrl.trim()) {
      setReviewLinks([...reviewLinks, { title: linkTitle.trim(), url: linkUrl.trim() }]);
      setLinkTitle("");
      setLinkUrl("");
    }
  };

  const handleRemoveReviewLink = (index: number) => {
    setReviewLinks(reviewLinks.filter((_, idx) => idx !== index));
  };

  const handleSimulateAddImage = () => {
    const mockImages = [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=60",
    ];
    const nextImg = mockImages[reviewImages.length % mockImages.length];
    setReviewImages([...reviewImages, nextImg]);
    toast.success("تم إرفاق صورة توضيحية بنجاح");
  };

  const handlePublishReview = () => {
    if (!reviewComment.trim()) {
      toast.error("يرجى كتابة تعليقك قبل نشر التقييم");
      return;
    }

    addReview(
      user.id,
      reviewRating,
      reviewComment.trim(),
      reviewImages.length > 0 ? reviewImages : undefined,
      reviewLinks.length > 0 ? reviewLinks : undefined,
      reviewVisitDate || undefined
    );

    toast.success("شكرًا لك! تم نشر تقييمك ودعم سمعة هذه المنشأة");
    
    // Reset state
    setShowReviewModal(false);
    setReviewComment("");
    setReviewRating(5);
    setReviewImages([]);
    setReviewLinks([]);
    setReviewVisitDate("");
  };

  return (
    <div className="max-w-5xl w-full mx-auto animate-fade-in pb-4">
      {/* Profile Header Card */}
      <div className="premium-glass-card overflow-hidden mb-4 sm:mb-6 rounded-3xl border border-border/30 relative shadow-xl">
        {/* Banner with custom image or solid background overlay */}
        <div className="h-28 sm:h-36 relative overflow-hidden border-b border-primary/20 bg-primary/10">
          {user.settings?.cover_url ? (
            <img src={user.settings.cover_url} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 opacity-20 arabic-geometric-mesh-fine" />
              <div className="absolute inset-0 bg-background/80" />
              {/* Subtle Accent Glows (Solid Blur) */}
              <div className="absolute -top-10 right-10 w-40 h-40 bg-primary/10 rounded-full filter blur-3xl" />
              <div className="absolute -bottom-10 left-10 w-40 h-40 bg-secondary/10 rounded-full filter blur-3xl" />
            </>
          )}
        </div>

        <div className="px-4 sm:px-8 pb-5 sm:pb-7 relative">
          {/* Avatar and Action Button row */}
          <div className="flex items-end justify-between -mt-10 sm:-mt-14 mb-4 sm:mb-5">
            <div className="relative group">
              <Avatar className="h-20 w-20 sm:h-28 sm:w-28 ring-4 ring-background shadow-[0_4px_24px_rgba(0,242,254,0.15)] hover:scale-105 transition-transform duration-300">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl sm:text-4xl font-heading font-extrabold bg-primary text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {/* Verified glowing badge */}
              {user.isVerifiedEntity && (
                <div className="absolute bottom-0 right-0 bg-secondary rounded-full p-1.5 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                  <CheckCircle2 className="h-4.5 w-4.5 text-secondary-foreground fill-current" />
                </div>
              )}
            </div>

            {/* Buttons: handle tight space on mobile with wrap */}
            <div className="flex flex-wrap gap-2 pb-1 justify-end">
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  className="rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="h-4 w-4 ml-1.5" />
                  <span className="hidden xs:inline">تعديل الملف</span>
                  <span className="xs:hidden">تعديل</span>
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-300 text-white bg-primary hover:bg-primary-95"
                    variant={isFollowing ? "outline" : "default"}
                    onClick={async () => {
                      if (!currentUser?.id || currentUser.id === "1") {
                        toast.error("يرجى تسجيل الدخول لمتابعة هذا الحساب.");
                        return;
                      }
                      if (currentUser.id === user.id) return;
                      const result = await toggleFollow(currentUser.id, user.id);
                      if (result.success) {
                        setIsFollowing(result.isFollowing);
                        setFollowersCount((c) => result.isFollowing ? c + 1 : c - 1);
                        toast.success(result.isFollowing ? `تتابع الآن ${user.name}` : `ألغيت متابعة ${user.name}`);
                      } else if (result.error) {
                        toast.error(result.error);
                      }
                    }}
                  >
                    <UserPlus className="h-4 w-4 ml-1.5" />
                    {isFollowing ? "متابَع" : "متابعة"}
                  </Button>

                  {isBusiness && (
                    <Button
                      className="rounded-xl h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-300 text-secondary-foreground bg-secondary hover:bg-secondary/95 shadow-md shadow-secondary/15"
                      onClick={() => setShowReviewModal(true)}
                    >
                      <Plus className="h-4 w-4 ml-1.5" />
                      <span className="hidden xs:inline">أضف تقييماً</span>
                      <span className="xs:hidden">تقييم</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Name, bio, & dynamic info rows */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">{user.name}</h1>
              <Badge variant="outline" className="rounded-full text-[10px] sm:text-xs px-2.5 py-0.5 border border-secondary/30 bg-secondary/10 text-secondary-hover font-bold flex items-center">
                <AccountIcon className="h-3 w-3 ml-1.5 text-secondary fill-secondary" />
                {getAccountLabel()}
              </Badge>
              {isBusiness && user.businessRating && (
                <Badge className="rounded-full text-[10px] sm:text-xs px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-bold flex items-center">
                  <Star className="h-3 w-3 ml-1 text-yellow-500 fill-yellow-500" />
                  <span>{user.businessRating}</span>
                  <span className="text-[10px] mr-1 font-normal font-numbers text-muted-foreground">({receivedReviews.length} تقييم)</span>
                </Badge>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed max-w-2xl">{user.bio}</p>
            
            {/* Dynamic pills for user meta */}
            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
              {user.location && (
                <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/20">
                  <MapPin className="h-3.5 w-3.5 text-primary/70" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.settings?.occupation && (
                <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/20">
                  <Briefcase className="h-3.5 w-3.5 text-primary/70" />
                  <span>{user.settings.occupation}</span>
                </div>
              )}
              {user.settings?.website && (
                <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/20">
                  <Globe className="h-3.5 w-3.5 text-primary/70" />
                  <a
                    href={user.settings.website.startsWith("http") ? user.settings.website : `https://${user.settings.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {user.settings.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-muted/30 px-2.5 py-1 rounded-lg border border-border/20">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <span>انضم في {user.joined}</span>
              </div>
              {!isBusiness && (
                <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg border border-orange-500/20 font-medium">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  <span>سلسلة الحضور مستمرة</span>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours & Address Quick Card */}
          {isBusiness && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 rounded-2xl bg-glass-bg/10 border border-border/20 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">العنوان بالتفصيل</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{user.businessAddress || "غير متوفر حالياً"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">أوقات العمل اليومية</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 numeral">{user.operatingHours || "غير متوفر حالياً"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reputation Progress & Level (Normal Users Only) */}
          {!isBusiness && (
            <div className="mb-5 sm:mb-6 p-4 rounded-2xl bg-glass-bg/10 border border-border/20 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <ReputationBadge points={user.reputation} />
                {isOwnProfile && (
                  <Link
                    to="/reputation"
                    className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 hover:scale-105 active:scale-95 duration-200"
                  >
                    <Zap className="h-3 w-3 animate-pulse" />
                    <span>سجل السمعة</span>
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] sm:text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-secondary" />
                    <span>المستوى التالي: {user.reputation >= 1000 ? "خبير أسطوري" : user.reputation >= 500 ? "خبير" : "محترف"}</span>
                  </span>
                  <span className="numeral font-numbers text-secondary-hover font-bold">
                    {Math.min(100, Math.floor((user.reputation % 500) / 5))}%
                  </span>
                </div>
                <div className="h-2 bg-muted/40 rounded-full overflow-hidden p-0.5 border border-border/10">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                    style={{ width: `${Math.min(100, Math.floor((user.reputation % 500) / 5))}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Luxury Badges Display (Normal Users Only) */}
          {!isBusiness && (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5 font-medium">
                <Trophy className="h-4 w-4 text-secondary" />
                الشارات المكتسبة
              </p>
              <div className="flex gap-2 flex-wrap">
                {BADGES.map((badge) => (
                  <span
                    key={badge.label}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs border transition-all duration-300 hover:scale-105 cursor-default hover:translate-y-[-1px] font-medium ${badge.color}`}
                  >
                    <badge.icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{badge.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Stats Grid for normal vs business */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
            {isBusiness ? (
              [
                { label: "تقييمات الزوار", value: receivedReviews.length, color: "text-primary", glow: "hover:shadow-[0_0_15px_rgba(0,242,254,0.15)] hover:border-primary/30" },
                { label: "معدل التقييم", value: user.businessRating || "5.0", color: "text-secondary", glow: "hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-secondary/30" },
                { label: "إجابات الخبير", value: userAnswers.length, color: "text-emerald-500", glow: "hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-success/30" },
                { label: "المتابعين", value: followersCount, color: "text-foreground", glow: "hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:border-foreground/20" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="premium-glass-card bg-glass-bg/20 border border-border/30 rounded-2xl p-2.5 sm:p-4 text-center cursor-default group transition-all duration-300 hover:shadow-md"
                >
                  <div className={`numeral font-numbers text-base sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors font-medium">
                    {stat.label}
                  </div>
                </div>
              ))
            ) : (
              [
                { label: "أسئلة", value: userQuestions.length, color: "text-primary", glow: "hover:shadow-[0_0_15px_rgba(0,242,254,0.15)] hover:border-primary/30" },
                { label: "إجابات", value: userAnswers.length, color: "text-secondary", glow: "hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-secondary/30" },
                { label: "تقييماتي للأماكن", value: writtenReviews.length, color: "text-emerald-500", glow: "hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-success/30" },
                { label: "متابعين", value: followersCount, color: "text-foreground", glow: "hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:border-foreground/20" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="premium-glass-card bg-glass-bg/20 border border-border/30 rounded-2xl p-2.5 sm:p-4 text-center cursor-default group transition-all duration-300 hover:shadow-md"
                >
                  <div className={`numeral font-numbers text-base sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors font-medium">
                    {stat.label}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs Wrapper */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="w-full justify-start bg-glass-bg/20 backdrop-blur-md border border-border/30 p-1 rounded-2xl mb-6 flex flex-wrap gap-1 h-auto">
          {isBusiness ? (
            <>
              <TabsTrigger 
                value="reviews" 
                className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/40 flex-1 sm:flex-initial"
              >
                آراء وتقييمات الأماكن
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/40 flex-1 sm:flex-initial"
              >
                بيانات المنشأة وتراخيصها
              </TabsTrigger>
              <TabsTrigger 
                value="answers" 
                className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/40 flex-1 sm:flex-initial"
              >
                إجابات واستشارات خبيرة
              </TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger 
                value="questions" 
                className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/40 flex-1 sm:flex-initial"
              >
                أسئلتي
              </TabsTrigger>
              <TabsTrigger 
                value="answers" 
                className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/40 flex-1 sm:flex-initial"
              >
                إجاباتي
              </TabsTrigger>
              <TabsTrigger 
                value="writtenReviews" 
                className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/40 flex-1 sm:flex-initial"
              >
                تقييماتي للأماكن
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/40 flex-1 sm:flex-initial"
              >
                المحفوظات
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm hover:bg-muted/40 flex-1 sm:flex-initial"
              >
                النشاط
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Business: Place Reviews Tab */}
        {isBusiness && (
          <TabsContent value="reviews" className="space-y-6">
            {/* Rating breakdown chart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 premium-glass-card rounded-2xl border border-border/20 text-center flex flex-col justify-center">
                <h3 className="text-sm font-bold text-foreground mb-1">التقييم العام</h3>
                <div className="text-5xl font-extrabold numeral text-secondary my-2">
                  {user.businessRating || "5.0"}
                </div>
                <div className="flex justify-center gap-0.5 text-secondary mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${
                        s <= Math.round(user.businessRating || 5) ? "fill-current" : "opacity-30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-medium">بناءً على {receivedReviews.length} من تقييمات الزوار الصادقة</p>
              </Card>

              <Card className="p-5 premium-glass-card rounded-2xl border border-border/20 md:col-span-2">
                <h3 className="text-xs font-bold text-muted-foreground mb-3">توزيع التقييمات والنسب المئوية</h3>
                <div className="space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-3 text-xs font-medium">
                      <span className="w-10 text-left font-numbers flex items-center gap-1 text-foreground">
                        {item.stars} <Star className="h-3 w-3 fill-secondary text-secondary shrink-0" />
                      </span>
                      <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-muted-foreground font-numbers">
                        {item.count} ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Actions for reviews */}
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-sm sm:text-base text-foreground">آراء وتوصيات الزوار الجغرافية</h3>
              {!isOwnProfile && (
                <Button
                  className="rounded-xl h-10 px-4 text-xs sm:text-sm font-semibold bg-secondary hover:bg-secondary/95 text-white"
                  onClick={() => setShowReviewModal(true)}
                >
                  <Plus className="h-4 w-4 ml-1.5" />
                  اكتب تقييماً أو مراجعة
                </Button>
              )}
            </div>

            {/* Reviews List */}
            {receivedReviews.length === 0 ? (
              <div className="premium-glass-card p-10 sm:p-14 text-center rounded-3xl border border-border/20 shadow-lg">
                <Star className="h-12 w-12 mx-auto text-secondary/40 mb-3 animate-float fill-secondary/10" />
                <p className="text-muted-foreground text-sm sm:text-base font-medium">لا توجد تقييمات أو مراجعات مكتوبة بعد لهذا المكان</p>
                {!isOwnProfile && (
                  <Button 
                    className="mt-5 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-semibold" 
                    onClick={() => setShowReviewModal(true)}
                  >
                    كن أول من يقيّم التجربة الآن
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {receivedReviews.map((review) => (
                  <Card key={review.id} className="premium-glass-card p-5 rounded-2xl border border-border/20">
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={review.userAvatar} />
                          <AvatarFallback className="font-bold bg-primary/10 text-primary text-xs">
                            {review.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground">{review.userName}</h4>
                          <p className="text-[10px] text-muted-foreground font-numbers">تاريخ الزيارة: {review.visitDate || "غير متوفر"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded-lg border border-secondary/20 text-secondary text-xs font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-numbers">{review.rating} / ٥</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-4">{review.comment}</p>

                    {/* Review Attachments: Multiple Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-3">
                        {review.images.map((img: string, index: number) => (
                          <img
                            key={index}
                            src={img}
                            alt="مرفق التقييم"
                            className="h-20 w-28 object-cover rounded-xl border border-border/20 hover:scale-105 transition-all cursor-pointer"
                          />
                        ))}
                      </div>
                    )}

                    {/* Review Attachments: Reference Links */}
                    {review.links && review.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 border-t border-border/10 pt-3">
                        {review.links.map((link: { url: string; title: string }, idx: number) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-primary hover:text-primary-hover bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg"
                          >
                            <Link2 className="h-3 w-3 shrink-0" />
                            <span>{link.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* Business: About Tab */}
        {isBusiness && (
          <TabsContent value="about" className="space-y-6">
            <Card className="p-6 premium-glass-card rounded-2xl border border-border/20">
              <h3 className="font-heading font-bold text-base sm:text-lg mb-5 flex items-center gap-2 text-foreground">
                <Shield className="h-5 w-5 text-primary" />
                معلومات التراخيص والتوثيق القانوني
              </h3>
              
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 border-b border-border/10 pb-4">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">الجهة التجارية المشرفة</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{user.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">رقم التوثيق / الترخيص الرسمي</span>
                    <p className="text-sm font-bold text-foreground mt-0.5 numeral">{user.businessLicense || "رقم الترخيص قيد المراجعة"}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 border-b border-border/10 pb-4">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">حالة الاعتماد في مجتمع خبير</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      {user.isVerifiedEntity ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold py-1">
                          <CheckCircle2 className="h-3 w-3 ml-1 text-emerald-500" />
                          حساب موثق رسميًا
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold py-1 animate-pulse">
                          قيد المراجعة والتدقيق
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground font-medium">التصنيف والمهنة</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{user.businessCategory || "خدمات عامة"}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground font-medium">السيرة والبيان التعريفي</span>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mt-1">{user.bio}</p>
                </div>

                {user.settings?.license_document_url && (
                  <div className="mt-4 pt-4 border-t border-border/10">
                    <span className="text-xs text-muted-foreground font-medium">مستند التوثيق المرفق</span>
                    <div className="mt-2 flex items-center gap-3 p-3 rounded-xl border border-border/25 bg-muted/10 w-fit">
                      {user.settings.license_document_url.match(/\.(jpeg|jpg|gif|png)$/i) || !user.settings.license_document_url.endsWith(".pdf") ? (
                        <img src={user.settings.license_document_url} alt="License Document" className="h-12 w-12 object-cover rounded-lg border border-border/20" />
                      ) : (
                        <FileText className="h-10 w-10 text-primary" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-foreground">سند التوثيق / الترخيص</p>
                        <a 
                          href={user.settings.license_document_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>عرض المستند المرفق</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 premium-glass-card rounded-2xl border border-border/20">
              <h3 className="font-heading font-bold text-sm sm:text-base mb-4 text-foreground flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-primary" />
                الموقع الجغرافي وخارطة الوصول
              </h3>
              <p className="text-xs text-muted-foreground mb-4">يقع موقع المنشأة الموثق بالتفصيل أدناه:</p>
              
              <div className="p-4 rounded-xl border border-border/25 bg-muted/20 text-xs font-medium space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العنوان المسجل:</span>
                  <span className="text-foreground font-bold">{user.businessAddress || "شارع التحلية، الرياض"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المدينة / الدولة:</span>
                  <span className="text-foreground font-bold">{user.location}</span>
                </div>
              </div>
              
              {/* Simulated Map placeholder */}
              <div className="h-40 mt-4 rounded-xl border border-border/20 bg-muted/30 flex items-center justify-center text-muted-foreground text-xs relative overflow-hidden select-none">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="text-center z-10 px-4">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2 animate-bounce" />
                  <p className="font-bold text-foreground">خريطة تفاعلية محاكية</p>
                  <p className="text-[10px] mt-0.5 text-muted-foreground font-numbers">خبير Maps: Lat 24.7136, Lng 46.6753</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        )}

        {/* Business: Answers Tab */}
        {isBusiness && (
          <TabsContent value="answers" className="space-y-4">
            {userAnswers.length === 0 ? (
              <div className="premium-glass-card p-10 sm:p-14 text-center rounded-3xl border border-border/20 shadow-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-primary/40 mb-3 animate-float" />
                <p className="text-muted-foreground text-sm sm:text-base font-medium">لم تشارك هذه المنشأة بإجابات علمية في المجتمع بعد</p>
              </div>
            ) : (
              userAnswers.map((question) => (
                <QuestionCard
                  key={question.id}
                  {...question}
                  isBookmarked={bookmarkedIds.includes(question.id)}
                  userVote={userVotes[question.id]}
                  onVote={(dir) => voteQuestion(question.id, dir)}
                  onBookmark={() => toggleBookmark(question.id)}
                  onClick={() => navigate(`/questions/${question.id}`)}
                />
              ))
            )}
          </TabsContent>
        )}

        {/* Standard User Tabs Content */}
        {!isBusiness && (
          <>
            <TabsContent value="questions" className="space-y-4">
              {userQuestions.length === 0 ? (
                <div className="premium-glass-card p-10 sm:p-14 text-center rounded-3xl border border-border/20 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
                  <HelpCircle className="h-12 w-12 mx-auto text-primary/40 mb-3 animate-float" />
                  <p className="text-muted-foreground text-sm sm:text-base font-medium">لم يتم طرح أي أسئلة بعد في مجتمع خبير</p>
                  {isOwnProfile && (
                    <Button 
                      className="mt-5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold" 
                      onClick={() => navigate("/questions/new")}
                    >
                      اطرح سؤالك الأول الآن
                    </Button>
                  )}
                </div>
              ) : (
                userQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    {...question}
                    isBookmarked={bookmarkedIds.includes(question.id)}
                    userVote={userVotes[question.id]}
                    onVote={(dir) => voteQuestion(question.id, dir)}
                    onBookmark={() => toggleBookmark(question.id)}
                    onClick={() => navigate(`/questions/${question.id}`)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="answers" className="space-y-4">
              {userAnswers.length === 0 ? (
                <div className="premium-glass-card p-10 sm:p-14 text-center rounded-3xl border border-border/20 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
                  <MessageSquare className="h-12 w-12 mx-auto text-primary/40 mb-3 animate-float" />
                  <p className="text-muted-foreground text-sm sm:text-base font-medium">لم يقدم أي إجابات أو حلول حتى الآن</p>
                  {isOwnProfile && (
                    <Button 
                      className="mt-5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold" 
                      onClick={() => navigate("/")}
                    >
                      استعرض الأسئلة لإثرائها بإجابتك
                    </Button>
                  )}
                </div>
              ) : (
                userAnswers.map((question) => (
                  <QuestionCard
                    key={question.id}
                    {...question}
                    isBookmarked={bookmarkedIds.includes(question.id)}
                    userVote={userVotes[question.id]}
                    onVote={(dir) => voteQuestion(question.id, dir)}
                    onBookmark={() => toggleBookmark(question.id)}
                    onClick={() => navigate(`/questions/${question.id}`)}
                  />
                ))
              )}
            </TabsContent>

            {/* Standard User: Written Reviews Tab */}
            <TabsContent value="writtenReviews" className="space-y-4">
              <h3 className="font-heading font-bold text-sm sm:text-base text-foreground mb-4">سجل تقييماتي للأماكن والخدمات المحلية</h3>
              
              {writtenReviews.length === 0 ? (
                <div className="premium-glass-card p-10 sm:p-14 text-center rounded-3xl border border-border/20 shadow-lg">
                  <Star className="h-12 w-12 mx-auto text-secondary/40 mb-3 fill-secondary/10" />
                  <p className="text-muted-foreground text-sm sm:text-base font-medium">لم تقم بكتابة أي تقييمات للأماكن أو الخدمات حتى الآن</p>
                  {isOwnProfile && (
                    <Button 
                      className="mt-5 rounded-xl bg-secondary hover:bg-secondary/95 text-white font-semibold" 
                      onClick={() => navigate("/")}
                    >
                      تصفح الأماكن والخبراء للمشاركة بآرائك
                    </Button>
                  )}
                </div>
              ) : (
                writtenReviews.map((review) => (
                  <Card key={review.id} className="premium-glass-card p-5 rounded-2xl border border-border/20 hover:border-secondary/20 transition-all duration-300">
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground hover:text-primary cursor-pointer flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-primary shrink-0" />
                          {review.entityName}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 numeral">مراجعة نُشرت: {review.timestamp}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded-lg border border-secondary/20 text-secondary text-xs font-bold">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-numbers">{review.rating} / ٥</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-3">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
                        {review.images.map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt="مرفق تقييمي"
                            className="h-14 w-20 object-cover rounded-lg border border-border/10"
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              {savedQuestions.length === 0 ? (
                <div className="premium-glass-card p-10 sm:p-14 text-center rounded-3xl border border-border/20 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 arabic-geometric-mesh-fine pointer-events-none" />
                  <Bookmark className="h-12 w-12 mx-auto text-primary/40 mb-3 animate-float" />
                  <p className="text-muted-foreground text-sm sm:text-base font-medium">لا توجد أسئلة محفوظة في مفضلتك الشخصية</p>
                  {isOwnProfile && (
                    <Button 
                      className="mt-5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold" 
                      onClick={() => navigate("/")}
                    >
                      تصفح الأسئلة المميزة لحفظها
                    </Button>
                  )}
                </div>
              ) : (
                savedQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    {...question}
                    isBookmarked={bookmarkedIds.includes(question.id)}
                    userVote={userVotes[question.id]}
                    onVote={(dir) => voteQuestion(question.id, dir)}
                    onBookmark={() => toggleBookmark(question.id)}
                    onClick={() => navigate(`/questions/${question.id}`)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="premium-glass-card p-6 sm:p-8 rounded-3xl border border-border/20 relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                
                <h3 className="font-heading font-bold text-base sm:text-lg mb-6 flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                  سجل النشاط والتفاعل الأخير للأعضاء
                </h3>
                
                <div className="relative border-r border-border/50 pr-4 mr-2 space-y-6">
                  {[
                    ...(userQuestions.length > 0
                      ? [{ dot: "bg-primary shadow-[0_0_8px_var(--primary)]", text: `طرح سؤالاً جديداً بمجتمع خبير: "${userQuestions[0].title}"`, time: userQuestions[0].timestamp }]
                      : []),
                    ...(userAnswers.length > 0
                      ? [{ dot: "bg-secondary shadow-[0_0_8px_var(--secondary)]", text: `أضاف إجابة استشارية قيمة على سؤال: "${userAnswers[0].title}"`, time: "منذ يوم" }]
                      : []),
                    ...(writtenReviews.length > 0
                      ? [{ dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]", text: `قيّم جهة تجارية محلية: "${writtenReviews[0].entityName}" بـ ${writtenReviews[0].rating} نجوم`, time: "قبل أيام" }]
                      : []),
                    { dot: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]", text: "حصل على شارة سلسلة الحضور المستمر (٧ أيام)", time: "منذ أسبوع" },
                  ].map((item, i) => (
                    <div key={i} className="relative flex items-start gap-4 group">
                      <div className={`absolute -right-[21px] top-1.5 w-2.5 h-2.5 rounded-full z-10 transition-transform duration-300 group-hover:scale-125 ${item.dot}`} />
                      
                      <div className="flex-1 bg-glass-bg/10 border border-border/10 rounded-2xl p-3 sm:p-4 hover:border-primary/20 hover:bg-glass-bg/25 transition-all duration-300">
                        <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">{item.text}</p>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 block font-semibold">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Write a Review Breathtaking Custom Modal Overlay */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-xl bg-card border border-border/40 shadow-2xl rounded-3xl overflow-hidden p-6 relative animate-scale-up text-right"
            dir="rtl"
          >
            <button 
              className="absolute top-4 left-4 p-1.5 rounded-xl bg-muted/65 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
              onClick={() => setShowReviewModal(false)}
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary shrink-0">
                <Star className="h-5.5 w-5.5 fill-current animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-foreground">تقييم ومراجعة {user.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">شارك تقييمك الجغرافي الصادق وتجربتك المهنية</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Interactive Star Rating Selector */}
              <div className="space-y-1.5 text-center bg-muted/20 p-4 rounded-2xl border border-border/10">
                <Label className="text-xs font-bold text-foreground/80 block mb-1">اختر عدد النجوم التقييمية</Label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="transition-transform duration-200 hover:scale-125 focus:outline-none"
                      onMouseEnter={() => setReviewHoverRating(s)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      onClick={() => setReviewRating(s)}
                    >
                      <Star
                        className={`h-9.5 w-9.5 ${
                          s <= (reviewHoverRating || reviewRating)
                            ? "fill-secondary text-secondary drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-secondary mt-1.5 block numeral">
                  {reviewRating === 5 ? "ممتاز جدًا وأنصح به" :
                   reviewRating === 4 ? "جيد جدًا وخدمة راقية" :
                   reviewRating === 3 ? "مقبول ولديه نقاط تحسين" :
                   reviewRating === 2 ? "ضعيف ولا يطابق التوقعات" : "سيء للغاية ولا أنصح به"}
                </span>
              </div>

              {/* Date of Visit */}
              <div className="space-y-1.5">
                <Label htmlFor="visit-date" className="text-xs font-bold text-foreground/80">تاريخ الزيارة أو التجربة</Label>
                <Input
                  id="visit-date"
                  type="date"
                  value={reviewVisitDate}
                  onChange={(e) => setReviewVisitDate(e.target.value)}
                  className="rounded-xl border-border/40 bg-input-background h-10 text-xs sm:text-sm text-left"
                />
              </div>

              {/* Review Text Area */}
              <div className="space-y-1.5">
                <Label htmlFor="review-desc" className="text-xs font-bold text-foreground/80">تفاصيل وملاحظات تجربتك</Label>
                <Textarea
                  id="review-desc"
                  placeholder="اكتب بالتفصيل هنا حول الجودة والخدمة والنظافة والسرعة وسلوك الموظفين... ملاحظاتك البناءة تساعد المنشأة والمجتمع."
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="rounded-xl border-border/40 bg-input-background leading-relaxed text-xs sm:text-sm p-3 resize-none"
                  maxLength={1000}
                />
                <p className="text-[10px] text-muted-foreground text-left font-numbers">
                  {reviewComment.length}/1000 حرف
                </p>
              </div>

              {/* simulated files attach */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground/80">إرفاق صور توضيحية للزيارة (اختياري)</Label>
                <div className="flex gap-2 flex-wrap items-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-dashed border-primary/40 hover:border-primary text-primary h-9 px-3 text-xs"
                    onClick={handleSimulateAddImage}
                    disabled={reviewImages.length >= 4}
                  >
                    <Plus className="h-3.5 w-3.5 ml-1" />
                    محاكاة تحميل صورة
                  </Button>
                  
                  {reviewImages.map((img, idx) => (
                    <div key={idx} className="relative h-9 w-12 rounded-lg border border-border/20 overflow-hidden">
                      <img src={img} alt="مرفق" className="h-full w-full object-cover" />
                      <button
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* simulated reference URLs */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground/80">إرفاق روابط ومصادر مرجعية (اختياري)</Label>
                <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  <Input
                    placeholder="عنوان الرابط"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="rounded-xl h-9 text-xs flex-1 bg-input-background"
                  />
                  <Input
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="rounded-xl h-9 text-xs flex-1 text-left bg-input-background"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl h-9 text-xs px-3 border-primary/20 text-primary hover:bg-primary/5"
                    onClick={handleAddReviewLink}
                    disabled={!linkTitle || !linkUrl}
                  >
                    إضافة
                  </Button>
                </div>

                {reviewLinks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2 rounded-xl bg-muted/20 border border-border/10">
                    {reviewLinks.map((link, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="rounded-full px-2.5 py-0.5 text-[10px] bg-primary/10 border border-primary/20 text-primary-hover flex items-center"
                      >
                        <span>{link.title}</span>
                        <button
                          className="mr-1 text-primary hover:text-destructive transition-colors focus:outline-none"
                          onClick={() => handleRemoveReviewLink(idx)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/10 mt-5">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10 text-xs font-semibold hover:bg-muted"
                onClick={() => setShowReviewModal(false)}
              >
                إلغاء الأمر
              </Button>
              <Button
                className="flex-1 rounded-xl h-10 text-xs font-bold bg-secondary hover:bg-secondary/95 text-white"
                onClick={handlePublishReview}
              >
                نشر التقييم والتعليق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
