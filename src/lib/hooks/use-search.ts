import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchQuestions, type SearchOptions } from "../services/stats.service";
import type { Question } from "../database.types";

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useBackendSearch(opts: SearchOptions) {
  const debouncedQuery = useDebounce(opts.query, 350);

  const enabled = debouncedQuery.trim().length > 0 ||
    (opts.category !== undefined && opts.category !== "all") ||
    (opts.location !== undefined && opts.location !== "all") ||
    !!opts.unansweredOnly;

  return useQuery<Question[]>({
    queryKey: ["search", debouncedQuery, opts.category, opts.location, opts.sortBy, opts.unansweredOnly, opts.limit, opts.offset],
    queryFn: () => searchQuestions({ ...opts, query: debouncedQuery }),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: (prev) => prev,
  });
}
