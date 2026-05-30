import { useEffect, useRef } from "react";
import { useNavigation } from "react-router";

/**
 * NavProgress — Top-line shimmer bar that fires on every route change.
 * Simulates real backend data-fetch latency for a premium feel.
 */
export function NavProgress() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    if (isLoading) {
      // Reset and start
      bar.style.transition = "none";
      bar.style.opacity = "1";
      bar.style.width = "0%";

      // Force reflow
      void bar.offsetWidth;

      // Animate to 80% smoothly
      bar.style.transition = "width 400ms cubic-bezier(0.22, 1, 0.36, 1)";
      bar.style.width = "78%";

      // Continue creeping towards 95%
      timerRef.current = setTimeout(() => {
        bar.style.transition = "width 8000ms cubic-bezier(0.1, 0.8, 0.2, 1)";
        bar.style.width = "95%";
      }, 450);
    } else {
      // Complete
      if (timerRef.current) clearTimeout(timerRef.current);
      bar.style.transition = "width 150ms cubic-bezier(0.22, 1, 0.36, 1)";
      bar.style.width = "100%";

      timerRef.current = setTimeout(() => {
        bar.style.transition = "opacity 250ms ease";
        bar.style.opacity = "0";
        timerRef.current = setTimeout(() => {
          bar.style.width = "0%";
        }, 260);
      }, 160);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2.5px",
        zIndex: 9999,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      
      <div
        ref={barRef}
        style={{
          height: "100%",
          width: "0%",
          opacity: 0,
          background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)",
          boxShadow: "0 0 10px var(--primary), 0 0 5px var(--secondary)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}
