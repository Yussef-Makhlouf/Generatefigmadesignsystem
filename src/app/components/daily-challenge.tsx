import { useState } from "react";
import { useNavigate } from "react-router";
import { Zap, Clock, Award } from "lucide-react";
import { Button } from "./ui/button";

export function DailyChallenge() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-l from-primary via-primary/90 to-secondary p-5 text-white shadow-lg">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-white translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Zap className="h-6 w-6 text-yellow-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              تحدي اليوم
            </span>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <Clock className="h-3 w-3" />
              <span>ينتهي خلال ١٨ ساعة</span>
            </div>
          </div>
          <h3 className="font-bold text-base leading-snug mb-2">
            ما هي أبرز الفروق بين REST API و GraphQL؟
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-white/80">
              <Award className="h-3 w-3 text-yellow-300" />
              <span>+50 نقطة للإجابة الأفضل</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex gap-2">
        <Button
          size="sm"
          className="bg-white text-primary hover:bg-white/90 rounded-lg flex-1"
          onClick={() => navigate("/questions/1")}
        >
          أجب الآن
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
          onClick={() => setDismissed(true)}
        >
          لاحقاً
        </Button>
      </div>
    </div>
  );
}
