import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageSquare, Bookmark, Share2, MapPin } from "lucide-react";
import { VoteButtons } from "./vote-buttons";

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
  onVote?: (direction: "up" | "down") => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onClick?: () => void;
}

export function QuestionCard({
  title,
  description,
  author,
  votes,
  answers,
  tags,
  location,
  timestamp,
  isBookmarked = false,
  onVote,
  onBookmark,
  onShare,
  onClick,
}: QuestionCardProps) {
  return (
    <Card 
      className="p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer bg-card"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex-shrink-0">
          <VoteButtons votes={votes} onVote={onVote} />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-card-foreground mb-2 leading-relaxed">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="rounded-full text-xs px-3 py-1"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={author.avatar} />
                <AvatarFallback className="text-xs">
                  {author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{author.name}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{timestamp}</span>
              {location && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{location}</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark?.();
                }}
              >
                <MessageSquare className="h-4 w-4 ml-1" />
                <span className="text-xs">{answers}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${
                  isBookmarked ? "text-primary" : "text-muted-foreground"
                } hover:text-primary`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark?.();
                }}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
