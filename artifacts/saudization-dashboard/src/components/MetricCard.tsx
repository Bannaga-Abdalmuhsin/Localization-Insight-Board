import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  accent?: "default" | "success" | "warning" | "danger" | "purple";
  "data-testid"?: string;
}

const accentStyles = {
  default: "bg-white border-border",
  purple: "bg-primary/5 border-primary/20",
  success: "bg-emerald-50 border-emerald-200",
  warning: "bg-amber-50 border-amber-200",
  danger: "bg-red-50 border-red-200",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  purple: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

const valueStyles = {
  default: "text-foreground",
  purple: "text-primary",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-red-700",
};

export default function MetricCard({
  label,
  value,
  sub,
  icon,
  accent = "default",
  "data-testid": testId,
}: MetricCardProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        accentStyles[accent]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
          <p className={cn("text-3xl font-bold tabular-nums", valueStyles[accent])}>
            {value}
          </p>
          {sub && <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        {icon && (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3", iconStyles[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
