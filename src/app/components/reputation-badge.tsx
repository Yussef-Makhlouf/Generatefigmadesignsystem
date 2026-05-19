import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ReputationBadgeProps {
  points: number;
  className?: string;
}

export function ReputationBadge({ points, className = "" }: ReputationBadgeProps) {
  const getTier = (points: number) => {
    if (points < 100) return { name: "مبتدئ", color: "bg-gray-100 text-gray-700 border-gray-300" };
    if (points < 500) return { name: "نشط", color: "bg-blue-100 text-blue-700 border-blue-300" };
    if (points < 1000) return { name: "متميز", color: "bg-purple-100 text-purple-700 border-purple-300" };
    if (points < 5000) return { name: "خبير", color: "bg-teal-100 text-teal-700 border-teal-300" };
    return { name: "أسطورة", color: "bg-amber-100 text-amber-700 border-amber-300" };
  };

  const tier = getTier(points);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 border ${tier.color} ${className}`}
          >
            <span className="font-semibold">{points.toLocaleString('ar-SA')}</span>
            <span className="mr-1">نقطة</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>المستوى: {tier.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
