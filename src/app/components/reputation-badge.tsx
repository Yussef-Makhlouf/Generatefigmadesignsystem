import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Zap, Star, Shield, Crown, Flame, Sparkles } from "lucide-react";

interface ReputationBadgeProps {
  points: number;
  className?: string;
  showLabel?: boolean;
}

const TIERS = [
  { min: 0,    max: 100,  name: "مبتدئ",  icon: Zap,      bg: "bg-muted text-foreground/75", border: "border-border" },
  { min: 100,  max: 500,  name: "عضو",    icon: Star,     bg: "bg-primary/5 text-primary", border: "border-primary/20" },
  { min: 500,  max: 1000, name: "مساهم",  icon: Shield,   bg: "bg-primary/10 text-primary", border: "border-primary/35" },
  { min: 1000, max: 2500, name: "خبير",   icon: Flame,    bg: "bg-primary/15 text-primary shadow-sm shadow-primary/10", border: "border-primary/50" },
  { min: 2500, max: 5000, name: "محترف",  icon: Crown,    bg: "bg-secondary/10 text-secondary shadow-sm shadow-secondary/10", border: "border-secondary/40" },
  { min: 5000, max: Infinity, name: "أسطورة", icon: Sparkles, bg: "bg-secondary/15 text-secondary shadow-md shadow-secondary/20 relative overflow-hidden gold-shimmer-effect", border: "border-secondary/60 animate-pulse-gold" },
];

export function ReputationBadge({ points, className = "", showLabel = true }: ReputationBadgeProps) {
  const tier = TIERS.find((t) => points >= t.min && points < t.max) ?? TIERS[0];
  const Icon = tier.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold cursor-default select-none ${tier.bg} ${tier.border} ${className}`}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="tabular-nums">{points.toLocaleString("ar-SA")}</span>
            {showLabel && <span className="opacity-70">نقطة</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>المستوى: <strong>{tier.name}</strong></p>
          {tier.max < Infinity && (
            <p className="text-white">
              {(tier.max - points).toLocaleString("ar-SA")} نقطة للمستوى التالي
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
