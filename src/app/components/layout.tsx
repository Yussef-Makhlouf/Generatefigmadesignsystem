import { Outlet, useLocation } from "react-router";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { FloatingActionButton } from "./floating-action-button";

const FULL_WIDTH_ROUTES = ["/admin"];
const NO_SIDEBAR_ROUTES = ["/settings", "/help", "/notifications", "/saved", "/reputation", "/leaderboard"];

export function Layout() {
  const { pathname } = useLocation();
  const isFullWidth = FULL_WIDTH_ROUTES.some((r) => pathname.startsWith(r));
  const hideSidebar = NO_SIDEBAR_ROUTES.some((r) => pathname.startsWith(r)) || pathname.startsWith("/tags/") || pathname.startsWith("/questions/") || pathname.startsWith("/profile/");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className={`mx-auto ${isFullWidth ? "max-w-full" : "max-w-7xl"} px-0 sm:px-3 md:px-4`}>
        <div className="flex gap-0 md:gap-4">
          {/* Desktop Sidebar */}
          {!isFullWidth && !hideSidebar && <DesktopSidebar />}

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-16 sm:pb-20 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      <BottomNav />
      <FloatingActionButton />
    </div>
  );
}
