import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAutocompleteSuggestions, type AutocompleteSuggestion } from "../services/stats.service";

// Debounce helper inside the hook file for clean encapsulation
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/**
 * Hook to retrieve live autocomplete suggestions for a search query.
 * Implements debouncing (300ms) and prevents querying for short strings (< 2 chars).
 */
export function useAutocomplete(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  const enabled = debouncedQuery.trim().length >= 2;

  const { data = [], isLoading, isFetching } = useQuery<AutocompleteSuggestion[]>({
    queryKey: ["autocomplete-suggestions", debouncedQuery],
    queryFn: () => getAutocompleteSuggestions(debouncedQuery),
    enabled,
    staleTime: 60 * 1000, // 1 minute cache
  });

  return {
    suggestions: enabled ? data : [],
    isLoading: enabled ? isLoading : false,
    isFetching: enabled ? isFetching : false,
  };
}
