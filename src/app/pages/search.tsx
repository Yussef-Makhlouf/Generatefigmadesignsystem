import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { SearchBar } from "../components/search-bar";
import { QuestionCard } from "../components/question-card";
import { EmptyState } from "../components/empty-state";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { SlidersHorizontal, Search as SearchIcon, Loader2, X, RotateCcw } from "lucide-react";
import { useQuestionInteractions } from "../../lib/hooks/use-question-interactions";
import { questionToCardProps } from "../../lib/database.types";
import { useBackendSearch } from "../../lib/hooks/use-search";
import { useCategories } from "../../lib/hooks/use-categories";
import { useLocations } from "../../lib/hooks/use-locations";
import { CATEGORY_LABELS } from "../../lib/services/stats.service";
import { SEO, breadcrumbSchema, SITE_URL, questionUrl } from "../components/seo";

// Locations are fetched dynamically from the DB — see useLocations() below

const SORT_OPTIONS = [
  { value: "newest",     label: "الأحدث" },
  { value: "votes",      label: "الأكثر تصويتاً" },
  { value: "unanswered", label: "بدون إجابة" },
];

// ── Filter Panel — extracted to module scope to prevent React remounts ──────
interface FilterPanelProps {
  allCategories: { value: string; label: string }[];
  allLocations: { value: string; label: string }[];
  category: string;
  setCategory: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  sortBy: "newest" | "votes" | "unanswered";
  setSortBy: (v: "newest" | "votes" | "unanswered") => void;
  unansweredOnly: boolean;
  setUnansweredOnly: (v: boolean) => void;
  onReset: () => void;
  hasFilters: boolean;
}

function FilterPanel({
  allCategories, allLocations, category, setCategory,
  location, setLocation,
  sortBy, setSortBy,
  unansweredOnly, setUnansweredOnly,
  onReset, hasFilters,
}: FilterPanelProps) {
  return (
    <div className="space-y-5">
      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary font-heading tracking-wide uppercase">التصنيف</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-input-background/50 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="premium-glass-card border-strong/40 rounded-xl z-50">
            {allCategories.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary font-heading tracking-wide uppercase">الموقع الجغرافي</label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="bg-input-background/50 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="premium-glass-card border-strong/40 rounded-xl z-50">
            {allLocations.map((l) => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary font-heading tracking-wide uppercase">ترتيب النتائج</label>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="bg-input-background/50 border-strong/45 rounded-xl hover:border-primary/50 focus:ring-primary transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="premium-glass-card border-strong/40 rounded-xl z-50">
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Unanswered toggle */}
      <div className="pt-3 border-t border-strong/15">
        <label
          className="flex items-center gap-3 cursor-pointer select-none text-text-secondary hover:text-foreground transition-colors duration-200"
          onClick={() => setUnansweredOnly(!unansweredOnly)}
        >
          <div className="relative flex items-center justify-center shrink-0">
            <input
              type="checkbox"
              checked={unansweredOnly}
              onChange={(e) => setUnansweredOnly(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded-lg border border-strong bg-muted/40 peer-checked:bg-primary peer-checked:border-primary transition-all duration-200" />
            <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity duration-200 text-primary-foreground pointer-events-none text-xs font-bold leading-none">
              ✓
            </div>
          </div>
          <span className="text-xs font-bold">أسئلة بدون إجابة فقط</span>
        </label>
      </div>

      {/* Reset Filters */}
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full gap-2 text-xs font-bold text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-xl"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          إعادة تعيين جميع الفلاتر
        </Button>
      )}
    </div>
  );
}


// ── Main Search Page ──────────────────────────────────────────────────────────
export function SearchPage() {
  const navigate = useNavigate();
  const { bookmarkedIds, voteQuestion, toggleBookmark, userVotes } = useQuestionInteractions();
  const { categories: backendCategories } = useCategories(20);
  const { options: allLocations } = useLocations();

  // Build dropdown list — always resolve to Arabic display label
  const allCategories = [
    { value: "all", label: "جميع التصنيفات" },
    ...backendCategories.map((c) => {
      const label = CATEGORY_LABELS[c.name] ?? c.name;
      return { value: label, label };
    }),
  ];

  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [category,    setCategory]    = useState("all");
  const [location,    setLocation]    = useState("all");
  const [sortBy,      setSortBy]      = useState<"newest" | "votes" | "unanswered">("newest");
  const [unansweredOnly, setUnansweredOnly] = useState(false);

  // True whenever any non-default filter is active
  const hasFilters =
    searchQuery.trim().length > 0 ||
    category !== "all" ||
    location !== "all" ||
    unansweredOnly ||
    sortBy !== "newest";

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setCategory("all");
    setLocation("all");
    setSortBy("newest");
    setUnansweredOnly(false);
  }, []);

  // ── Backend query — always enabled, re-fires on any filter change ─────────
  const { data: results = [], isLoading, isFetching } = useBackendSearch({
    query: searchQuery,
    category: category !== "all" ? category : undefined,
    location: location !== "all" ? location : undefined,
    sortBy,
    unansweredOnly,
    limit: 50,
  });

  // ── Active filter chips (for header strip) ────────────────────────────────
  const activeChips: { key: string; label: string }[] = [];
  if (searchQuery.trim()) activeChips.push({ key: "q",   label: `"${searchQuery.trim()}"` });
  if (category !== "all") activeChips.push({ key: "cat", label: allCategories.find((c) => c.value === category)?.label ?? category });
  if (location !== "all") activeChips.push({ key: "loc", label: allLocations.find((l) => l.value === location)?.label ?? location });
  if (unansweredOnly)     activeChips.push({ key: "una", label: "بدون إجابة فقط" });
  if (sortBy !== "newest") activeChips.push({ key: "srt", label: SORT_OPTIONS.find((s) => s.value === sortBy)?.label ?? sortBy });

  return (
    <div className="max-w-5xl w-full mx-auto animate-fade-in pb-8">
      <SEO
        title="البحث والاستكشاف"
        description="ابحث في آلاف الأسئلة والإجابات على منصة خبير. صفي حسب التصنيف، الموقع، أو حالة الإجابة."
        canonical="/search"
        noindex={searchQuery.trim().length > 0}
        structuredData={breadcrumbSchema([
          { name: "الرئيسية", url: `${SITE_URL}/` },
          { name: "البحث", url: `${SITE_URL}/search` },
        ])}
      />
      {/* Ambient glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none -z-10" />

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 font-heading tracking-tight flex items-center gap-2">
          <span className="p-1.5 sm:p-2 rounded-xl bg-primary-light border border-primary/20 text-primary shrink-0">
            <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <span>البحث والاستكشاف</span>
        </h1>

        {/* ── Search bar row ───────────────────────────────────────────── */}
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <SearchBar
              placeholder="ابحث عن سؤال، موضوع، مستخدم، أو تصنيف..."
              onSearch={setSearchQuery}
              defaultValue={searchQuery}
            />
            {isFetching && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Mobile filter drawer trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="md:hidden relative rounded-xl h-11 w-11 p-0 border-strong bg-card/60 hover:bg-primary-light hover:text-primary transition-all duration-200 shrink-0"
              >
                <SlidersHorizontal className="h-5 w-5" />
                {hasFilters && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="premium-glass-card border-strong/40 text-right overflow-y-auto">
              <SheetHeader className="text-right mb-6">
                <SheetTitle className="text-lg font-bold font-heading text-right border-b border-strong/15 pb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  تصفية النتائج
                </SheetTitle>
              </SheetHeader>
              <FilterPanel
                allCategories={allCategories}
                allLocations={allLocations}
                category={category}      setCategory={setCategory}
                location={location}      setLocation={setLocation}
                sortBy={sortBy}          setSortBy={setSortBy}
                unansweredOnly={unansweredOnly} setUnansweredOnly={setUnansweredOnly}
                onReset={handleReset}    hasFilters={hasFilters}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Active filter chips (mobile + desktop) ───────────────────── */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="rounded-full bg-primary-light/60 border border-primary/25 text-primary whitespace-nowrap text-[11px] px-2.5 py-0.5 font-semibold"
              >
                {chip.label}
              </Badge>
            ))}
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-text-muted hover:text-destructive transition-colors duration-150 px-1.5 rounded-full hover:bg-destructive/10 py-0.5"
            >
              <X className="h-3 w-3" />
              إلغاء الكل
            </button>
          </div>
        )}
      </div>

      {/* ── Layout: Sidebar Filters + Results ────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <Card className="premium-glass-card border-strong/30 p-5 rounded-2xl sticky top-24">
            <h3 className="font-bold mb-5 text-sm font-heading border-b border-strong/15 pb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              تصفية النتائج
              {hasFilters && (
                <span className="mr-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-black">
                  {activeChips.length}
                </span>
              )}
            </h3>
            <FilterPanel
              allCategories={allCategories}
              allLocations={allLocations}
              category={category}      setCategory={setCategory}
              location={location}      setLocation={setLocation}
              sortBy={sortBy}          setSortBy={setSortBy}
              unansweredOnly={unansweredOnly} setUnansweredOnly={setUnansweredOnly}
              onReset={handleReset}    hasFilters={hasFilters}
            />
          </Card>
        </aside>

        {/* Results Column */}
        <div className="flex-1 min-w-0">

          {/* Results header row */}
          <div className="flex items-center justify-between mb-4 min-h-[28px]">
            <span className="text-xs font-bold text-text-muted numeral flex items-center gap-1.5">
              {isFetching && !isLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              {isLoading ? (
                <span className="opacity-60">جارٍ التحميل…</span>
              ) : (
                <span>
                  {results.length > 0
                    ? <>تم العثور على <strong className="text-foreground">{results.length.toLocaleString("ar-SA")}</strong> نتيجة</>
                    : hasFilters ? "لا توجد نتائج مطابقة" : "جميع الأسئلة"}
                </span>
              )}
            </span>

            {hasFilters && !isLoading && results.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs font-bold text-primary hover:text-primary/80 gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                إعادة تعيين
              </Button>
            )}
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">
                {hasFilters ? "جارٍ تصفية النتائج…" : "جارٍ تحميل الأسئلة…"}
              </p>
            </div>
          )}

          {/* Results list */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((question) => (
                <QuestionCard
                  key={question.id}
                  {...questionToCardProps(question)}
                  isBookmarked={bookmarkedIds.includes(question.id)}
                  userVote={userVotes[question.id]}
                  onVote={(dir) => voteQuestion(question.id, dir)}
                  onBookmark={() => toggleBookmark(question.id)}
                  onClick={() => navigate(questionUrl(question.id, question.title))}
                />
              ))}
            </div>
          )}

          {/* Empty state — only show after data is fetched */}
          {!isLoading && results.length === 0 && (
            <EmptyState
              icon={SearchIcon}
              title={hasFilters ? "لا توجد نتائج مطابقة" : "لا توجد أسئلة حتى الآن"}
              description={
                hasFilters
                  ? "لم نعثر على أي نتائج بهذه الفلاتر. حاول تعديل البحث أو إعادة تعيين الفلاتر."
                  : "كن أول من يطرح سؤالاً على المنصة!"
              }
              action={
                hasFilters
                  ? { label: "إعادة تعيين الفلاتر", onClick: handleReset }
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
