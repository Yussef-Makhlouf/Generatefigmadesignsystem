import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "./ui/input";
import { Search, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAutocomplete } from "../../lib/hooks";
import { questionUrl } from "./seo";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = "ابحث عن سؤال، موضوع، أو مستخدم...",
  onSearch,
  className = "",
  defaultValue = "",
}: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  // Live autocomplete suggestions from React Query hook
  const { suggestions, isLoading, isFetching } = useAutocomplete(query);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch?.(value); // Fire search callback on every keystroke so parent is updated
  };

  const showAutocomplete = isFocused && query.trim().length >= 2;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pr-9 sm:pr-10 bg-input-background border-border rounded-lg h-10 sm:h-11 text-sm sm:text-base focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {showAutocomplete && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-1.5 sm:p-2 z-50 max-h-80 sm:max-h-96 overflow-y-auto shadow-xl premium-glass-card border-strong/45 rounded-2xl">
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>جارٍ البحث في قاعدة البيانات…</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-0.5 sm:space-y-1">
              {suggestions.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="w-full p-2 sm:p-2.5 text-right hover:bg-primary-light/45 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 group border border-transparent hover:border-primary/10"
                  onMouseDown={(e) => {
                    // Prevent input blur before click registers
                    e.preventDefault();
                  }}
                  onClick={() => {
                    // Smart Premium Routing
                    if (result.type === "question") {
                      navigate(questionUrl(result.id, result.title));
                    } else if (result.type === "user" && result.metadata) {
                      navigate(`/profile/${result.metadata}`);
                    } else if (result.type === "tag" && result.metadata) {
                      navigate(`/tags/${encodeURIComponent(result.metadata)}`);
                    } else {
                      onSearch?.(result.title);
                      setQuery(result.title);
                    }
                    setIsFocused(false);
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Render User Avatar dynamic */}
                    {result.type === "user" && (
                      <Avatar className="h-7 w-7 shrink-0 ring-1 ring-border group-hover:ring-primary/45 transition-all duration-300">
                        <AvatarImage src={result.avatar_url ?? ""} />
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/20 to-secondary/20 font-bold">
                          {result.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-[10px] sm:text-xs text-text-secondary mt-0.5 numeral">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-text-secondary px-2 py-0.5 bg-muted/65 group-hover:bg-primary-light group-hover:text-primary rounded-lg transition-colors border border-border/45">
                      {result.type === "question" && "سؤال"}
                      {result.type === "tag" && "وسم"}
                      {result.type === "user" && "مستشار"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-text-secondary">
              لا توجد اقتراحات مطابقة لـ "{query}"
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
