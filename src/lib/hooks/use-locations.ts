import { useQuery } from "@tanstack/react-query";
import { getDistinctLocations } from "../services/stats.service";

/**
 * Returns all unique location values currently stored in the questions table.
 * The "all" sentinel entry is prepended so the dropdown always has a default.
 */
export function useLocations() {
  const { data = [], isLoading } = useQuery<string[]>({
    queryKey: ["distinct-locations"],
    queryFn: getDistinctLocations,
    staleTime: 5 * 60 * 1000, // 5 minutes — locations don't change often
    placeholderData: [],
  });

  const options = [
    { value: "all", label: "جميع المواقع" },
    ...data.map((loc) => ({ value: loc, label: loc })),
  ];

  return { options, isLoading };
}
