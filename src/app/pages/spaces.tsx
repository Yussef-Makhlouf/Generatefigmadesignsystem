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
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">المساحات</h1>
            <p className="text-sm text-muted-foreground">مجتمعات متخصصة حول مواضيع تهمك</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مساحة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 h-11 rounded-xl bg-card"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all border ${
                category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">جميع المساحات</TabsTrigger>
            <TabsTrigger value="joined" className="flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5" />
              مساحاتي ({joinedSpaces.size})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Spaces Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد مساحات تطابق بحثك</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((space) => {
            const isJoined = joinedSpaces.has(space.id);
            return (
              <Card
                key={space.id}
                className="overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
                onClick={() => navigate(`/search?space=${space.id}`)}
              >
                {/* Cover gradient */}
                <div className={`h-20 bg-gradient-to-l ${space.gradient} relative flex items-end p-3`}>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
                  <div className="relative w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <space.icon className="h-6 w-6 text-white" />
                  </div>
                  {isJoined && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-white text-[10px]">
                      <CheckCircle2 className="h-3 w-3" />
                      منضم
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                    {space.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {space.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {space.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 h-4 rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{space.members.toLocaleString("ar-SA")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{space.questions.toLocaleString("ar-SA")} سؤال</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isJoined ? "outline" : "default"}
                    className="w-full rounded-lg h-8 text-xs"
                    onClick={(e) => toggleJoin(space.id, e)}
                  >
                    {isJoined ? "انسحاب" : "انضم للمساحة"}
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
