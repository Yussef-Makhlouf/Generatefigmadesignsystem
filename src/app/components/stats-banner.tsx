import { Users, MessageSquare, CheckCircle, Globe } from "lucide-react";

const stats = [
  { icon: Users, label: "عضو نشط", value: "٤٨K+", color: "text-primary" },
  { icon: MessageSquare, label: "سؤال", value: "١٢٠K+", color: "text-secondary" },
  { icon: CheckCircle, label: "إجابة موثقة", value: "٣٤٠K+", color: "text-green-500" },
  { icon: Globe, label: "مدينة عربية", value: "٢٢", color: "text-orange-500" },
];

export function StatsBanner() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-3 flex flex-col items-center text-center hover:shadow-sm transition-shadow"
          >
            <Icon className={`h-5 w-5 mb-1 ${stat.color}`} />
            <span className="text-lg font-bold">{stat.value}</span>
            <span className="text-xs text-muted-foreground leading-tight">{stat.label}</span>
          </div>
        );
      })}
    </div>
  );
}
