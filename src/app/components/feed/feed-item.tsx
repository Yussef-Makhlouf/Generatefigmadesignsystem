import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { QuestionCard } from "../question-card";
import { useQuestionInteractions } from "../../../lib/hooks/use-question-interactions";
import { questionToCardProps } from "../../../lib/database.types";
import type { Question } from "../../../lib/database.types";
import { questionUrl } from "../seo";

interface FeedItemProps {
  question: Question;
  isBookmarked: boolean;
  userVote: "up" | "down" | null | undefined;
}

/**
 * Single feed item — wraps QuestionCard with motion animation
 * and connects to interaction hooks for voting/bookmarking.
 */
export function FeedItem({ question, isBookmarked, userVote }: FeedItemProps) {
  const navigate = useNavigate();
  const { voteQuestion, toggleBookmark } = useQuestionInteractions();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <QuestionCard
        {...questionToCardProps(question)}
        isBookmarked={isBookmarked}
        userVote={userVote}
        onVote={(dir) => voteQuestion(question.id, dir)}
        onBookmark={() => toggleBookmark(question.id)}
        onClick={() => navigate(questionUrl(question.id, question.title))}
      />
    </motion.div>
  );
}
