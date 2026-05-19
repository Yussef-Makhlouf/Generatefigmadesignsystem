import { Home, Search, Bell, User, Globe } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { useAppState } from "../context/AppStateContext";

const NAV_ITEMS = [
  { icon: Home,   label: "الرئيسية",  path: "/" },
  { icon: Search, label: "بحث",       path: "/search" },
  { icon: Globe,  label: "المساحات",  path: "/spaces" },
  { icon: Bell,   label: "إشعارات",   path: "/notifications" },
  { icon: User,   label: "حسابي",     path: "/profile/me" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { notifications } = useAppState();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-border/60"
      role="navigation"
      aria-label="التنقل الرئيسي"
    >
      {/* Safe area padding for iOS home indicator */}
      <div
        className="flex items-center justify-around px-1 sm:px-2"
        style={{ height: "calc(3.5rem + env(safe-area-inset-bottom, 0px))", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path);
          const showBadge = item.path === "/notifications" && unreadCount > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative"
            >
              <div className="relative flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center">
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 -m-1.5 rounded-xl bg-primary/10"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-destructive text-[8px] text-white font-bold border border-background">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9px] leading-none font-medium transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {/* Active bottom indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute bottom-0 h-0.5 w-6 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
