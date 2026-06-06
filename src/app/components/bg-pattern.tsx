import { cn } from "./ui/utils";

type PatternVariant = 1 | 2 | 3;

interface BgPatternProps {
  variant?: PatternVariant;
  className?: string;
  /** 0–1 opacity multiplier applied via CSS variable */
  opacity?: "subtle" | "soft" | "medium";
  fixed?: boolean;
}

const OPACITY_CLASS = {
  subtle: "bg-pattern--subtle",
  soft: "bg-pattern--soft",
  medium: "bg-pattern--medium",
} as const;

export function BgPattern({
  variant = 1,
  className,
  opacity = "soft",
  fixed = false,
}: BgPatternProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none select-none bg-pattern",
        `bg-pattern--${variant}`,
        OPACITY_CLASS[opacity],
        fixed ? "fixed inset-0 z-0" : "absolute inset-0",
        className
      )}
    />
  );
}
