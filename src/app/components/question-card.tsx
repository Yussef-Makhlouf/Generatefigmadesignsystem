import { Link } from "react-router";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSquare, Bookmark, Share2, MapPin, Eye } from "lucide-react";
import { VoteButtons } from "./vote-buttons";
import { useState } from "react";
import { toast } from "sonner";

interface QuestionCardProps {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
    reputation: number;
  };
  votes: number;
  answers: number;
  tags: string[];
  location?: string;
  timestamp: string;
  isBookmarked?: boolean;
  views?: number;
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
  onVote,
  onShare,
  onClick,
}: QuestionCardProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "تم إزالة السؤال من المحفوظات" : "تم حفظ السؤال", {
      duration: 1500,
      position: "bottom-center",
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + `/questions/${id}`);
    toast.success("تم نسخ رابط السؤال", { duration: 1500, position: "bottom-center" });
    onShare?.();
  };

  const hasAnswers = answers > 0;
  const displayViews = views || Math.floor(Math.abs(votes) * 8 + answers * 15 + 50);

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer border border-border/60 bg-card card-hover animate-fade-in"
      style={{ borderRadius: "var(--radius-lg)" }}
      onClick={onClick}
    >
      {/* Top accent hover line */}
      <div className="absolute top-0 inset-x-0 h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-3 sm:p-5">
        <div className="flex gap-2 sm:gap-4">
          {/* Vote Column */}
          <div className="flex-shrink-0 pt-0.5">
            <VoteButtons votes={votes} onVote={onVote} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm sm:text-base font-semibold leading-relaxed mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
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
                    className="rounded-full text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer border-0 font-normal tag-pill"
                  >
                    #{tag}
                  </Badge>
                </Link>
              ))}
              {tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 bg-muted border-0 font-normal"
                >
                  +{tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Author */}
              <Link
                to={`/profile/${author.name}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity min-w-0"
              >
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                  <AvatarImage src={author.avatar} />
                  <AvatarFallback className="text-[9px] sm:text-[10px] gradient-primary text-white font-bold">
                    {author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground min-w-0">
                  <span className="font-medium text-foreground truncate max-w-[80px] sm:max-w-none">{author.name}</span>
                  <span className="hidden xs:inline">·</span>
                  <span className="hidden xs:inline truncate">{timestamp}</span>
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
                  className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium ${
                    hasAnswers
                      ? "text-secondary bg-secondary/10"
                      : "text-muted-foreground"
                  }`}
                >
                  <MessageSquare className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                  <span>{answers}</span>
                </div>

                <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{displayViews}</span>
                </div>

                <button
                  onClick={handleBookmark}
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
