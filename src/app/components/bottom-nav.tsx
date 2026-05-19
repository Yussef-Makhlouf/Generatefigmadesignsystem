import { Home, Search, Bell, User, Globe } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";

const NAV_ITEMS = [
  { icon: Home,   label: "الرئيسية",  path: "/" },
  { icon: Search, label: "بحث",       path: "/search" },
  { icon: Globe,  label: "المساحات",  path: "/spaces" },
  { icon: Bell,   label: "إشعارات",   path: "/notifications" },
  { icon: User,   label: "حسابي",     path: "/profile/me" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-border/60 safe-area-bottom">
      <div className="flex items-center justify-around h-14 sm:h-16 px-1 sm:px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 relative touch-target"
            >
              <div className="relative flex flex-col items-center gap-0.5">
                {isActive && (
                  <motion.div
                    layoutId="nav-active-bg"
                    className="absolute inset-0 -m-1 sm:-m-1.5 rounded-xl gradient-primary opacity-10"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <Icon
                  className={`h-4.5 sm:h-5 w-4.5 sm:w-5 transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[8px] sm:text-[9px] leading-none font-medium transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {/* Active dot */}
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-0 h-0.5 w-6 sm:w-8 gradient-primary rounded-full"
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
