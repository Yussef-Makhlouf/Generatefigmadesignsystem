import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface VoteButtonsProps {
  votes: number;
  userVote?: "up" | "down" | null;
  onVote?: (direction: "up" | "down") => void;
  className?: string;
  size?: "sm" | "md";
}

export function VoteButtons({
  votes: initialVotes,
  userVote: initialUserVote = null,
  onVote,
  className = "",
  size = "sm",
}: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialUserVote);

  // Sync with external prop changes (e.g. after DB refetch)
  useEffect(() => { setVotes(initialVotes); }, [initialVotes]);
  useEffect(() => { setUserVote(initialUserVote ?? null); }, [initialUserVote]);

  const handleVote = (direction: "up" | "down") => {
    let newVotes = votes;
    let newUserVote: "up" | "down" | null = direction;
    let msg = "";

    if (userVote === direction) {
      newVotes = direction === "up" ? votes - 1 : votes + 1;
      newUserVote = null;
      msg = "تم إلغاء التصويت";
    } else if (userVote) {
      newVotes = direction === "up" ? votes + 2 : votes - 2;
      msg = direction === "up" ? "↑ مفيد" : "↓ غير مفيد";
    } else {
      newVotes = direction === "up" ? votes + 1 : votes - 1;
      msg = direction === "up" ? "↑ مفيد" : "↓ غير مفيد";
    }

    setVotes(newVotes);
    setUserVote(newUserVote);
    onVote?.(direction);
    if (msg) toast(msg, { duration: 1200, position: "bottom-center" });
  };

  const iconSize = size === "md" ? "h-4 sm:h-5 w-4 sm:w-5" : "h-4 w-4";
  const btnSize = size === "md" ? "h-11 w-11" : "h-11 w-11 sm:h-9 sm:w-9";

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Up */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.12 }}
        onClick={(e) => { e.stopPropagation(); handleVote("up"); }}
        aria-label={userVote === "up" ? "إلغاء التصويت الإيجابي" : "تصويت إيجابي"}
        aria-pressed={userVote === "up"}
        className={`${btnSize} flex items-center justify-center rounded-xl border transition-all duration-300 ripple ${
          userVote === "up"
            ? "gradient-primary text-white border-primary shadow-primary shadow-md animate-pulse-ring"
            : "bg-muted/35 text-muted-foreground border-border/30 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        }`}
      >
        <ChevronUp className={iconSize} />
      </motion.button>

      {/* Count */}
      <AnimatePresence mode="wait">
        <motion.span
          key={votes}
          initial={{ scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={`text-[10px] sm:text-xs font-bold font-numbers min-w-[1.5rem] sm:min-w-[1.75rem] text-center vote-number ${
            userVote === "up"
              ? "text-primary"
              : userVote === "down"
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {votes}
        </motion.span>
      </AnimatePresence>

      {/* Down */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.12 }}
        onClick={(e) => { e.stopPropagation(); handleVote("down"); }}
        aria-label={userVote === "down" ? "إلغاء التصويت السلبي" : "تصويت سلبي"}
        aria-pressed={userVote === "down"}
        className={`${btnSize} flex items-center justify-center rounded-xl border transition-all duration-300 ripple ${
          userVote === "down"
            ? "bg-destructive text-white border-destructive shadow-md"
            : "bg-muted/35 text-muted-foreground border-border/30 hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
        }`}
      >
        <ChevronDown className={iconSize} />
      </motion.button>
    </div>
  );
}
