import { Link } from "react-router";
import { PenSquare } from "lucide-react";
import { motion } from "motion/react";

export function FloatingActionButton() {
  return (
    <motion.div
      className="fixed bottom-16 sm:bottom-20 left-3 sm:left-4 md:hidden z-40"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
    >
      <Link
        to="/questions/new"
        className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl gradient-primary shadow-primary shadow-lg animate-pulse-ring"
        aria-label="اطرح سؤالاً"
      >
        <PenSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </Link>
    </motion.div>
  );
}
