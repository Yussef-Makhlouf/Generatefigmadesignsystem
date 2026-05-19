import { Button } from "./ui/button";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl gradient-soft border border-primary/15 flex items-center justify-center shadow-sm animate-float">
          <Icon className="h-9 w-9 text-primary opacity-80" />
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-7 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="rounded-xl gradient-primary border-0 shadow-sm px-6"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
