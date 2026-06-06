import { type ReactNode } from "react";
import { Navigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Shield, LogIn, Crown, Lock, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useIsAuthenticated, useIsAdmin } from "../../lib/hooks/use-auth-session";
import { NotFoundPage } from "../pages/not-found";

type RequiredRole = "user" | "admin";

interface ProtectedRouteProps {
  children: ReactNode;
  require?: RequiredRole;
  /** If true, redirect to /auth/login instead of showing modal */
  redirectOnFail?: boolean;
}

/**
 * ProtectedRoute — Elegant role-based access guard.
 * Shows a premium animated modal in Arabic when access is denied.
 * Fully backend-ready: swap `currentUser` with real JWT/session checks.
 */
export function ProtectedRoute({
  children,
  require = "user",
  redirectOnFail = false,
}: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();

  const hasAccess =
    require === "user"
      ? isAuthenticated
      : require === "admin"
      ? isAuthenticated && isAdmin
      : false;

  if (!hasAccess && redirectOnFail) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!hasAccess) {
    if (require === "admin") {
      return <NotFoundPage />;
    }
    return <AccessDeniedOverlay role={require} />;
  }

  return <>{children}</>;
}

/* ─── Access Denied Overlay ─────────────────────────── */
function AccessDeniedOverlay({ role }: { role: RequiredRole }) {
  const isAdminOnly = role === "admin";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 backdrop-premium"
      >
        {/* Background ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-secondary/6 blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative w-full max-w-sm"
        >
          <div
            className="relative rounded-[var(--radius-2xl)] overflow-hidden border border-white/10 shadow-2xl"
            style={{ background: "linear-gradient(160deg, hsl(180, 22%, 8%) 0%, hsl(170, 95%, 6%) 100%)" }}
          >
            {/* Top accent stripe */}
            <div
              className="absolute top-0 inset-x-0 h-0.5"
              style={{ background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)" }}
            />

            {/* Content */}
            <div className="px-7 pt-10 pb-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="inline-flex items-center justify-center mb-5"
              >
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-ring"
                    style={{ background: isAdminOnly ? "var(--secondary)" : "var(--primary)" }}
                  >
                    {isAdminOnly
                      ? <Crown className="h-8 w-8 text-white" />
                      : <Lock className="h-8 w-8 text-white" />
                    }
                  </div>
                  {/* Halo ring */}
                  <div
                    className="absolute inset-[-6px] rounded-[1.25rem] border opacity-30"
                    style={{ borderColor: isAdminOnly ? "var(--secondary)" : "var(--primary)" }}
                  />
                </div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4 }}
              >
                <h2 className="text-xl font-bold text-white mb-2 font-heading leading-snug">
                  {isAdminOnly ? "هذه المنطقة للمشرفين فقط" : "سجّل دخولك أولاً"}
                </h2>
                <p className="text-sm text-white/55 leading-relaxed mb-7">
                  {isAdminOnly
                    ? "صلاحيات لوحة التحكم محجوزة للمشرفين. إذا كنت مشرفاً، تواصل مع فريق الدعم."
                    : "للوصول لهذه الصفحة يجب أن تكون عضواً في مجتمع خبير. الانضمام مجاني وفوري."}
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.30, duration: 0.4 }}
                className="flex flex-col gap-3"
              >
                {!isAdminOnly && (
                  <Button
                    asChild
                    className="w-full h-11 rounded-xl border-0 font-bold text-white ripple"
                    style={{ background: "linear-gradient(135deg, var(--primary) 0%, hsl(168, 88%, 40%) 100%)", boxShadow: "var(--shadow-primary)" }}
                  >
                    <a href="/auth/register">
                      <LogIn className="h-4 w-4 ml-2" />
                      انضم مجاناً الآن
                    </a>
                  </Button>
                )}

                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-10 rounded-xl text-white/60 hover:text-white hover:bg-white/8 text-sm"
                >
                  <a href="/">
                    <ChevronLeft className="h-4 w-4 ml-1.5 flip-rtl" />
                    العودة للرئيسية
                  </a>
                </Button>
              </motion.div>
            </div>

            {/* Footer shield badge */}
            <div className="border-t border-white/8 px-7 py-3 flex items-center justify-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[11px] text-white/30">محمي بواسطة نظام الصلاحيات</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
