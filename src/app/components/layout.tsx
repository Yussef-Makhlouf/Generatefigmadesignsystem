import { Outlet, useLocation } from "react-router";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { FloatingActionButton } from "./floating-action-button";
import { motion, AnimatePresence } from "motion/react";

const FULL_WIDTH_ROUTES = ["/admin"];
const NO_SIDEBAR_ROUTES = ["/settings", "/help", "/notifications", "/saved", "/reputation", "/leaderboard"];

export function Layout() {
  const { pathname } = useLocation();
  const isFullWidth = FULL_WIDTH_ROUTES.some((r) => pathname.startsWith(r));
  const hideSidebar =
    NO_SIDEBAR_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/tags/") ||
    pathname.startsWith("/questions/") ||
    pathname.startsWith("/profile/");

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden transition-colors duration-300">
      {/* Decorative Premium Aurora Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/8 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-secondary/6 blur-[120px] pointer-events-none z-0" />
      <div className="absolute inset-0 arabic-geometric-mesh opacity-[0.25] dark:opacity-[0.15] pointer-events-none z-0" />

      <div className="relative z-10">
        <Header />

        {/* Main content wrapper with correct responsive max-widths and padding */}
        <div
          className={`mx-auto w-full ${
            isFullWidth ? "max-w-full px-0" : "max-w-7xl px-3 sm:px-4 md:px-6"
          }`}
        >
          <div className="flex gap-0 md:gap-5 lg:gap-6">
            {/* Desktop Sidebar — hidden below md */}
            {!isFullWidth && !hideSidebar && <DesktopSidebar />}

            {/* Main Content */}
            <main
              className={`flex-1 min-w-0 ${
                isFullWidth ? "" : "py-4 sm:py-5 md:py-6"
              } pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
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
  );
}
