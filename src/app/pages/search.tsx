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
import { SlidersHorizontal, Search as SearchIcon, Loader2 } from "lucide-react";
import { useAppState } from "../context/AppStateContext";
import { questionToCardProps } from "../../lib/database.types";
import { useBackendSearch } from "../../lib/hooks/use-search";
import { useCategories } from "../../lib/hooks/use-categories";

const CATEGORIES = [
  { value: "all", label: "جميع التصنيفات" },
]; // static fallback; real categories injected at runtime

const LOCATIONS = [
  { value: "all", label: "جميع المواقع" },
  { value: "الرياض", label: "الرياض" },
  { value: "جدة", label: "جدة" },
  { value: "الدمام", label: "الدمام" },
  { value: "مكة المكرمة", label: "مكة المكرمة" },
  { value: "المدينة المنورة", label: "المدينة المنورة" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "votes", label: "الأكثر تصويتاً" },
  { value: "unanswered", label: "بدون إجابة" },
];

export function SearchPage() {
  const navigate = useNavigate();
  const { bookmarkedIds, voteQuestion, toggleBookmark, userVotes = {} } = useAppState();
  const { categories: backendCategories } = useCategories(10);

  // Merge backend cats into the dropdown ("all" is always first)
  const allCategories = [
    { value: "all", label: "جميع التصنيفات" },
    ...backendCategories.map((c) => ({ value: c.name, label: c.name })),
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "unanswered">("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [unansweredOnly, setUnansweredOnly] = useState(false);

  // ── Backend search (debounced, returns real Supabase data) ──
  const { data: results = [], isLoading, isFetching } = useBackendSearch({
    query: searchQuery,
    category: category !== "all" ? category : undefined,
    location: location !== "all" ? location : undefined,
    sortBy,
    unansweredOnly,
    limit: 30,
  });

  const isSearchActive =
    searchQuery.trim().length > 0 ||
    category !== "all" ||
    location !== "all" ||
    unansweredOnly;

  const FilterPanel = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary font-heading">التصنيف</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-input-background/50 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="premium-glass-card border-strong/40 rounded-xl">
            {allCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
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
            {LOCATIONS.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary font-heading">خيارات الترتيب</label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="bg-input-background/50 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="premium-glass-card border-strong/40 rounded-xl">
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 pt-3 border-t border-strong/15">
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
    <div className="max-w-5xl w-full mx-auto animate-fade-in pb-4">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none -z-10" />

      {/* Search Header */}
      <div className="mb-5 sm:mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 font-heading tracking-tight flex items-center gap-2">
          <span className="p-1.5 sm:p-2 rounded-xl bg-primary-light border border-primary/20 text-primary shrink-0">
            <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <span>البحث المعرفي</span>
        </h1>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchBar
                placeholder="ابحث عن سؤال، موضوع، أو مستخدم..."
                onSearch={setSearchQuery}
              />
              {/* Loading indicator inside search bar */}
              {isFetching && searchQuery.trim() && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
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

          {/* Active Filters Badges */}
          {isSearchActive && (
            <div className="flex gap-1.5 mt-3 overflow-x-auto md:hidden scrollbar-none pb-1">
              {category !== "all" && (
                <Badge variant="secondary" className="rounded-full bg-primary-light/50 border border-primary/20 text-primary whitespace-nowrap text-[10px] px-2.5 py-0.5">
                  {allCategories.find((c) => c.value === category)?.label}
                </Badge>
              )}
              {location !== "all" && (
                <Badge variant="secondary" className="rounded-full bg-secondary-light border border-secondary/20 text-secondary whitespace-nowrap text-[10px] px-2.5 py-0.5">
                  {LOCATIONS.find((l) => l.value === location)?.label}
                </Badge>
              )}
              <Badge variant="secondary" className="rounded-full bg-muted whitespace-nowrap text-[10px] px-2.5 py-0.5">
                {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
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
            {!isSearchActive ? (
              <EmptyState
                icon={SearchIcon}
                title="ابدأ بالبحث"
                description="اكتب في شريط البحث أعلاه للعثور على الأسئلة والمواضيع والمستخدمين"
                action={undefined}
              />
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">جارٍ البحث في قاعدة البيانات…</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="mb-4 text-xs font-bold text-text-muted numeral flex items-center gap-2">
                  {isFetching && <Loader2 className="h-3 w-3 animate-spin" />}
                  تم العثور على {results.length.toLocaleString("ar-SA")} نتيجة
                </div>
                <div className="space-y-4">
                  {results.map((question) => (
                    <QuestionCard
                      key={question.id}
                      {...questionToCardProps(question)}
                      isBookmarked={bookmarkedIds.includes(question.id)}
                      userVote={userVotes[question.id]}
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
  );
}
