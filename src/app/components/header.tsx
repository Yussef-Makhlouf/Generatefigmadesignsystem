import { useState, useEffect } from "react";
import { Link } from "react-router";
import { SearchBar } from "./search-bar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { PenSquare, Moon, Sun, Bell, HelpCircle } from "lucide-react";

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [notifCount] = useState(3);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
              Khapeer
            </span>
          </div>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mr-auto md:mr-0">
          {/* New Question Button */}
          <Button asChild className="rounded-lg hidden md:flex">
            <Link to="/questions/new">
              <PenSquare className="h-4 w-4 ml-2" />
              اسأل سؤالاً
            </Link>
          </Button>

          {/* Mobile New Question Button */}
          <Button asChild size="icon" variant="ghost" className="rounded-lg md:hidden">
            <Link to="/questions/new">
              <PenSquare className="h-5 w-5" />
            </Link>
          </Button>

          {/* Help */}
          <Button asChild size="icon" variant="ghost" className="rounded-lg hidden sm:flex">
            <Link to="/help">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="rounded-lg"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <Link to="/notifications" className="relative">
            <Button size="icon" variant="ghost" className="rounded-lg">
              <Bell className="h-5 w-5" />
            </Button>
            {notifCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive border-0">
                {notifCount}
              </Badge>
            )}
          </Link>

          {/* User Avatar */}
          <Link to="/profile/me">
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold text-sm">
                م
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
