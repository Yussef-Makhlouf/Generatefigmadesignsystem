import { Outlet, useLocation, ScrollRestoration } from "react-router";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { FloatingActionButton } from "./floating-action-button";
import { NavProgress } from "./nav-progress";
import { BgPattern } from "./bg-pattern";
import { IslamicStarIcon } from "./decorative/geometric-patterns";
import { motion } from "motion/react";
import { SEO, webSiteSchema, organizationSchema } from "./seo";

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

  const isQuestionDetail = pathname.startsWith("/questions/") && pathname !== "/questions/new";

  return (
    <>
      {/* ── Global SEO: WebSite + Organization schemas ── */}
      <SEO
        structuredData={[webSiteSchema(), organizationSchema()]}
      />

      {/* ── Scroll to top on every route change ────────── */}
      <ScrollRestoration />

      {/* ── Navigation progress shimmer ─────────────────── */}
      <NavProgress />

      <div className="min-h-screen bg-background relative overflow-x-hidden transition-colors duration-300">
        {/* ── Layered atmosphere: patterns + glow + mesh ── */}
        <BgPattern variant={1} opacity="subtle" fixed />
        <BgPattern variant={2} opacity="soft" fixed className="translate-x-[18%] -translate-y-[6%]" />
        <div className="fixed inset-0 bg-pattern-scrim pointer-events-none z-0" aria-hidden />
        
        {/* Ambient glow orbs — primary (top-right) */}
        <div
          className="pointer-events-none fixed top-[-8%] right-[-8%] w-[min(42%,520px)] h-[min(42%,520px)] rounded-full opacity-60 z-0 animate-breathe"
          style={{ background: "radial-gradient(circle, var(--primary-50) 0%, transparent 70%)" }}
        />
        
        {/* Ambient glow orbs — secondary (bottom-left) */}
        <div
          className="pointer-events-none fixed bottom-[15%] left-[-8%] w-[min(36%,440px)] h-[min(36%,440px)] rounded-full opacity-50 z-0 animate-breathe"
          style={{ background: "radial-gradient(circle, var(--secondary-50) 0%, transparent 70%)", animationDelay: "2s" }}
        />
        
        {/* Desert Luxury: Islamic star tessellation overlay (replaces dot grid) */}
        <div className="fixed inset-0 pattern-islamic-star pointer-events-none z-0" />

        {/* Desert Luxury: slow-rotating geometric watermark — very subtle */}
        {/* <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 animate-geo-rotate opacity-[0.04]">
          <IslamicStarIcon size={600} className="text-primary" />
        </div> */}

        {/* ── Main app shell ────────────────────────────── */}
        <div className="relative z-10">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:outline-none"
          >
            تخطي إلى المحتوى الرئيسي
          </a>
          <Header />

          <div
            className={`mx-auto w-full ${
              isFullWidth ? "max-w-full px-0" : "max-w-7xl px-3 sm:px-4 md:px-6"
            }`}
          >
            <div className="flex gap-0 md:gap-5 lg:gap-6">
              {/* Desktop sidebar */}
              {!isFullWidth && (
                <DesktopSidebar className={hideSidebar ? "md:hidden" : ""} />
              )}

              {/* Page content */}
              <main
                id="main-content"
                tabIndex={-1}
                className={`flex-1 min-w-0 ${
                  isFullWidth ? "" : "py-4 sm:py-5 md:py-6"
                } pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6`}
              >
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.26,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Outlet />
                </motion.div>
              </main>
            </div>
          </div>

          <BottomNav />
          {!isQuestionDetail && <FloatingActionButton />}
        </div>
      </div>
    </>
  );
}
