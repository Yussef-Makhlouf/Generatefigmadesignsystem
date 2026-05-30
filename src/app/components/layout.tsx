import { Outlet, useLocation, ScrollRestoration } from "react-router";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { FloatingActionButton } from "./floating-action-button";
import { NavProgress } from "./nav-progress";
import { motion, AnimatePresence } from "motion/react";

const FULL_WIDTH_ROUTES = ["/admin"];
const NO_SIDEBAR_ROUTES = [
  "/settings",
  "/help",
  "/notifications",
  "/saved",
  "/reputation",
  "/leaderboard",
];

export function Layout() {
  const { pathname } = useLocation();

  const isFullWidth = FULL_WIDTH_ROUTES.some((r) => pathname.startsWith(r));
  const hideSidebar =
    NO_SIDEBAR_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/tags/") ||
    pathname.startsWith("/questions/") ||
    pathname.startsWith("/profile/");

  return (
    <>
      {/* ── Scroll to top on every route change ────────── */}
      <ScrollRestoration />

      {/* ── Navigation progress shimmer ─────────────────── */}
      <NavProgress />

      <div className="min-h-screen bg-background relative overflow-x-hidden transition-colors duration-300">
        {/* ── Ambient background glow orbs ─────────────── */}
        <div
          className="pointer-events-none fixed top-[-8%] right-[-8%] w-[42%] h-[42%] rounded-full opacity-60 z-0"
          style={{ background: "radial-gradient(circle, var(--primary-50) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none fixed bottom-[15%] left-[-8%] w-[36%] h-[36%] rounded-full opacity-50 z-0"
          style={{ background: "radial-gradient(circle, var(--secondary-50) 0%, transparent 70%)" }}
        />

        {/* ── Arabic geometric dot mesh ─────────────────── */}
        <div className="fixed inset-0 arabic-geometric-mesh opacity-[0.22] dark:opacity-[0.12] pointer-events-none z-0" />

        {/* ── Main app shell ────────────────────────────── */}
        <div className="relative z-10">
          <Header />

          <div
            className={`mx-auto w-full ${
              isFullWidth ? "max-w-full px-0" : "max-w-7xl px-3 sm:px-4 md:px-6"
            }`}
          >
            <div className="flex gap-0 md:gap-5 lg:gap-6">
              {/* Desktop sidebar */}
              {!isFullWidth && !hideSidebar && <DesktopSidebar />}

              {/* Page content */}
              <main
                className={`flex-1 min-w-0 ${
                  isFullWidth ? "" : "py-4 sm:py-5 md:py-6"
                } pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      duration: 0.26,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>

          <BottomNav />
          <FloatingActionButton />
        </div>
      </div>
    </>
  );
}
