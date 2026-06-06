import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

/**
 * Khapeer Button — Premium Design System Component
 * Variants: default · secondary · gold · destructive · outline · ghost · link · icon-only
 * Sizes: sm · default · lg · xl · icon
 */
const buttonVariants = cva(
  // ── Base ────────────────────────────────────────────
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "transition-all disabled:pointer-events-none disabled:opacity-50 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "shrink-0 outline-none relative overflow-hidden",
    // Spring lift on hover
    "hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        // ── Primary — Emerald of Wisdom ────────────────
        default: [
          "bg-primary text-primary-foreground border border-transparent",
          "hover:bg-primary-hover shadow-[var(--shadow-primary)]",
          "hover:shadow-[var(--shadow-primary-lg),var(--shadow-emerald)]",
          "active:bg-primary active:scale-[0.97]",
          "relative overflow-hidden group",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out",
        ].join(" "),

        // ── Gold — Desert Gold CTA ─────────────────────
        gold: [
          "bg-secondary text-secondary-foreground border border-transparent",
          "hover:bg-secondary-hover shadow-[var(--shadow-secondary)]",
          "hover:shadow-[var(--shadow-secondary-lg),var(--shadow-gold)]",
          "active:bg-secondary active:scale-[0.97]",
          "relative overflow-hidden group",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent",
          "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out",
        ].join(" "),

        // ── Destructive ────────────────────────────────
        destructive: [
          "bg-destructive text-white border border-transparent",
          "hover:bg-destructive/90 shadow-sm",
          "focus-visible:ring-destructive/30",
        ].join(" "),

        // ── Outline ────────────────────────────────────
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:border-primary hover:bg-primary/5 hover:text-primary",
          "dark:hover:bg-primary/10",
          "transition-all duration-300",
          "hover:shadow-[var(--shadow-primary)]",
        ].join(" "),

        // ── Secondary (surface) ────────────────────────
        secondary: [
          "bg-muted text-foreground border border-border",
          "hover:bg-accent hover:border-border-strong",
        ].join(" "),

        // ── Ghost ──────────────────────────────────────
        ghost: [
          "bg-transparent text-foreground border border-transparent",
          "hover:bg-accent hover:text-accent-foreground",
          "dark:hover:bg-accent/50",
          "hover:translate-y-0", // override lift — ghost stays flat
        ].join(" "),

        // ── Link ───────────────────────────────────────
        link: [
          "text-primary underline-offset-4 hover:underline",
          "border-0 bg-transparent p-0 h-auto",
          "hover:translate-y-0", // no lift
        ].join(" "),
      },

      size: {
        sm:   "h-8 rounded-lg px-3 text-xs gap-1.5",
        default: "h-10 rounded-xl px-4 text-sm",
        lg:   "h-11 rounded-xl px-6 text-sm",
        xl:   "h-12 rounded-2xl px-8 text-base",
        icon: "size-9 rounded-xl p-0",
        "icon-sm": "size-7 rounded-lg p-0",
      },

      loading: {
        true: "cursor-not-allowed opacity-70",
        false: "",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size, loading, className }),
          "ripple" // ripple effect from index.css
        )}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="animate-spin h-4 w-4 border-2 rounded-full shrink-0"
              style={{
                borderColor: "currentColor transparent transparent transparent",
              }}
            />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
