import { useState } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { QuestionCard } from "../components/question-card";
import { EmptyState } from "../components/empty-state";
import {
  Bookmark,
  Search,
  FolderOpen,
  Plus,
  Trash2,
  SortAsc,
} from "lucide-react";
import { toast } from "sonner";

const MOCK_SAVED = [
  {
    id: "1",
    title: "كيف يمكنني تعلم البرمجة من الصفر؟",
    description: "أنا مهتم بتعلم البرمجة ولكن لا أعرف من أين أبدأ. ما هي أفضل الموارد والمسارات للمبتدئين؟",
    author: { name: "أحمد محمد", avatar: "", reputation: 450 },
    votes: 42,
    answers: 15,
    tags: ["برمجة", "تعليم", "مبتدئين"],
    timestamp: "منذ ساعتين",
    isBookmarked: true,
    savedAt: "منذ يوم",
    folder: "برمجة",
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
    isBookmarked: true,
    savedAt: "منذ 3 أيام",
    folder: "برمجة",
  },
  {
    id: "3",
    title: "كيف أتعلم اللغة الإنجليزية بسرعة؟",
    description: "أريد تحسين مستواي في اللغة الإنجليزية في أقل وقت ممكن. ما هي أفضل الطرق والتطبيقات؟",
    author: { name: "منى سعيد", avatar: "", reputation: 280 },
    votes: 29,
    answers: 18,
    tags: ["تعليم", "لغات", "إنجليزي"],
    timestamp: "منذ يوم",
    isBookmarked: true,
    savedAt: "منذ أسبوع",
    folder: "تعليم",
  },
  {
    id: "4",
    title: "ما هي أفضل الكتب لتعلم الذكاء الاصطناعي؟",
    description: "أبحث عن مصادر موثوقة لتعلم أساسيات الذكاء الاصطناعي وتعلم الآلة.",
    author: { name: "يوسف العمري", avatar: "", reputation: 1820 },
    votes: 55,
    answers: 22,
    tags: ["ذكاء اصطناعي", "تعلم آلة", "كتب"],
    timestamp: "منذ يومين",
    isBookmarked: true,
    savedAt: "منذ أسبوع",
    folder: "ذكاء اصطناعي",
  },
];

const FOLDERS = ["الكل", "برمجة", "تعليم", "ذكاء اصطناعي", "تصميم"];

export function SavedPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("الكل");
  const [savedItems, setSavedItems] = useState(MOCK_SAVED);
  const [activeTab, setActiveTab] = useState("questions");

  const filtered = savedItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.includes(searchQuery) ||
      item.tags.some((t) => t.includes(searchQuery));
    const matchesFolder =
      activeFolder === "الكل" || item.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const handleRemove = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("تم إزالة السؤال من المحفوظات");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl animate-fade-in pb-24 md:pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Bookmark className="h-6 w-6 text-primary" />
          المحفوظات
        </h1>
        <p className="text-muted-foreground text-sm">
          {savedItems.length} عنصر محفوظ
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar: Folders */}
        <aside className="md:col-span-1">
          <Card className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">المجلدات</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => toast.info("إنشاء مجلد جديد قريباً")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-0.5">
              {FOLDERS.map((folder) => {
                const count =
                  folder === "الكل"
                    ? savedItems.length
                    : savedItems.filter((i) => i.folder === folder).length;
                if (folder !== "الكل" && count === 0) return null;
                return (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${
                      activeFolder === folder
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>{folder}</span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        activeFolder === folder
                          ? "opacity-80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-4">
          {/* Search & Sort */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في محفوظاتك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-input-background"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-lg shrink-0">
              <SortAsc className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-card border border-border">
              <TabsTrigger value="questions">
                أسئلة
                <Badge variant="secondary" className="mr-2 h-4 text-xs px-1.5">
                  {filtered.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="answers">إجابات</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="mt-4 space-y-4">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={Bookmark}
                  title="لا توجد محفوظات"
                  description="ابدأ بحفظ الأسئلة التي تهمك للرجوع إليها لاحقاً"
                  action={{ label: "استعرض الأسئلة", onClick: () => navigate("/") }}
                />
              ) : (
                filtered.map((item) => (
                  <div key={item.id} className="relative group">
                    <QuestionCard
                      {...item}
                      onClick={() => navigate(`/questions/${item.id}`)}
                    />
                    {/* Remove button overlay */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-lg p-1.5 shadow"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute top-3 left-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="outline" className="text-xs bg-card">
                        حُفظ {item.savedAt}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="answers" className="mt-4">
              <EmptyState
                icon={Bookmark}
                title="لا توجد إجابات محفوظة"
                description="يمكنك حفظ الإجابات المفيدة للرجوع إليها لاحقاً"
                action={{ label: "استعرض الأسئلة", onClick: () => navigate("/") }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
