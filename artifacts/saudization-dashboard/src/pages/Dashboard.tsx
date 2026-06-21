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
import { useProjectData, CategoryMetrics } from "@/lib/useProjectData";
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
          <h1 className="text-lg font-bold">STC COW MS</h1>
          <p className="text-xs opacity-60 mt-0.5">ACES_MSD · {isAr ? "خدمات مُدارة" : "Managed Services"}</p>
        </div>
        <div className="flex items-center gap-6">
          <Stat label={isAr ? "إجمالي العمالة" : "Total Workforce"} value={totalAll} />
          <Stat label={isAr ? "خاضعون لنطاقات" : "Nitaqat Scoped"} value={scopedTotal} />
          <Stat label={isAr ? "سعوديون (نطاقات)" : "Saudi (Scoped)"} value={scopedSaudi} />
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
          {isAr ? "حالة الامتثال لنطاقات" : "Nitaqat Compliance Status"}
        </h2>
      </div>

      {/* Two category cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <CategoryCard cat={eng} isAr={isAr} />
        <CategoryCard cat={tech} isAr={isAr} />
      </div>

      {/* Regional breakdown — Eng */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {isAr
              ? "التوزيع الإقليمي — المهن الهندسية (Eng)"
              : "Regional Breakdown — Engineering Category (Eng 30%)"}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {eng.byRegion.map((r) => (
            <div key={r.region} className="px-5 py-3 flex items-center gap-4">
              <span className="w-20 text-sm font-medium text-foreground">{r.region}</span>
              <div className="flex-1 flex items-center gap-6 text-sm">
                <span className="text-muted-foreground">
                  {isAr ? "الإجمالي:" : "Total:"} <span className="font-semibold text-foreground">{r.total}</span>
                </span>
                <span className="text-muted-foreground">
                  {isAr ? "سعودي:" : "Saudi:"} <span className="font-semibold text-emerald-600">{r.saudi}</span>
                </span>
                <span className="text-muted-foreground">
                  {isAr ? "غير سعودي:" : "Non-Saudi:"} <span className="font-semibold text-foreground">{r.nonSaudi}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", r.isCompliant ? "bg-emerald-500" : "bg-red-500")}
                    style={{ width: `${Math.min(100, r.currentPct * 100)}%` }}
                  />
                </div>
                <span className={cn("text-xs font-bold w-10 text-end", r.isCompliant ? "text-emerald-600" : "text-red-600")}>
                  {(r.currentPct * 100).toFixed(0)}%
                </span>
                {r.isCompliant
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  : <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional breakdown — Tech */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {isAr
              ? "التوزيع الإقليمي — المهن التقنية (Tech)"
              : "Regional Breakdown — Technical Category (Tech 25%)"}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {tech.byRegion.map((r) => (
            <div key={r.region} className="px-5 py-3 flex items-center gap-4">
              <span className="w-20 text-sm font-medium text-foreground">{r.region}</span>
              <div className="flex-1 flex items-center gap-6 text-sm">
                <span className="text-muted-foreground">
                  {isAr ? "الإجمالي:" : "Total:"} <span className="font-semibold text-foreground">{r.total}</span>
                </span>
                <span className="text-muted-foreground">
                  {isAr ? "سعودي:" : "Saudi:"} <span className="font-semibold text-emerald-600">{r.saudi}</span>
                </span>
                <span className="text-muted-foreground">
                  {isAr ? "غير سعودي:" : "Non-Saudi:"} <span className="font-semibold text-foreground">{r.nonSaudi}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", r.isCompliant ? "bg-emerald-500" : "bg-red-500")}
                    style={{ width: `${Math.min(100, r.currentPct * 100)}%` }}
                  />
                </div>
                <span className={cn("text-xs font-bold w-10 text-end", r.isCompliant ? "text-emerald-600" : "text-red-600")}>
                  {(r.currentPct * 100).toFixed(0)}%
                </span>
                {r.isCompliant
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  : <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NA Exempt banner */}
      <div className="rounded-xl border border-border bg-muted/40 px-5 py-4 flex items-center gap-3">
        <Briefcase className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isAr ? `${naTotal} موظف — فئة NA (معفاة من نطاقات)` : `${naTotal} Employees — NA Category (Exempt from Nitaqat)`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "هذه الوظائف (عمال إنشاءات، كهربائيون، نجارون...) لا تدخل في احتساب نطاقات قطاع الاتصالات."
              : "These roles (construction workers, electricians, carpenters…) fall outside the Nitaqat classification for the telecom sector."}
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
            {cat.code} — {codeLabel}
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

            <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
              <ArrowUpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  {isAr ? `توظيف ${cat.saudiNeededToHire} سعودي` : `Hire ${cat.saudiNeededToHire} Saudi national${cat.saudiNeededToHire !== 1 ? "s" : ""}`}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {isAr
                    ? `الإجمالي يرتفع إلى ${cat.total + cat.saudiNeededToHire} موظف مع ${cat.saudi + cat.saudiNeededToHire} سعودي`
                    : `Total rises to ${cat.total + cat.saudiNeededToHire} — ${cat.saudi + cat.saudiNeededToHire} Saudi out of ${cat.total + cat.saudiNeededToHire}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
              <MinusCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {isAr
                    ? `إنهاء عقود ${cat.nonSaudiToTerminate} غير سعودي`
                    : `Terminate ${cat.nonSaudiToTerminate} Non-Saudi contract${cat.nonSaudiToTerminate !== 1 ? "s" : ""}`}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {isAr
                    ? `الفريق ينخفض إلى ${cat.targetTotal} موظف — ${cat.saudi} سعودي من ${cat.targetTotal}`
                    : `Team reduces to ${cat.targetTotal} — ${cat.saudi} Saudi out of ${cat.targetTotal} (exactly ${targetPct}%)`}
                </p>
              </div>
            </div>
          </div>
        )}

        {cat.isCompliant && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-emerald-700">
              {isAr ? "مستوفٍ لاشتراطات نطاقات" : "Nitaqat requirements met"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
