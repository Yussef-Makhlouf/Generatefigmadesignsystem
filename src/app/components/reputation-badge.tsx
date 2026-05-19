import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Zap, Star, Shield, Crown, Flame, Sparkles } from "lucide-react";

interface ReputationBadgeProps {
  points: number;
  className?: string;
  showLabel?: boolean;
}

const TIERS = [
  { min: 0,    max: 100,  name: "مبتدئ",  icon: Zap,      bg: "bg-slate-100 dark:bg-slate-800",   text: "text-slate-600 dark:text-slate-300",  border: "border-slate-200 dark:border-slate-700" },
  { min: 100,  max: 500,  name: "عضو",    icon: Star,     bg: "bg-blue-50 dark:bg-blue-950",     text: "text-blue-700 dark:text-blue-300",    border: "border-blue-200 dark:border-blue-800" },
  { min: 500,  max: 1000, name: "مساهم",  icon: Shield,   bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
  { min: 1000, max: 2500, name: "خبير",   icon: Flame,    bg: "bg-teal-50 dark:bg-teal-950",     text: "text-teal-700 dark:text-teal-300",    border: "border-teal-200 dark:border-teal-800" },
  { min: 2500, max: 5000, name: "محترف",  icon: Crown,    bg: "bg-amber-50 dark:bg-amber-950",   text: "text-amber-700 dark:text-amber-300",  border: "border-amber-200 dark:border-amber-800" },
  { min: 5000, max: Infinity, name: "أسطورة", icon: Sparkles, bg: "bg-rose-50 dark:bg-rose-950", text: "text-rose-700 dark:text-rose-300",    border: "border-rose-200 dark:border-rose-800" },
];

export function ReputationBadge({ points, className = "", showLabel = true }: ReputationBadgeProps) {
  const tier = TIERS.find((t) => points >= t.min && points < t.max) ?? TIERS[0];
  const Icon = tier.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold cursor-default select-none ${tier.bg} ${tier.text} ${tier.border} ${className}`}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="tabular-nums">{points.toLocaleString("ar-SA")}</span>
            {showLabel && <span className="opacity-70">نقطة</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>المستوى: <strong>{tier.name}</strong></p>
          {tier.max < Infinity && (
            <p className="text-muted-foreground">
              {(tier.max - points).toLocaleString("ar-SA")} نقطة للمستوى التالي
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
