import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  UserX,
  MapPin,
  Briefcase,
  ArrowUpCircle,
  MinusCircle,
  Building2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useProjectData, CategoryMetrics, RegionMetrics } from "@/lib/useProjectData";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { metrics, isLoading, error } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {isAr ? "جارٍ تحميل البيانات..." : "Loading data…"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const { eng, tech, totalAll, scopedTotal, scopedSaudi, scopedPct, naTotal } = metrics;

  return (
    <div className="p-6 space-y-6">

      {/* Project Banner */}
      <div className="rounded-xl bg-sidebar text-white px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 opacity-70" />
            <span className="text-xs font-medium opacity-70 uppercase tracking-wide">
              {isAr ? "المشروع" : "Project"}
            </span>
          </div>
          <h1 className="text-lg font-bold">stc COW MS</h1>
          <p className="text-xs opacity-60 mt-0.5">ACES-MSD</p>
        </div>
        <div className="flex items-center gap-6">
          <Stat label={isAr ? "إجمالي العمالة" : "Total Workforce"} value={totalAll} />
          <Stat label={isAr ? "خاضعون للتوطين" : "Localization Scoped"} value={scopedTotal} />
          <Stat label={isAr ? "سعوديون (التوطين)" : "Saudi (Scoped)"} value={scopedSaudi} />
          <Stat
            label={isAr ? "الامتثال الكلي" : "Overall Compliance"}
            value={`${(scopedPct * 100).toFixed(1)}%`}
            highlight={scopedPct >= 0.25 ? "green" : "red"}
          />
        </div>
      </div>

      {/* Section title */}
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-bold text-foreground">
          {isAr ? "حالة الامتثال للتوطين" : "Localization Compliance Status"}
        </h2>
      </div>

      {/* Two category cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CategoryCard cat={eng} isAr={isAr} />
        <CategoryCard cat={tech} isAr={isAr} />
      </div>

      {/* Regional breakdown — Eng */}
      <RegionalTable
        title={isAr ? "التوزيع الإقليمي — المهن الهندسية" : "Regional Breakdown — Engineering Category (30%)"}
        cat={eng}
        isAr={isAr}
      />

      {/* Regional breakdown — Tech */}
      <RegionalTable
        title={isAr ? "التوزيع الإقليمي — المهن التقنية" : "Regional Breakdown — Technical Category (25%)"}
        cat={tech}
        isAr={isAr}
      />

      {/* NA Exempt banner */}
      <div className="rounded-xl border border-border bg-muted/40 px-5 py-4 flex items-center gap-3">
        <Briefcase className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isAr ? `${naTotal} موظف — فئة NA (معفاة من التوطين)` : `${naTotal} Employees — NA Category (Exempt from Localization)`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "هذه الوظائف (عمال إنشاءات، كهربائيون، نجارون...) لا تدخل في احتساب التوطين لقطاع الاتصالات."
              : "These roles (construction workers, electricians, carpenters…) fall outside the Localization classification for the telecom sector."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── sub-components ─────────────────────────────────────── */

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: "green" | "red";
}) {
  return (
    <div className="text-center">
      <p
        className={cn(
          "text-xl font-bold",
          highlight === "green" && "text-emerald-400",
          highlight === "red" && "text-red-400",
          !highlight && "text-white"
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-white/50 mt-0.5">{label}</p>
    </div>
  );
}

function CategoryCard({ cat, isAr }: { cat: CategoryMetrics; isAr: boolean }) {
  const targetPct = cat.target * 100;
  const currentPct = cat.currentPct * 100;
  const gapPct = targetPct - currentPct;

  const codeLabel =
    cat.code === "Eng"
      ? isAr ? "المهن الهندسية" : "Engineering"
      : isAr ? "المهن التقنية" : "Technical";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm overflow-hidden",
        cat.isCompliant ? "border-emerald-200" : "border-red-200"
      )}
    >
      {/* Card header */}
      <div
        className={cn(
          "px-5 py-3 flex items-center justify-between",
          cat.isCompliant ? "bg-emerald-50" : "bg-red-50"
        )}
      >
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {isAr ? "الفئة" : "Category"}
          </p>
          <p className="text-sm font-bold text-foreground">
            {codeLabel}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold",
            cat.isCompliant
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {cat.isCompliant ? (
            <><ShieldCheck className="w-3.5 h-3.5" />{isAr ? "ممتثل" : "Compliant"}</>
          ) : (
            <><ShieldAlert className="w-3.5 h-3.5" />{isAr ? "غير ممتثل" : "Not Compliant"}</>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Numbers row */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{cat.total}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{isAr ? "الإجمالي" : "Total"}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{cat.saudi}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{isAr ? "سعودي" : "Saudi"}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{cat.nonSaudi}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{isAr ? "غير سعودي" : "Non-Saudi"}</p>
          </div>
          <div>
            <p className={cn("text-2xl font-bold", cat.isCompliant ? "text-emerald-600" : "text-red-600")}>
              {currentPct.toFixed(1)}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{isAr ? "الحالي" : "Current"}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{isAr ? "التقدم نحو الهدف" : "Progress to target"}</span>
            <span className="font-medium text-foreground">{isAr ? "الهدف:" : "Target:"} {targetPct}%</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", cat.isCompliant ? "bg-emerald-500" : "bg-red-500")}
              style={{ width: `${Math.min(100, (currentPct / targetPct) * 100)}%` }}
            />
            {/* Target marker */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/30" style={{ left: "100%" }} />
          </div>
          {!cat.isCompliant && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {isAr ? `فجوة: ${gapPct.toFixed(1)}%` : `Gap: ${gapPct.toFixed(1)}%`}
            </p>
          )}
        </div>

        {/* Action options */}
        {!cat.isCompliant && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              {isAr ? "الامتثال المطلوب" : "Compliance Required"}
            </p>

            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3">
              <MinusCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  {isAr
                    ? `استبدال ${cat.nonSaudiToTerminate} غير سعودي بـ ${cat.saudiNeededToHire} سعودي`
                    : `Replace ${cat.nonSaudiToTerminate} Non-Saudi${cat.nonSaudiToTerminate !== 1 ? "s" : ""} with ${cat.saudiNeededToHire} Saudi national${cat.saudiNeededToHire !== 1 ? "s" : ""}`}
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  {isAr
                    ? `المطلوب: ${Math.ceil(cat.target * cat.total)} سعودي من إجمالي ${cat.total} موظف`
                    : `Required: ${Math.ceil(cat.target * cat.total)} Saudi out of ${cat.total} employees (${Math.round(cat.target * 100)}% target)`}
                </p>
              </div>
            </div>
          </div>
        )}

        {cat.isCompliant && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">
              {isAr ? "مستوفٍ لاشتراطات التوطين" : "Localization requirements met"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const COMPANY_LABELS: Record<string, { label: string; color: string }> = {
  Aces: { label: "ACES", color: "text-primary" },
  Mac:  { label: "MAC",  color: "text-violet-700" },
  Anet: { label: "ANET", color: "text-amber-700" },
};

function RegionalTable({
  title,
  cat,
  isAr,
}: {
  title: string;
  cat: CategoryMetrics;
  isAr: boolean;
}) {
  const companies = ["Aces", "Mac", "Anet"];
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[120px_1fr_1fr_1fr_auto] gap-0 border-b border-border bg-muted/40 px-5 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <span>{isAr ? "المنطقة" : "Region"}</span>
        {companies.map((c) => (
          <span key={c} className={cn("text-center", COMPANY_LABELS[c].color)}>
            {COMPANY_LABELS[c].label}
          </span>
        ))}
        <span className="text-end w-24">{isAr ? "الإجمالي" : "Total"}</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {cat.byRegion.map((r: RegionMetrics) => {
          const totalRequired = Math.max(0, Math.ceil(cat.target * r.total) - r.saudi);
          return (
            <div
              key={r.region}
              className="grid grid-cols-[120px_1fr_1fr_1fr_auto] gap-0 px-5 py-3 items-center"
            >
              {/* Region label */}
              <div className="flex items-center gap-1.5">
                {r.isCompliant
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                <span className="text-sm font-medium text-foreground">{r.region}</span>
              </div>

              {/* Per-company columns */}
              {r.byCompany.map((c) => (
                <div key={c.company} className="text-center space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">{c.saudi}<span className="text-muted-foreground font-normal">/{c.total}</span></p>
                  {c.required > 0 && (
                    <p className="text-xs font-bold text-red-600">+{c.required}</p>
                  )}
                  {c.required === 0 && c.total > 0 && (
                    <p className="text-xs text-emerald-600">✓</p>
                  )}
                  {c.total === 0 && (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </div>
              ))}

              {/* Total column */}
              <div className="w-24 text-end space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {r.saudi}<span className="text-muted-foreground font-normal">/{r.total}</span>
                </p>
                {!r.isCompliant && (
                  <p className="text-xs font-bold text-red-600">+{totalRequired}</p>
                )}
                {r.isCompliant && (
                  <p className="text-xs text-emerald-600">{(r.currentPct * 100).toFixed(0)}%</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-2.5 border-t border-border bg-muted/20 flex items-center gap-4 text-xs text-muted-foreground">
        <span>{isAr ? "القراءة: سعودي / إجمالي" : "Read as: Saudi / Total"}</span>
        <span className="text-red-600 font-semibold">+N = {isAr ? "مطلوب" : "Required"}</span>
      </div>
    </div>
  );
}
