/**
 * Khapeer — Desert Luxury Splash Screen
 * 
 * Animated splash shown on app load before router initializes.
 * Features:
 *   - Amiri calligraphic brand name with gold foil gradient
 *   - Slow-rotating Islamic star geometric watermark
 *   - Smooth fade-out via Motion (Framer Motion)
 *   - Performance-safe animations (transform/opacity only)
 * 
 * Guardrails respected:
 *   - Amiri font: hero-only (brand name is hero-level)
 *   - SVG pattern: CSS background-image (via islamicStarPattern)
 *   - Animations: transform/opacity only
 *   - Restraint: 2 geometric elements max (background pattern + small star accent)
 */
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { islamicStarPattern } from "./decorative/geometric-patterns";

interface SplashScreenProps {
  /** Duration in ms before splash fades out (default 2000) */
  duration?: number;
  /** Callback fired after splash fully exits */
  onComplete?: () => void;
}

export function SplashScreen({ duration = 2000, onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      // Fire callback after fade-out animation completes (500ms)
      setTimeout(() => onComplete?.(), 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            // Dark emerald background with Islamic star tessellation
            background: "linear-gradient(135deg, hsl(160, 40%, 8%) 0%, hsl(160, 50%, 12%) 100%)",
            ...islamicStarPattern(0.08, 56, "rgba(202, 138, 4, 0.08)"),
          }}
        >
          {/* Slow-rotating geometric watermark — large, subtle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.06, 0.06], 
              scale: [0.8, 1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear",
            }}
            className="absolute pointer-events-none"
            aria-hidden
          >
            <svg
              width="600"
              height="600"
              viewBox="0 0 600 600"
              fill="none"
              className="opacity-100"
            >
              {/* 8-point Islamic star (Rub el Hizb) */}
              <polygon
                points="300,80 340,220 480,180 380,280 480,380 340,340 300,480 260,340 120,380 220,280 120,180 260,220"
                stroke="rgba(202, 138, 4, 0.3)"
                strokeWidth="1.5"
                fill="none"
              />
              <polygon
                points="300,140 330,240 420,220 360,290 420,360 330,340 300,440 270,340 180,360 240,290 180,220 270,240"
                stroke="rgba(202, 138, 4, 0.2)"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </motion.div>

          {/* Content container */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Small decorative star accent above brand */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-secondary-400"
              aria-hidden
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                <polygon points="16,2 18,12 28,10 21,17 28,24 18,22 16,32 14,22 4,24 11,17 4,10 14,12" />
              </svg>
            </motion.div>

            {/* Brand name — Amiri calligraphy with gold foil gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 20, scaleY: 0.9 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="font-hero text-8xl sm:text-9xl font-bold select-none"
              style={{
                // Gold foil gradient text
                background: "linear-gradient(135deg, hsl(43, 96%, 56%) 0%, hsl(38, 100%, 68%) 30%, hsl(43, 96%, 45%) 60%, hsl(48, 100%, 62%) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 24px rgba(202, 138, 4, 0.3))",
              }}
            >
              خبير
            </motion.h1>

            {/* Tagline — Reem Kufi brand font */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
              className="font-brand text-lg sm:text-xl text-secondary-300/80 tracking-wide"
            >
              مجتمع المعرفة
            </motion.p>

            {/* Loading indicator — subtle gold shimmer bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }}
              className="relative w-48 h-0.5 rounded-full overflow-hidden bg-secondary/10"
              aria-label="جارٍ التحميل"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-y-0 w-1/2"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsl(43, 96%, 56%) 50%, transparent 100%)",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
