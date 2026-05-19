import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  PenSquare,
  Moon,
  Sun,
  Bell,
  Search,
  X,
  Command,
  Zap,
} from "lucide-react";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [notifCount] = useState(3);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          scrolled
            ? "glass shadow-md"
            : "bg-card/90 backdrop-blur-md"
        } border-b border-border`}
      >
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center gap-2 sm:gap-3">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2.5 group">
            <div className="relative w-8 sm:w-9 h-8 sm:h-9 rounded-xl gradient-primary flex items-center justify-center shadow-primary shadow-sm group-hover:scale-105 transition-transform">
              <Zap className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              <div className="absolute inset-0 rounded-xl gradient-primary opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
            </div>
            <div className="hidden xs:flex flex-col leading-none">
              <span className="text-base sm:text-lg font-bold gradient-text tracking-tight">
                Khapeer
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
                className="pr-10 pl-4 h-10 rounded-xl bg-muted/60 border-border/60 focus:bg-card transition-colors"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded-md px-1.5 py-0.5">
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </div>
            </div>
          </form>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1">

            {/* Mobile Search Toggle */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl md:hidden h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 sm:h-5 w-4 sm:w-5" />
            </Button>

            {/* Ask Question - Desktop */}
            <Button
              asChild
              className="hidden md:flex rounded-xl h-9 px-4 gradient-primary border-0 shadow-primary shadow-sm hover:opacity-90 transition-opacity text-sm"
            >
              <Link to="/questions/new">
                <PenSquare className="h-4 w-4 ml-2" />
                اسأل سؤالاً
              </Link>
            </Button>

            {/* Ask Question - Mobile */}
            <Button
              asChild
              size="icon"
              className="md:hidden rounded-xl h-8 w-8 sm:h-9 sm:w-9 gradient-primary border-0"
            >
              <Link to="/questions/new">
                <PenSquare className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </Link>
            </Button>

            {/* Dark Mode */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted hidden xs:flex"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? "وضع فاتح" : "وضع داكن"}
            >
              {isDark
                ? <Sun className="h-4 sm:h-4.5 w-4 sm:w-4.5 text-amber-400" />
                : <Moon className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
              }
            </Button>

            {/* Notifications */}
            <Link to="/notifications" className="relative hidden xs:block">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted"
              >
                <Bell className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
              </Button>
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 sm:h-4 w-3.5 sm:w-4 flex items-center justify-center rounded-full bg-destructive text-[8px] sm:text-[9px] text-white font-bold border-2 border-card badge-pulse">
                  {notifCount}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <Link to="/profile/me" className="flex-shrink-0">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200 cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="gradient-primary text-white font-bold text-xs sm:text-sm">
                  م
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col p-3 sm:p-4 animate-scale-in">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative input-glow rounded-xl">
                <Search className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  type="search"
                  placeholder="ابحث هنا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 sm:pr-10 h-11 sm:h-12 rounded-xl bg-muted border-0 text-sm sm:text-base"
                />
              </div>
            </form>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl h-11 w-11 sm:h-12 sm:w-12 shrink-0"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick suggestions */}
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 px-1">عمليات البحث الشائعة</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 stagger animate-fade-in">
            {["برمجة", "ذكاء اصطناعي", "تصميم", "React", "تعلم الآلة", "قواعد البيانات"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(s)}`);
                  setSearchOpen(false);
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted text-xs sm:text-sm text-foreground hover:bg-primary hover:text-white transition-colors tag-pill"
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
