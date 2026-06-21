import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface ProgressBarProps {
  value: number;
  target: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ value, target, className, showLabel = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const isCompliant = value >= target;
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value.toFixed(1)}%</span>
          <span className="text-muted-foreground">{t.common.target}: {target}%</span>
        </div>
      )}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCompliant ? "bg-emerald-500" : "bg-primary"
          )}
          style={{ width: `${clamped}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-500 rounded-full"
          style={{ left: `${Math.min(target, 100)}%` }}
        />
      </div>
    </div>
  );
}
