import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface VoteButtonsProps {
  votes: number;
  userVote?: "up" | "down" | null;
  onVote?: (direction: "up" | "down") => void;
  className?: string;
}

export function VoteButtons({
  votes: initialVotes,
  userVote: initialUserVote = null,
  onVote,
  className = "",
}: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialUserVote);

  const handleVote = (direction: "up" | "down") => {
    let newVotes = votes;
    let newUserVote: "up" | "down" | null = direction;
    let toastMessage = "";

    if (userVote === direction) {
      // Remove vote
      newVotes = direction === "up" ? votes - 1 : votes + 1;
      newUserVote = null;
      toastMessage = "تم إلغاء التصويت";
    } else if (userVote) {
      // Change vote
      newVotes = direction === "up" ? votes + 2 : votes - 2;
      toastMessage = direction === "up" ? "تم التصويت: مفيد" : "تم التصويت: غير مفيد";
    } else {
      // New vote
      newVotes = direction === "up" ? votes + 1 : votes - 1;
      toastMessage = direction === "up" ? "تم التصويت: مفيد" : "تم التصويت: غير مفيد";
    }

    setVotes(newVotes);
    setUserVote(newUserVote);
    onVote?.(direction);

    // Show toast feedback
    if (toastMessage) {
      toast.success(toastMessage, {
        duration: 1500,
        position: "bottom-center"
      });
    }
  };

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 rounded-full transition-all ${
            userVote === "up"
              ? "text-primary bg-primary/10 hover:bg-primary/20 shadow-sm shadow-primary/20"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleVote("up");
          }}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      </motion.div>
      
      <motion.span
        key={votes}
        initial={{ scale: 1.2, color: userVote === "up" ? "#2563EB" : userVote === "down" ? "#EF4444" : "#6B7280" }}
        animate={{ scale: 1, color: userVote === "up" ? "#2563EB" : userVote === "down" ? "#EF4444" : "#6B7280" }}
        className="text-sm font-semibold min-w-[2rem] text-center"
      >
        {votes}
      </motion.span>
      
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 rounded-full transition-all ${
            userVote === "down"
              ? "text-destructive bg-destructive/10 hover:bg-destructive/20 shadow-sm shadow-destructive/20"
              : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleVote("down");
          }}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
