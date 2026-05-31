import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "motion/react";
import {
  PenSquare, Moon, Sun, Bell, Search, X, Zap, LogOut, ChevronDown, User, Shield
} from "lucide-react";
import { useAppState } from "../context/AppStateContext";

export function Header() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("khapeer_theme");
    return saved ? saved === "dark" : true;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, currentUser } = useAppState();
  const notifCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("khapeer_theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
      // Cmd/Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // First letter of name for avatar fallback
  const avatarLetter = currentUser?.name?.charAt(0) || "م";

  return (
    <>
      <header
        className={`sticky top-0 z-40 safe-area-top transition-all duration-300 ${scrolled
            ? "glass shadow-md border-b border-border/60"
            : "bg-background/80 backdrop-blur-xl border-b border-transparent"
          }`}
      >
        {/* Top accent line — only visible on scroll */}
        <div
          className={`absolute top-0 inset-x-0 h-[1px] transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"
            }`}
          style={{
            background: "linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent)",
          }}
        />

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-3">

          {/* ── Logo ──────────────────────────────────── */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2.5 group"
            aria-label="الرئيسية - خبير"
          >
            <div
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                background: "var(--primary)",
                boxShadow: "0 4px 14px -4px var(--primary)",
              }}
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white/20" />
              {/* Glow ring on hover */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-2 ring-primary/50 ring-offset-2 ring-offset-background" />
            </div>
            <div className="hidden xs:flex flex-col leading-none">
              <span className="text-base sm:text-lg font-extrabold text-primary tracking-tight font-heading">
                خبير
              </span>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground tracking-[0.12em] uppercase font-medium">
                مجتمع المعرفة
              </span>
            </div>
          </Link>

          {/* ── Desktop Search ─────────────────────────── */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-auto"
          >
            <div className="relative w-full group">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary" />
              <Input
                type="search"
                placeholder="ابحث في خبير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-14 h-10 rounded-full bg-muted/60 border-border/50 focus:bg-card focus:border-primary/50 transition-all text-sm"
              />
              <kbd className="absolute left-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background border border-border text-[10px] text-muted-foreground font-mono opacity-70 pointer-events-none">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          {/* ── Action cluster (Social Media Style) ──────── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme toggle */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-10 w-10 hidden xs:flex text-muted-foreground hover:bg-muted/60 transition-colors"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-[18px] w-[18px] text-secondary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-[18px] w-[18px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Mobile search */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full md:hidden h-10 w-10 text-muted-foreground hover:bg-muted/60 transition-colors"
              onClick={() => setSearchOpen(true)}
              aria-label="بحث"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications - Visible on all screens for social platform */}
            <Link
              to="/notifications"
              className="relative flex items-center justify-center h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/60 transition-colors group"
              aria-label={`الإشعارات${notifCount > 0 ? ` - ${notifCount} غير مقروء` : ""}`}
            >
              <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
              <AnimatePresence>
                {notifCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background badge-pulse"
                  />
                )}
              </AnimatePresence>
            </Link>

            {/* Ask — Desktop */}
            <Button
              asChild
              className="hidden md:flex h-10 px-5 rounded-full font-medium shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-gradient-to-tr from-primary to-primary/90 text-primary-foreground border border-primary/20 hover:shadow-lg"
            >
              <Link to="/questions/new">
                <PenSquare className="h-[18px] w-[18px] ml-2" />
                نشر جديد
              </Link>
            </Button>

            {/* Ask — Mobile icon (Social CTA style) */}
            {/* <Button
              asChild
              size="icon"
              className="md:hidden relative h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-primary/80 text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 border border-primary/20 overflow-hidden group"
              aria-label="إضافة منشور"
            >
              <Link to="/questions/new">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full" />
                <PenSquare className="h-5 w-5 relative z-10" />
              </Link>
            </Button> */}

            {/* User Profile Avatar OR Sign-in/Sign-up Buttons */}
            {currentUser && currentUser.id !== "1" && currentUser.username !== "guest" ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex-shrink-0 mr-1 sm:mr-2 relative group"
                  aria-label="قائمة المستخدم"
                >
                  <Avatar className="relative h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-transparent group-hover:ring-primary/40 transition-all duration-300 cursor-pointer shadow-sm">
                    <AvatarImage src={currentUser?.avatar || ""} />
                    <AvatarFallback className="bg-primary text-white font-bold text-xs sm:text-sm">
                      {avatarLetter}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-56 bg-card shadow-xl border border-border/60 rounded-2xl z-50 py-2 animate-in">
                      <div className="px-4 py-3 border-b border-border/40">
                        <p className="text-sm font-bold text-foreground truncate">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{currentUser?.username}</p>
                      </div>
                      <Link
                        to="/profile/me"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>ملفي الشخصي</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg]" />
                        <span>الإعدادات</span>
                      </Link>
                      {currentUser?.accountType === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span>لوحة التحكم</span>
                        </Link>
                      )}
                      <div className="border-t border-border/40 mt-1 pt-1">
                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            const { signOut } = await import("../../lib/services");
                            await signOut();
                            window.location.href = "/";
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="h-9 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Link to="/auth/login">تسجيل الدخول</Link>
                </Button>
                <Button
                  asChild
                  className="h-9 px-4 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-sm transition-all hover:scale-105 active:scale-95 border border-primary/20"
                >
                  <Link to="/auth/register">إنشاء حساب</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile search overlay ──────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col p-4 safe-area-top safe-area-bottom"
            style={{ background: "rgba(7, 18, 18, 0.92)", backdropFilter: "blur(16px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="البحث"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-6"
            >
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
                  <Input
                    autoFocus
                    type="search"
                    placeholder="ابحث هنا..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-12 h-13 rounded-2xl bg-white/8 border-white/12 text-white placeholder:text-white/40 text-base focus:border-primary/60 focus:bg-white/10"
                  />
                </div>
              </form>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl h-13 w-13 shrink-0 text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                aria-label="إغلاق البحث"
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.3 }}
            >
              <p className="text-xs text-white/40 mb-3 px-1 font-medium tracking-wide uppercase">عمليات بحث شائعة</p>
              <div className="flex flex-wrap gap-2 stagger">
                {["برمجة", "ذكاء اصطناعي", "تصميم", "React", "تعلم الآلة", "قواعد البيانات", "مطاعم", "أطباء"].map((s) => (
                  <button
                    key={s}
                    data-no-touch
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(s)}`);
                      setSearchOpen(false);
                    }}
                    className="px-3.5 py-2.5 rounded-full bg-white/8 border border-white/10 text-sm text-white/70 hover:bg-primary/20 hover:border-primary/40 hover:text-white transition-all duration-200 min-h-[44px] flex items-center animate-fade-in"
                  >
                    #{s}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
