import { useNavigate } from "react-router";
import { TrendingUp, Flame } from "lucide-react";

const topics = [
  { label: "الذكاء الاصطناعي", count: 1240, hot: true },
  { label: "React", count: 890, hot: true },
  { label: "Python", count: 756 },
  { label: "تعلم آلي", count: 634 },
  { label: "تطوير الويب", count: 521 },
  { label: "أمن المعلومات", count: 410 },
  { label: "قواعد البيانات", count: 388 },
  { label: "تصميم UI/UX", count: 312 },
  { label: "DevOps", count: 278 },
  { label: "Flutter", count: 245 },
  { label: "TypeScript", count: 234 },
  { label: "ريادة الأعمال", count: 198 },
];

export function TrendingTopics() {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground">الأكثر تداولاً</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {topics.map((topic) => (
          <button
            key={topic.label}
            onClick={() => navigate(`/search?q=${topic.label}`)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary hover:bg-primary/5 hover:text-primary transition-all text-sm text-foreground"
          >
            {topic.hot && <Flame className="h-3 w-3 text-orange-500" />}
            <span>{topic.label}</span>
            <span className="text-xs text-muted-foreground">{topic.count.toLocaleString("ar-SA")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
