import * as React from "react";
import { cn } from "./utils";

export interface CardProps extends React.ComponentProps<"div"> {
  /**
   * Visual preset variant:
   * - 'default': standard premium card
   * - 'glass': premium ambient frosted glass
   * - 'gold': desert gold accented card for featured items
   * - 'surface': flat card with minor border
   */
  variant?: "default" | "glass" | "gold" | "surface";
  /**
   * Enable premium spring hover lift and shadow magnification.
   */
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="card"
        className={cn(
          "flex flex-col gap-6 rounded-2xl border text-card-foreground transition-all duration-280 ease-smooth relative overflow-hidden",
          // Variants
          variant === "default" && "bg-card border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary/20",
          variant === "glass" && "premium-glass-card",
          variant === "gold" && "premium-gold-card",
          variant === "surface" && "surface-card",
          // Hover lift
          hoverable && "card-hover cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-0 transition-opacity duration-500 pointer-events-none"
             style={{
               background: "radial-gradient(circle at top right, var(--primary-light) 0%, transparent 70%)"
             }}
        />
        {props.children}
      </div>
    );
  }
);
Card.displayName = "Card";

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}
CardHeader.displayName = "CardHeader";

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none font-heading font-bold text-neutral-900 dark:text-neutral-50", className)}
      {...props}
    />
  );
}
CardTitle.displayName = "CardTitle";

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
}
CardDescription.displayName = "CardDescription";

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}
CardAction.displayName = "CardAction";

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}
CardContent.displayName = "CardContent";

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
