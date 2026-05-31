import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppState } from "../context/AppStateContext";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { QuestionCard } from "../components/question-card";
import { EmptyState } from "../components/empty-state";
import { questionToCardProps } from "../../lib/database.types";
import {
  Bookmark,
  Search,
  FolderOpen,
  Plus,
  Trash2,
  SortAsc,
} from "lucide-react";
import { toast } from "sonner";

export function SavedPage() {
  const navigate = useNavigate();
  const { questions, bookmarkedIds, toggleBookmark, voteQuestion, userVotes = {} } = useAppState();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("الكل");
  const [activeTab, setActiveTab] = useState("questions");

  const savedItems = questions
    .filter((q) => bookmarkedIds.includes(q.id))
    .map((q) => {
      const tagNames = (q.tags ?? []).map((t) =>
        typeof t === "string" ? t : (t as { name: string }).name
      );
      return {
        ...q,
        isBookmarked: true,
        savedAt: "منذ قليل",
        folder: tagNames[0] || "عام",
        _tagNames: tagNames,
      };
    });

  const folders = ["الكل", ...new Set(savedItems.map((i) => i.folder))];

  const filtered = savedItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.includes(searchQuery) ||
      item._tagNames.some((t) => t.includes(searchQuery));
    const matchesFolder =
      activeFolder === "الكل" || item.folder === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const handleRemove = (id: string) => {
    toggleBookmark(id);
    toast.success("تم إزالة السؤال من المحفوظات");
  };

  return (
    <div className="max-w-5xl w-full mx-auto animate-fade-in pb-4 relative">
      {/* Immersive background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      {/* Page Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-2xl font-extrabold flex items-center gap-2.5 mb-1.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/10">
            <Bookmark className="h-5 w-5 text-white" />
          </div>
          المحفوظات المعرفية
        </h1>
        <p className="text-sm text-text-secondary">
          لديك <span className="numeral font-bold text-primary">{savedItems.length}</span> عنصر محفوظ للرجوع إليه لاحقاً
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 relative z-10">
        {/* Sidebar: Folders list */}
        <aside className="md:col-span-1">
          <Card className="p-4 premium-glass-card relative overflow-hidden animate-fade-in-up">
            <div className="absolute inset-0 arabic-geometric-mesh-fine opacity-[0.03] pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="font-bold text-sm text-foreground">مجلدات الحفظ</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
                onClick={() => toast.info("إنشاء مجلد جديد قريباً")}
              >
                <Plus className="h-4.5 w-4.5" />
              </Button>
            </div>
            
            <nav className="space-y-1.5 relative z-10">
              {folders.map((folder) => {
                const count =
                  folder === "الكل"
                    ? savedItems.length
                    : savedItems.filter((i) => i.folder === folder).length;
                if (folder !== "الكل" && count === 0) return null;
                return (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-300 text-sm border ${
                      activeFolder === folder
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20 scale-[1.02]"
                        : "bg-transparent border-transparent hover:bg-primary/5 text-text-secondary hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <span className="font-medium">{folder}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full numeral ${
                        activeFolder === folder
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
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
        <div className="md:col-span-3 space-y-5">
          {/* Search & Sort Panel */}
          <div className="flex gap-3">
            <div className="flex-1 relative input-glow rounded-xl">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في محفوظاتك الخاصة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-card/40 backdrop-blur-sm border-border/80 h-11 rounded-xl text-foreground"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-xl shrink-0 h-11 w-11 border-border/80 hover:bg-primary/5 hover:text-primary transition-all duration-300">
              <SortAsc className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-card/45 backdrop-blur-md border border-border/85 rounded-xl p-1">
              <TabsTrigger value="questions" className="rounded-lg transition-all duration-200">
                أسئلة محفوظة
                <Badge variant="secondary" className="mr-2 h-5 text-xs px-2 rounded-md numeral font-bold bg-primary-light text-primary">
                  {filtered.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="answers" className="rounded-lg transition-all duration-200">إجابات محفوظة</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="mt-4 space-y-4 animate-fade-in">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={Bookmark}
                  title="لا توجد عناصر محفوظة هنا"
                  description="ابدأ باستكشاف الأسئلة وحفظ المهم منها لتجده سريعاً في هذا المكان"
                  action={{ label: "استعرض الأسئلة والمناقشات", onClick: () => navigate("/") }}
                />
              ) : (
                filtered.map((item) => (
                  <div key={item.id} className="relative group rounded-2xl overflow-hidden">
                    <QuestionCard
                      {...questionToCardProps(item)}
                      isBookmarked={true}
                      userVote={userVotes[item.id]}
                      onVote={(dir) => voteQuestion(item.id, dir)}
                      onBookmark={() => toggleBookmark(item.id)}
                      onClick={() => navigate(`/questions/${item.id}`)}
                    />
                    
                    {/* Remove button overlay with premium touch */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-destructive/90 hover:bg-destructive text-white rounded-xl p-2 shadow-md hover:scale-105"
                      title="إزالة من المحفوظات"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute top-3 left-12 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Badge variant="outline" className="text-xs bg-card/90 backdrop-blur-sm shadow-sm border-border/40 py-1 rounded-xl">
                        حُفظ {item.savedAt}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="answers" className="mt-4 animate-fade-in">
              <EmptyState
                icon={Bookmark}
                title="لا توجد إجابات محفوظة"
                description="يمكنك حفظ الإجابات والردود المفيدة للرجوع إليها لاحقاً بضغطة زر واحدة"
                action={{ label: "استعرض الأسئلة والمناقشات", onClick: () => navigate("/") }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
