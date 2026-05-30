import { useQuery } from "@tanstack/react-query";
import { getCategoriesWithCounts, getCategoryColor, type CategoryStat } from "../services/stats.service";

export interface CategoryWithColor extends CategoryStat {
  color: string;
}

export function useCategories(limit = 6) {
  const { data, isLoading } = useQuery<CategoryStat[]>({
    queryKey: ["categories", limit],
    queryFn: () => getCategoriesWithCounts(limit),
    // Refresh every 5 minutes; categories don't change often
    staleTime: 5 * 60 * 1000,
    // Show empty list while loading (no placeholder flicker)
    placeholderData: [],
  });

  const categories: CategoryWithColor[] = (data ?? []).map((cat) => ({
    ...cat,
    color: getCategoryColor(cat.name),
  }));

  return { categories, isLoading };
}
