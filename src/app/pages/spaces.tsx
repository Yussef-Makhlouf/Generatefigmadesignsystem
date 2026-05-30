import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Search, Users, MessageSquare, Bookmark, CheckCircle2,
  Globe, Monitor, Bot, Palette, TrendingUp, BookOpen,
  Leaf, Microscope, Shield, Rocket, Earth, Loader2, Hash,
} from "lucide-react";
import { getActiveSpaces } from "../../lib/services/spaces.service";
import type { Space } from "../../lib/database.types";

// Map icon names from DB to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, Bot, Palette, TrendingUp, BookOpen, Leaf,
  Microscope, Shield, Rocket, Earth, Globe, Hash,
};

// Fallback gradient pool
const GRADIENT_POOL = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600",
  "from-green-500 to-emerald-600",
  "from-yellow-500 to-orange-500",
  "from-teal-500 to-cyan-600",
  "from-sky-500 to-blue-600",
  "from-red-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-yellow-600",
];

export function SpacesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [joinedSpaces, setJoinedSpaces] = useState<Set<string>>(new Set());

  // ── Real backend data ─────────────────────────────────────
  const { data: spaces = [], isLoading } = useQuery<Space[]>({
    queryKey: ["spaces"],
    queryFn: getActiveSpaces,
    staleTime: 5 * 60 * 1000,
  });

  const toggleJoin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setJoinedSpaces((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = spaces.filter((s) => {
    if (tab === "joined" && !joinedSpaces.has(s.id)) return false;
    if (search && !s.name.includes(search) && !(s.description ?? "").includes(search)) return false;
    return true;
  });

  return (
    <div className="w-full animate-fade-in pb-4 relative">
      {/* Background ambient auroras */}
      <div className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/10">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">المساحات المجتمعية</h1>
            <p className="text-sm text-text-secondary">انضم إلى مجتمعات متخصصة، وتبادل المعرفة مع خبراء في شتى المجالات</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-5 mb-8 relative z-10">
        <div className="relative input-glow rounded-2xl">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مساحة معرفية..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-11 h-12 rounded-2xl bg-card/50 backdrop-blur-sm border-border/80 text-foreground"
          />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-card/45 backdrop-blur-md border border-border/85 rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg transition-all duration-200">
              جميع المساحات
              {!isLoading && (
                <span className="mr-1.5 text-[10px] font-bold numeral">({spaces.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="joined" className="rounded-lg transition-all duration-200 flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5" />
              مساحاتي (<span className="numeral font-bold">{joinedSpaces.size}</span>)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Spaces Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 relative z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جارٍ تحميل المساحات…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground relative z-10 bg-card/25 backdrop-blur-sm border border-border/50 rounded-2xl">
          <Globe className="h-14 w-14 mx-auto mb-4 opacity-20 animate-pulse" />
          <p className="text-base font-semibold mb-1">
            {spaces.length === 0 ? "لا توجد مساحات متاحة حالياً" : "لا توجد مساحات تطابق بحثك"}
          </p>
          <p className="text-xs text-muted-foreground">جرب تعديل شروط البحث أو الفلاتر لاستكشاف المزيد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filtered.map((space, index) => {
            const isJoined = joinedSpaces.has(space.id);
            const gradient = GRADIENT_POOL[index % GRADIENT_POOL.length];
            const IconComponent = space.icon_url ? (ICON_MAP[space.icon_url] ?? Globe) : Globe;

            return (
              <Card
                key={space.id}
                className="premium-glass-card overflow-hidden cursor-pointer group relative flex flex-col justify-between"
                onClick={() => navigate(`/search?space=${space.id}`)}
              >
                <div>
                  {/* Cover gradient */}
                  <div className={`h-24 bg-gradient-to-l ${gradient} relative flex items-end p-4 transition-all duration-500 group-hover:brightness-[1.05]`}>
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
                    <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-20 pointer-events-none" />
                    
                    <div className="relative w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    
                    {isJoined && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/20 backdrop-blur-md border border-primary/20 px-2.5 py-1 rounded-full text-white text-[10px] font-semibold animate-fade-in">
                        <CheckCircle2 className="h-3 w-3 text-white" />
                        عضو منضم
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors duration-300">
                      {space.name}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                      {space.description ?? "مساحة معرفية متخصصة للأسئلة والنقاشات."}
                    </p>

                    {/* Active/joined status */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className={`text-[9px] px-2.5 py-0.5 rounded-lg ${
                          space.is_active
                            ? "bg-emerald-100/50 text-emerald-700 border border-emerald-200/50"
                            : "bg-muted/40 border border-border/40"
                        }`}
                      >
                        {space.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    size="sm"
                    variant={isJoined ? "outline" : "default"}
                    className={`w-full rounded-xl h-9 text-xs transition-all duration-300 ${
                      isJoined
                        ? "border-primary/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
                        : "gradient-primary border-0 text-white hover:opacity-90 shadow-sm"
                    }`}
                    onClick={(e) => toggleJoin(space.id, e)}
                  >
                    {isJoined ? "مغادرة المساحة" : "انضمام للمساحة"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
