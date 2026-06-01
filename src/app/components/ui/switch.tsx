"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base layout & sizing — generous enough for 44px touch target
        "peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        // Color states
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
        // Transition & outline
        "transition-colors duration-200 ease-in-out outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Size & shape
          "pointer-events-none block size-4 rounded-full shadow-sm ring-0",
          // Colour
          "bg-white",
          // LTR translation
          "transition-transform duration-200 ease-in-out",
          // LTR: unchecked = start (left), checked = end (right)
          "data-[state=unchecked]:translate-x-0",
          "data-[state=checked]:translate-x-5",
          // RTL: unchecked = start (right side = 0), checked = end (move left)
          "rtl:data-[state=unchecked]:translate-x-0",
          "rtl:data-[state=checked]:-translate-x-5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
