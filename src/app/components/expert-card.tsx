import { useNavigate } from "react-router";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, Star } from "lucide-react";

interface Expert {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  specialty: string;
  rating: number;
  answers: number;
  verified: boolean;
}

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer group"
      onClick={() => navigate(`/profile/${expert.id}`)}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarImage src={expert.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
            {expert.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {expert.verified && (
          <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-secondary bg-card rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold truncate">{expert.name}</p>
        </div>
        <p className="text-xs text-muted-foreground truncate">{expert.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 rounded-full">
            {expert.specialty}
          </Badge>
          <div className="flex items-center gap-0.5 text-[10px] text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span>{expert.rating}</span>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="flex-shrink-0 h-7 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/profile/${expert.id}`);
        }}
      >
        تابع
      </Button>
    </div>
  );
}

export const FEATURED_EXPERTS: Expert[] = [
  { id: "e1", name: "د. سارة العمري", title: "مهندسة برمجيات — Google", specialty: "تقنية", rating: 4.9, answers: 312, verified: true },
  { id: "e2", name: "محمد الزهراني", title: "مختص أمن معلومات", specialty: "أمن", rating: 4.8, answers: 245, verified: true },
  { id: "e3", name: "نورة الرشيد", title: "مصممة UI/UX — أمازون", specialty: "تصميم", rating: 4.7, answers: 198, verified: true },
];
