import { Link } from "react-router";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSquare, Bookmark, Share2, MapPin, Eye } from "lucide-react";
import { VoteButtons } from "./vote-buttons";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { formatTimestamp } from "../lib/utils";
import { questionUrl } from "./seo";

interface QuestionCardProps {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    username?: string;
    avatar?: string;
    reputation: number;
  };
  votes: number;
  answers: number;
  tags: string[];
  location?: string | null;
  timestamp: string;
  isBookmarked?: boolean;
  views?: number;
  userVote?: "up" | "down" | null;
  onVote?: (direction: "up" | "down") => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onClick?: () => void;
}

export function QuestionCard({
  id,
  title,
  description,
  author,
  votes,
  answers,
  tags,
  location,
  timestamp,
  isBookmarked: initialBookmarked = false,
  views = 0,
  userVote = null,
  onVote,
  onBookmark,
  onShare,
  onClick,
}: QuestionCardProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const displayTimestamp = (() => {
    try {
      const d = new Date(timestamp);
      return isNaN(d.getTime()) ? timestamp : formatTimestamp(d);
    } catch {
      return timestamp;
    }
  })();

  useEffect(() => {
    setBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !bookmarked;
    setBookmarked(nextVal);
    toast.success(nextVal ? "تم حفظ السؤال" : "تم إزالة السؤال من المحفوظات", {
      duration: 1500,
      position: "bottom-center",
    });
    onBookmark?.();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + questionUrl(id, title));
    toast.success("تم نسخ رابط السؤال", { duration: 1500, position: "bottom-center" });
    onShare?.();
  };

  const hasAnswers = answers > 0;
  const displayViews = views || Math.floor(Math.abs(votes) * 8 + answers * 15 + 50);

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer premium-glass-card animate-fade-in hover:shadow-card-hover pattern-hex-mesh"
      style={{ borderRadius: "var(--radius-lg)" }}
      onClick={onClick}
    >
      {/* Desert Luxury: arabesque gold top accent on hover */}
      <div className="absolute top-0 inset-x-[10%] h-0.5 opacity-0 group-hover:opacity-100 transition-all duration-500"
           style={{ background: "var(--gradient-gold-line)" }} />

      {/* Subtle pattern overlay — hex mesh via CSS class on parent */}

      <div className="p-3 sm:p-5 relative z-10">
        <div className="flex gap-2 sm:gap-4">
          {/* Vote Column */}
          <div className="flex-shrink-0 pt-0.5">
            <VoteButtons votes={votes} userVote={userVote} onVote={onVote} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm sm:text-base font-semibold leading-relaxed mb-1.5 group-hover:text-primary transition-all duration-300 line-clamp-2">
              {title}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
              {description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
              {tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  to={`/tags/${encodeURIComponent(tag)}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="secondary"
                    className="rounded-full text-[10px] sm:text-xs px-2.5 py-0.5 bg-muted/40 text-foreground/80 border border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-300 font-medium tag-pill"
                  >
                    #{tag}
                  </Badge>
                </Link>
              ))}
              {tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] sm:text-xs px-2.5 py-0.5 bg-muted/30 border border-border/20 text-muted-foreground font-medium"
                >
                  +{tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Author */}
              <Link
                to={`/profile/${author.username || author.name}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity min-w-0"
              >
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                  <AvatarImage src={author.avatar} />
                <AvatarFallback className="text-[9px] sm:text-[10px] bg-primary text-white font-bold">
                    {author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground min-w-0">
                  <span className="font-medium text-foreground truncate max-w-[80px] sm:max-w-none">{author.name}</span>
                  <span className="hidden xs:inline">·</span>
                  <span className="hidden xs:inline truncate">{displayTimestamp}</span>
                  {location && (
                    <>
                      <span className="hidden md:inline">·</span>
                      <MapPin className="h-3 w-3 flex-shrink-0 hidden md:block" />
                      <span className="hidden md:inline">{location}</span>
                    </>
                  )}
                </div>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <div
                  className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                    hasAnswers
                      ? "text-secondary bg-secondary/10 group-hover:bg-secondary/15"
                      : "text-muted-foreground"
                  }`}
                >
                  <MessageSquare className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                  <span>{answers}</span>
                </div>

                <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground transition-all duration-300 group-hover:bg-muted/50">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{displayViews}</span>
                </div>

                <button
                  onClick={handleBookmark}
                  aria-label={bookmarked ? "إزالة من المحفوظات" : "حفظ السؤال"}
                  aria-pressed={bookmarked}
                  className={`p-1 sm:p-1.5 rounded-lg transition-all touch-target ${
                    bookmarked
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  <Bookmark className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${bookmarked ? "fill-current" : ""}`} />
                </button>

                <button
                  onClick={handleShare}
                  aria-label="مشاركة السؤال"
                  className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all touch-target hidden xs:flex"
                >
                  <Share2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
