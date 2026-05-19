import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  PenSquare,
  Moon,
  Sun,
  Bell,
  Search,
  X,
  Zap,
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
  const navigate = useNavigate();
  const { notifications } = useAppState();
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

  // Close search on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
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

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass shadow-md" : "bg-card/90 backdrop-blur-md"
        } border-b border-border safe-area-top`}
      >
        {/* ── Header row ── */}
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-3">

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2 group"
            aria-label="الرئيسية - خبير"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center shadow-primary shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            {/* Brand name: hidden on tiny screens, visible on xs+ */}
            <div className="flex flex-col leading-none hidden xs:flex">
              <span className="text-base sm:text-lg font-bold text-primary tracking-tight">
                خبير
              </span>
              <span className="text-[8px] sm:text-[9px] text-muted-foreground tracking-widest uppercase">
                منصة المعرفة
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-auto"
          >
            <div className="relative w-full input-glow rounded-xl">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="ابحث عن سؤال، وسم، أو مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-4 h-10 rounded-xl bg-muted/60 border-border/60 focus:bg-card transition-colors text-sm"
              />
            </div>
          </form>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1">

            {/* Mobile Search Button */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl md:hidden h-9 w-9 hover:bg-muted"
              onClick={() => setSearchOpen(true)}
              aria-label="بحث"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Ask Question — Desktop text button */}
            <Button
              asChild
              className="hidden md:flex rounded-xl h-9 px-4 bg-primary border-0 shadow-primary shadow-sm hover:bg-primary/90 transition-all text-sm font-semibold text-white"
            >
              <Link to="/questions/new">
                <PenSquare className="h-4 w-4 ml-2" />
                اسأل سؤالاً
              </Link>
            </Button>

            {/* Ask Question — Mobile icon button */}
            <Button
              asChild
              size="icon"
              className="md:hidden rounded-xl h-9 w-9 bg-primary border-0 text-white hover:bg-primary/90"
              aria-label="اطرح سؤالاً"
            >
              <Link to="/questions/new">
                <PenSquare className="h-4 w-4" />
              </Link>
            </Button>

            {/* Dark / Light Toggle */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl h-9 w-9 hover:bg-muted hidden xs:flex"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            >
              {isDark
                ? <Sun className="h-4 w-4 text-amber-400" />
                : <Moon className="h-4 w-4" />
              }
            </Button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative hidden xs:block"
              aria-label={`الإشعارات ${notifCount > 0 ? `- ${notifCount} غير مقروء` : ""}`}
            >
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl h-9 w-9 hover:bg-muted"
              >
                <Bell className="h-4 w-4" />
              </Button>
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-[9px] text-white font-bold border-2 border-card badge-pulse">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <Link to="/profile/me" className="flex-shrink-0" aria-label="ملفي الشخصي">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200 cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-white font-bold text-xs sm:text-sm">
                  م
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay — Full Screen */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-background/97 backdrop-blur-sm flex flex-col p-4 animate-scale-in safe-area-top safe-area-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="البحث"
        >
          {/* Search input row */}
          <div className="flex items-center gap-3 mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative input-glow rounded-xl">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  type="search"
                  placeholder="ابحث هنا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 h-12 rounded-xl bg-muted border-0 text-base"
                />
              </div>
            </form>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl h-12 w-12 shrink-0"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              aria-label="إغلاق البحث"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick suggestions */}
          <p className="text-xs text-muted-foreground mb-3 px-1">عمليات البحث الشائعة</p>
          <div className="flex flex-wrap gap-2 stagger animate-fade-in">
            {["برمجة", "ذكاء اصطناعي", "تصميم", "React", "تعلم الآلة", "قواعد البيانات", "مطاعم", "أطباء"].map((s) => (
              <button
                key={s}
                data-no-touch
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(s)}`);
                  setSearchOpen(false);
                }}
                className="px-3 py-2 rounded-full bg-muted text-sm text-foreground hover:bg-primary hover:text-white transition-colors tag-pill min-h-[44px] flex items-center"
              >
                #{s}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
