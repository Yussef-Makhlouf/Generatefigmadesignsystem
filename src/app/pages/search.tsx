import { useState } from "react";
import { useNavigate } from "react-router";
import { SearchBar } from "../components/search-bar";
import { QuestionCard } from "../components/question-card";
import { EmptyState } from "../components/empty-state";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { SlidersHorizontal, Search as SearchIcon } from "lucide-react";
import { useAppState } from "../context/AppStateContext";

export function SearchPage() {
  const navigate = useNavigate();
  const { questions, bookmarkedIds, voteQuestion, toggleBookmark } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [unansweredOnly, setUnansweredOnly] = useState(false);

  // Dynamic search results
  const results = searchQuery
    ? questions
        .filter((q) => {
          const query = searchQuery.toLowerCase();
          const matchesQuery =
            q.title.toLowerCase().includes(query) ||
            q.description.toLowerCase().includes(query) ||
            q.tags.some((t) => t.toLowerCase().includes(query));

          let matchesCategory = true;
          if (category !== "all") {
            const catTags: Record<string, string[]> = {
              tech: ["برمجة", "React", "ذكاء اصطناعي", "تطوير ويب", "python", "javascript"],
              education: ["تعليم", "كتب", "لغات", "إنجليزي"],
              health: ["صحة", "طب"],
              business: ["أعمال", "تسويق"],
              science: ["علوم", "فيزياء"],
            };
            const allowed = catTags[category] || [];
            matchesCategory = q.tags.some((t) =>
              allowed.some((a) => t.toLowerCase().includes(a.toLowerCase()))
            );
          }

          let matchesLocation = true;
          if (location !== "all") {
            const locNames: Record<string, string> = {
              riyadh: "الرياض",
              jeddah: "جدة",
              dammam: "الدمام",
              mecca: "مكة المكرمة",
              medina: "المدينة المنورة",
            };
            matchesLocation = q.location === locNames[location];
          }

          const matchesUnanswered = !unansweredOnly || q.answers === 0;

          return matchesQuery && matchesCategory && matchesLocation && matchesUnanswered;
        })
        .sort((a, b) => {
          if (sortBy === "votes") {
            return b.votes - a.votes;
          } else if (sortBy === "unanswered") {
            return a.answers - b.answers;
          } else {
            return 0; // newest
          }
        })
    : [];

  const FilterPanel = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary font-heading">التصنيف</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-input-background/50 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="premium-glass-card border-strong/40 rounded-xl">
            <SelectItem value="all">جميع التصنيفات</SelectItem>
            <SelectItem value="tech">تقنية</SelectItem>
            <SelectItem value="education">تعليم</SelectItem>
            <SelectItem value="health">صحة</SelectItem>
            <SelectItem value="business">أعمال</SelectItem>
            <SelectItem value="science">علوم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary font-heading">الموقع الجغرافي</label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="bg-input-background/50 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="premium-glass-card border-strong/40 rounded-xl">
            <SelectItem value="all">جميع المواقع</SelectItem>
            <SelectItem value="riyadh">الرياض</SelectItem>
            <SelectItem value="jeddah">جدة</SelectItem>
            <SelectItem value="dammam">الدمام</SelectItem>
            <SelectItem value="mecca">مكة المكرمة</SelectItem>
            <SelectItem value="medina">المدينة المنورة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary font-heading">خيارات الترتيب</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-input-background/50 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="premium-glass-card border-strong/40 rounded-xl">
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="votes">الأكثر تصويتاً</SelectItem>
            <SelectItem value="unanswered">بدون إجابة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 pt-3 border-t border-strong/15">
        <label
          className="flex items-center gap-3 cursor-pointer group select-none text-text-secondary hover:text-foreground transition-colors duration-200"
          onClick={() => setVerifiedOnly(!verifiedOnly)}
        >
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded-lg border border-strong bg-muted/40 peer-checked:bg-primary peer-checked:border-primary transition-all duration-200" />
            <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity duration-200 text-primary-foreground pointer-events-none text-xs font-bold">
              ✓
            </div>
          </div>
          <span className="text-xs font-bold">إجابات موثقة فقط</span>
        </label>

        <label
          className="flex items-center gap-3 cursor-pointer group select-none text-text-secondary hover:text-foreground transition-colors duration-200"
          onClick={() => setUnansweredOnly(!unansweredOnly)}
        >
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={unansweredOnly}
              onChange={(e) => setUnansweredOnly(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded-lg border border-strong bg-muted/40 peer-checked:bg-primary peer-checked:border-primary transition-all duration-200" />
            <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity duration-200 text-primary-foreground pointer-events-none text-xs font-bold">
              ✓
            </div>
          </div>
          <span className="text-xs font-bold">أسئلة بدون إجابة</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background Mesh Overlay */}
      <div className="absolute inset-0 arabic-geometric-mesh-fine pointer-events-none opacity-45 z-0" />
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-15%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[150px] pointer-events-none z-0" />

      <div className="container relative mx-auto px-4 py-8 max-w-5xl animate-fade-in pb-24 md:pb-8 z-10">
        {/* Search Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-extrabold mb-4 font-heading tracking-tight flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-light border border-primary/20 text-primary shrink-0">
              <SearchIcon className="h-6 w-6" />
            </span>
            <span>البحث المعرفي</span>
          </h1>

          <div className="flex gap-3">
            <div className="flex-1">
              <SearchBar
                placeholder="ابحث عن سؤال، موضوع، أو مستخدم..."
                onSearch={setSearchQuery}
              />
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="md:hidden rounded-xl h-11 w-11 p-0 border-strong bg-card/60 hover:bg-primary-light hover:text-primary transition-all duration-200 shrink-0"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="premium-glass-card border-strong/40 text-right">
                <SheetHeader className="text-right mb-6">
                  <SheetTitle className="text-lg font-bold font-heading text-right border-b border-strong/15 pb-3">
                    تصفية النتائج
                  </SheetTitle>
                </SheetHeader>
                <div className="text-right">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters - Mobile */}
          {searchQuery && (
            <div className="flex gap-1.5 mt-3 overflow-x-auto md:hidden scrollbar-none pb-1">
              <Badge variant="secondary" className="rounded-full bg-primary-light/50 border border-primary/20 text-primary whitespace-nowrap text-[10px] px-2.5 py-0.5">
                {category === "all" ? "جميع التصنيفات" : category === "tech" ? "تقنية" : category === "education" ? "تعليم" : category === "health" ? "صحة" : category === "business" ? "أعمال" : "علوم"}
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-secondary-light border border-secondary/20 text-secondary whitespace-nowrap text-[10px] px-2.5 py-0.5">
                {sortBy === "newest" ? "الأحدث" : sortBy === "votes" ? "الأكثر تصويتاً" : "بدون إجابة"}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <Card className="premium-glass-card border-strong/30 p-5 rounded-2xl sticky top-24">
              <h3 className="font-bold mb-5 text-sm font-heading border-b border-strong/15 pb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                تصفية النتائج
              </h3>
              <FilterPanel />
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {!searchQuery ? (
              <EmptyState
                icon={SearchIcon}
                title="ابدأ بالبحث"
                description="اكتب في شريط البحث أعلاه للعثور على الأسئلة والمواضيع والمستخدمين"
                action={undefined}
              />
            ) : results.length > 0 ? (
              <>
                <div className="mb-4 text-xs font-bold text-text-muted numeral">
                  تم العثور على {results.length.toLocaleString("ar-SA")} نتيجة
                </div>
                <div className="space-y-4">
                  {results.map((question) => (
                    <QuestionCard
                      key={question.id}
                      {...question}
                      isBookmarked={bookmarkedIds.includes(question.id)}
                      onVote={(dir) => voteQuestion(question.id, dir)}
                      onBookmark={() => toggleBookmark(question.id)}
                      onClick={() => navigate(`/questions/${question.id}`)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={SearchIcon}
                title="لا توجد نتائج"
                description="لم نتمكن من العثور على أي نتائج مطابقة لبحثك. جرب كلمات مفتاحية مختلفة أو قم بتعديل الفلاتر."
                action={undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
