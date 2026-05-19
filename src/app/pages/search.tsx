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

export function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [unansweredOnly, setUnansweredOnly] = useState(false);

  // Mock search results
  const results = searchQuery ? [
    {
      id: "1",
      title: "كيف يمكنني تعلم البرمجة من الصفر؟",
      description: "أنا مهتم بتعلم البرمجة ولكن لا أعرف من أين أبدأ. ما هي أفضل الموارد والمسارات للمبتدئين؟",
      author: { name: "أحمد محمد", avatar: "", reputation: 450 },
      votes: 42,
      answers: 15,
      tags: ["برمجة", "تعليم", "مبتدئين"],
      location: "الرياض",
      timestamp: "منذ ساعتين",
    },
    {
      id: "2",
      title: "ما هي أفضل الممارسات في تطوير تطبيقات الويب الحديثة؟",
      description: "أبحث عن نصائح وإرشادات حول أفضل الممارسات في تطوير تطبيقات الويب باستخدام التقنيات الحديثة.",
      author: { name: "سارة علي", avatar: "", reputation: 1250 },
      votes: 38,
      answers: 12,
      tags: ["تطوير ويب", "React", "تقنية"],
      timestamp: "منذ 3 ساعات",
    },
  ] : [];

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">التصنيف</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-input-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
        <label className="text-sm font-medium">الموقع</label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="bg-input-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
        <label className="text-sm font-medium">الترتيب</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-input-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث</SelectItem>
            <SelectItem value="votes">الأكثر تصويتاً</SelectItem>
            <SelectItem value="unanswered">بدون إجابة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <label
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setVerifiedOnly(!verifiedOnly)}
        >
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm">إجابات موثقة فقط</span>
        </label>

        <label
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setUnansweredOnly(!unansweredOnly)}
        >
          <input
            type="checkbox"
            checked={unansweredOnly}
            onChange={(e) => setUnansweredOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm">أسئلة بدون إجابة</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">البحث</h1>
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
              <Button variant="outline" className="md:hidden rounded-lg">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>تصفية النتائج</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters - Mobile */}
        {searchQuery && (
          <div className="flex gap-2 mt-3 overflow-x-auto md:hidden">
            <Badge variant="secondary" className="rounded-full whitespace-nowrap">
              {category === "all" ? "جميع التصنيفات" : category}
            </Badge>
            <Badge variant="secondary" className="rounded-full whitespace-nowrap">
              {sortBy === "newest" ? "الأحدث" : sortBy === "votes" ? "الأكثر تصويتاً" : "بدون إجابة"}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters */}
        <aside className="hidden md:block w-64">
          <Card className="p-4 sticky top-20">
            <h3 className="font-semibold mb-4">تصفية النتائج</h3>
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
              <div className="mb-4 text-sm text-muted-foreground">
                تم العثور على {results.length} نتيجة
              </div>
              <div className="space-y-4">
                {results.map((question) => (
                  <QuestionCard
                    key={question.id}
                    {...question}
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
