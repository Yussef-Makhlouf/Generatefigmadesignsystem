import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search, Users, MessageSquare, Bookmark, CheckCircle2, Globe, Monitor, Bot, Palette, TrendingUp, BookOpen, Leaf, Microscope, Shield, Rocket, Earth } from "lucide-react";

interface Space {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  members: number;
  questions: number;
  isJoined: boolean;
  tags: string[];
  category: string;
}

const SPACES: Space[] = [
  { id: "tech", name: "التقنية والبرمجة", description: "كل ما يخص البرمجة، تطوير الويب، التطبيقات، والتقنيات الحديثة.", icon: Monitor, gradient: "from-blue-500 to-indigo-600", members: 12400, questions: 4520, isJoined: true, tags: ["برمجة", "React", "Python"], category: "تقنية" },
  { id: "ai", name: "الذكاء الاصطناعي", description: "نقاشات وأسئلة حول الذكاء الاصطناعي وتطبيقاته في عالمنا العربي.", icon: Bot, gradient: "from-purple-500 to-violet-600", members: 9800, questions: 2340, isJoined: true, tags: ["AI", "ML", "GPT"], category: "تقنية" },
  { id: "design", name: "التصميم والإبداع", description: "UI/UX، الجرافيك، تجربة المستخدم، وكل ما يتعلق بالتصميم.", icon: Palette, gradient: "from-pink-500 to-rose-600", members: 7200, questions: 1890, isJoined: false, tags: ["UI/UX", "Figma", "تصميم"], category: "إبداع" },
  { id: "business", name: "الأعمال والريادة", description: "ريادة الأعمال، الاستثمار، التسويق، وإدارة المشاريع.", icon: TrendingUp, gradient: "from-green-500 to-emerald-600", members: 6500, questions: 1670, isJoined: false, tags: ["ريادة", "تسويق", "استثمار"], category: "أعمال" },
  { id: "education", name: "التعليم والتطوير", description: "تعلّم مهارات جديدة، نصائح الدراسة، وطرق التعلم الفعّال.", icon: BookOpen, gradient: "from-yellow-500 to-orange-500", members: 11200, questions: 3780, isJoined: true, tags: ["تعليم", "مهارات", "شهادات"], category: "تعليم" },
  { id: "health", name: "الصحة والعافية", description: "أسئلة حول الصحة، التغذية، الرياضة، والحياة الصحية.", icon: Leaf, gradient: "from-teal-500 to-cyan-600", members: 5800, questions: 1240, isJoined: false, tags: ["صحة", "رياضة", "تغذية"], category: "صحة" },
  { id: "science", name: "العلوم والبحث", description: "الفيزياء، الكيمياء، علم الأحياء، والاكتشافات العلمية الحديثة.", icon: Microscope, gradient: "from-sky-500 to-blue-600", members: 4300, questions: 980, isJoined: false, tags: ["فيزياء", "كيمياء", "علوم"], category: "علوم" },
  { id: "security", name: "أمن المعلومات", description: "الأمن السيبراني، اختبار الاختراق، وحماية الأنظمة.", icon: Shield, gradient: "from-red-500 to-orange-600", members: 5100, questions: 1450, isJoined: false, tags: ["أمن", "سيبراني", "CTF"], category: "تقنية" },
  { id: "freelance", name: "العمل الحر", description: "نصائح للفريلانسرز، كيف تحصل على عملاء، وتطوير أعمالك.", icon: Rocket, gradient: "from-violet-500 to-purple-600", members: 8900, questions: 2100, isJoined: false, tags: ["فريلانس", "مستقل", "عقود"], category: "أعمال" },
  { id: "arabic-dev", name: "المطورون العرب", description: "مجتمع خاص للمطورين العرب، أخبار ونقاشات باللغة العربية.", icon: Earth, gradient: "from-amber-500 to-yellow-600", members: 15600, questions: 5230, isJoined: true, tags: ["مطورين", "عرب", "تقنية"], category: "مجتمع" },
];

const CATEGORIES = ["الكل", "تقنية", "إبداع", "أعمال", "تعليم", "صحة", "علوم", "مجتمع"];

export function SpacesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [tab, setTab] = useState("all");
  const [joinedSpaces, setJoinedSpaces] = useState<Set<string>>(
    new Set(SPACES.filter((s) => s.isJoined).map((s) => s.id))
  );

  const toggleJoin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setJoinedSpaces((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = SPACES.filter((s) => {
    if (tab === "joined" && !joinedSpaces.has(s.id)) return false;
    if (category !== "الكل" && s.category !== category) return false;
    if (search && !s.name.includes(search) && !s.description.includes(search)) return false;
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

        {/* Category Chips with premium rounded-full design */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all border duration-300 ${
                category === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20 scale-[1.03]"
                  : "bg-card/50 backdrop-blur-sm border-border/60 hover:border-primary/50 hover:text-primary hover:scale-[1.02]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-card/45 backdrop-blur-md border border-border/85 rounded-xl p-1">
            <TabsTrigger value="all" className="rounded-lg transition-all duration-200">جميع المساحات</TabsTrigger>
            <TabsTrigger value="joined" className="rounded-lg transition-all duration-200 flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5" />
              مساحاتي (<span className="numeral font-bold">{joinedSpaces.size}</span>)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Spaces Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground relative z-10 bg-card/25 backdrop-blur-sm border border-border/50 rounded-2xl">
          <Globe className="h-14 w-14 mx-auto mb-4 opacity-20 animate-pulse" />
          <p className="text-base font-semibold mb-1">لا توجد مساحات تطابق بحثك حالياً</p>
          <p className="text-xs text-muted-foreground">جرب تعديل شروط البحث أو الفلاتر لاستكشاف المزيد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filtered.map((space) => {
            const isJoined = joinedSpaces.has(space.id);
            return (
              <Card
                key={space.id}
                className="premium-glass-card overflow-hidden cursor-pointer group relative flex flex-col justify-between"
                onClick={() => navigate(`/search?space=${space.id}`)}
              >
                <div>
                  {/* Cover gradient with fine geometric mesh inside */}
                  <div className={`h-24 bg-gradient-to-l ${space.gradient} relative flex items-end p-4 transition-all duration-500 group-hover:brightness-[1.05]`}>
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
                    <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-20 pointer-events-none" />
                    
                    <div className="relative w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <space.icon className="h-6 w-6 text-white" />
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
                    <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed h-8">
                      {space.description}
                    </p>

                    {/* Tags in Space */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {space.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="tag-pill text-[9px] px-2.5 py-0.5 rounded-lg bg-muted/40 border border-border/40 hover:bg-primary hover:text-white transition-colors duration-300">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats dashboard feel */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="numeral font-bold text-foreground">{space.members.toLocaleString("ar-SA")}</span>
                        <span>عضو</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-secondary" />
                        <span className="numeral font-bold text-foreground">{space.questions.toLocaleString("ar-SA")}</span>
                        <span>سؤال</span>
                      </div>
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
