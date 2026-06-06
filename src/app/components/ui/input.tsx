import * as React from "react";
import { cn } from "./utils";

export interface InputProps extends React.ComponentProps<"input"> {
  /**
   * Optional helper to wrap input inside the premium glow container.
   */
  glow?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, glow = false, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "flex h-11 w-full min-w-0 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-base md:text-sm",
          "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50",
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "selection:bg-primary/20 selection:text-primary",
          "outline-none transition-all duration-300 ease-smooth",
          // Hover State
          "hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm",
          // Focus State — enhanced with ring and subtle lift
          "focus:border-primary focus:ring-4 focus:ring-primary/10 focus:shadow-md",
          // Disabled state
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          // Invalid state
          "aria-invalid:border-destructive aria-invalid:ring-destructive/10",
          className
        )}
        {...props}
      />
    );

    if (glow) {
      return (
        <div className="input-glow rounded-xl transition-shadow duration-280 ease-smooth">
          {inputElement}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = "Input";

export { Input };
