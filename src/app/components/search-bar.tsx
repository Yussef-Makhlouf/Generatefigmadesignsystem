import { useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { Card } from "./ui/card";

interface SearchResult {
  type: "question" | "tag" | "user";
  id: string;
  title: string;
  subtitle?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "ابحث عن سؤال، موضوع، أو مستخدم...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Mock search results for demonstration
  const mockResults: SearchResult[] = [
    { type: "question", id: "1", title: "كيف أبدأ في تعلم البرمجة؟", subtitle: "5 إجابات" },
    { type: "question", id: "2", title: "ما هي أفضل لغة برمجة للمبتدئين؟", subtitle: "8 إجابات" },
    { type: "tag", id: "3", title: "برمجة", subtitle: "452 سؤال" },
    { type: "tag", id: "4", title: "تكنولوجيا", subtitle: "328 سؤال" },
    { type: "user", id: "5", title: "أحمد محمد", subtitle: "1,250 نقطة" },
  ];

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setResults(mockResults);
    } else {
      setResults([]);
    }
  };

  const showAutocomplete = isFocused && query.trim() && results.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pr-10 bg-input-background border-border rounded-lg"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {showAutocomplete && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-2 z-50 max-h-96 overflow-y-auto shadow-lg">
          <div className="space-y-1">
            {results.map((result) => (
              <button
                key={result.id}
                className="w-full p-3 text-right hover:bg-accent rounded-lg transition-colors"
                onClick={() => {
                  onSearch?.(result.title);
                  setQuery(result.title);
                  setIsFocused(false);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                      {result.type === "question" && "سؤال"}
                      {result.type === "tag" && "وسم"}
                      {result.type === "user" && "مستخدم"}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
