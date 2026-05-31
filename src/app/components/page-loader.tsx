import { motion } from "motion/react";

/**
 * PageLoader — Premium skeleton fallback used by React.lazy() Suspense boundaries.
 * Renders a shimmer pattern that matches the app's glass card aesthetic so the
 * transition from loading → content feels seamless.
 */
export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full space-y-4 animate-fade-in"
      aria-busy="true"
      aria-label="جارٍ تحميل الصفحة"
    >
      {/* Top header bar skeleton */}
      <div className="premium-glass-card rounded-2xl p-5 border border-border/20 space-y-3">
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/5 rounded-lg" />
            <div className="skeleton h-3 w-1/4 rounded-lg" />
          </div>
        </div>
        <div className="skeleton h-6 w-3/4 rounded-lg" />
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-full rounded-lg" />
          <div className="skeleton h-3.5 w-5/6 rounded-lg" />
          <div className="skeleton h-3.5 w-4/6 rounded-lg" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-14 rounded-full" />
        </div>
      </div>

      {/* Content cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="premium-glass-card rounded-2xl p-5 border border-border/20 space-y-3"
          style={{ opacity: 1 - (i - 1) * 0.18 }}
        >
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-full shrink-0" />
            <div className="skeleton h-3.5 w-1/3 rounded-lg" />
            <div className="skeleton h-3 w-1/5 rounded-lg mr-auto" />
          </div>
          <div className="skeleton h-5 w-3/4 rounded-lg" />
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-full rounded-lg" />
            <div className="skeleton h-3 w-5/6 rounded-lg" />
          </div>
          <div className="flex justify-between items-center pt-1">
            <div className="flex gap-2">
              <div className="skeleton h-7 w-14 rounded-lg" />
              <div className="skeleton h-7 w-14 rounded-lg" />
            </div>
            <div className="skeleton h-7 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </motion.div>
  );
}
