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
import { useState } from "react";
import { useProjectData, computeMetrics, CategoryMetrics, GroupMetrics } from "@/lib/useProjectData";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

type ScopeFilter = "all" | "cow" | "ibs" | "aces" | "anet";

export default function Dashboard() {
  const { metrics: allMetrics, isLoading, error } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");

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

  const filteredEmployees = allMetrics.employees.filter((e) => {
    const project = (e.project ?? "").toUpperCase();
    const company = (e.company ?? "").toLowerCase();
    switch (scopeFilter) {
      case "cow": return project.includes("COW");
      case "ibs": return project.includes("IBS");
      case "aces": return company === "aces";
      case "anet": return company === "anet";
      default: return true;
    }
  });
  const metrics = scopeFilter === "all" ? allMetrics : computeMetrics(filteredEmployees);

  const { eng30, spec, tech, totalAll, scopedTotal, scopedSaudi, scopedPct, naTotal } = metrics;
  const projectNames = Array.from(
    new Set(metrics.employees.map((e) => (e.project ?? "").trim()).filter(Boolean))
  ).sort();

  const FILTERS: { key: ScopeFilter; label: string; labelAr: string }[] = [
    { key: "all", label: "All", labelAr: "الكل" },
    { key: "cow", label: "COW Project", labelAr: "مشروع COW" },
    { key: "ibs", label: "IBS Project", labelAr: "مشروع IBS" },
    { key: "aces", label: "ACES", labelAr: "ACES" },
    { key: "anet", label: "Anet", labelAr: "Anet" },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Project Banner */}
      <div className="rounded-xl bg-sidebar text-white px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 opacity-70" />
            <span className="text-xs font-medium opacity-70 uppercase tracking-wide">
              {isAr ? "الإدارة" : "Department"}
            </span>
          </div>
          <h1 className="text-lg font-bold">ACES MSD</h1>
          <p className="text-xs opacity-60 mt-0.5">
            {projectNames.length > 0 ? projectNames.join(" · ") : "ACES-MSD"}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Stat label={isAr ? "إجمالي العمالة" : "Total Workforce"} value={totalAll} />
          <Stat label={isAr ? "خاضعون للتوطين" : "Localization Scoped"} value={scopedTotal} />
          <Stat label={isAr ? "سعوديون (التوطين)" : "Saudi (Scoped)"} value={scopedSaudi} />
          <Stat
            label={isAr ? "الامتثال الكلي" : "Overall Compliance"}
            value={`${(scopedPct * 100).toFixed(1)}%`}
            highlight={metrics.overallCompliant ? "green" : "red"}
          />
        </div>
      </div>

      {/* Scope filter buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setScopeFilter(f.key)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors",
              scopeFilter === f.key
                ? "bg-sidebar text-white border-sidebar shadow-sm"
                : "bg-white text-muted-foreground border-border hover:border-sidebar/40 hover:text-foreground"
            )}
          >
            {isAr ? f.labelAr : f.label}
          </button>
        ))}
      </div>

      {/* Section title */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-foreground">
            {isAr ? "حالة الامتثال للتوطين" : "Localization Compliance Status"}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {isAr
            ? "التصنيف حسب فئات الهيئة السعودية للمهندسين (مهندس / أخصائي / فني) والنسب وفق قرارات وزارة الموارد البشرية: المهن الهندسية 30% (قرار 93483 — نافذ من 30/06/2026)، المهن الفنية الهندسية 30% (قرار 103105 — نافذ من 27/07/2025)، مهن الأخصائيين 30%."
            : "Classified per Saudi Council of Engineers categories (Engineer / Specialist / Technician) with HRSD localization targets: Engineering professions 30% (Decision 93483 — effective 30/06/2026), Technical engineering professions 30% (Decision 103105 — effective 27/07/2025), Specialist professions 30%."}
        </p>
      </div>

      {/* Three category cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <CategoryCard cat={eng30} isAr={isAr} />
        <CategoryCard cat={tech} isAr={isAr} />
        <CategoryCard cat={spec} isAr={isAr} />
      </div>

      {/* Project breakdown — Engineers 30% */}
      <BreakdownTable
        title={isAr ? "التوزيع حسب المشروع والشركة — مهندس (هدف 30%)" : "Project & Company Breakdown — Engineer (30% target)"}
        cat={eng30}
        isAr={isAr}
      />

      {/* Project breakdown — Technicians 30% */}
      <BreakdownTable
        title={isAr ? "التوزيع حسب المشروع والشركة — فني (هدف 30%)" : "Project & Company Breakdown — Technician (30% target)"}
        cat={tech}
        isAr={isAr}
      />

      {/* Project breakdown — Specialists 30% */}
      <BreakdownTable
        title={isAr ? "التوزيع حسب المشروع والشركة — أخصائي (هدف 30%)" : "Project & Company Breakdown — Specialist (30% target)"}
        cat={spec}
        isAr={isAr}
      />

      {/* NA Exempt banner */}
      <div className="rounded-xl border border-border bg-muted/40 px-5 py-4 flex items-center gap-3">
        <Briefcase className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isAr ? `${naTotal} موظف (معفاة من التوطين)` : `${naTotal} Employees (Excluded from Localization)`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr
              ? "هذه الوظائف لا تدخل في احتساب نسبة التوطين"
              : "These positions are not included in the Localization percentage calculation."}
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
      ? isAr ? "مهندس (30%) — المهن الهندسية" : "Engineer (30%) — Engineering Professions"
      : cat.code === "Spec"
      ? isAr ? "أخصائي (30%)" : "Specialist (30%)"
      : isAr ? "فني (30%) — المهن الفنية الهندسية" : "Technician (30%) — Technical Engineering";

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
  Anet: { label: "ANET", color: "text-amber-700" },
};

function BreakdownTable({
  title,
  cat,
  isAr,
}: {
  title: string;
  cat: CategoryMetrics;
  isAr: boolean;
}) {
  const companies = ["Aces", "Anet"];

  const companyBg: Record<string, string> = {
    Aces: "bg-blue-50 border-blue-100",
    Anet: "bg-amber-50 border-amber-100",
  };
  const companyHeaderBg: Record<string, string> = {
    Aces: "bg-blue-700",
    Anet: "bg-amber-600",
  };

  return (
    <div className="rounded-2xl border border-border bg-white shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center gap-3"
           style={{ background: "linear-gradient(135deg, #0a1d37 0%, #0e2a4f 100%)" }}>
        <MapPin className="w-5 h-5 text-white/60" />
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[minmax(200px,1.4fr)_1fr_1fr_minmax(150px,1.2fr)] border-b border-border">
        <div className="px-6 py-3 bg-muted/30 flex items-end">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {isAr ? "المشروع" : "Project"}
          </span>
        </div>
        {companies.map((c) => (
          <div key={c} className={cn("px-3 py-3 flex items-center justify-center",
            c === "Aces" ? "bg-white border-b-2 border-blue-300" :
            c === "Anet" ? "bg-white border-b-2 border-amber-300" :
            companyHeaderBg[c])}>
            {c === "Aces" ? (
              <img src="/aces-logo.png" alt="ACES" className="h-8 w-auto object-contain" />
            ) : c === "Anet" ? (
              <img src="/anet-logo.png" alt="ANET" className="h-9 w-auto object-contain" />
            ) : (
              <span className="text-sm font-bold text-white tracking-wide">
                {COMPANY_LABELS[c].label}
              </span>
            )}
          </div>
        ))}
        <div className="px-6 py-3 bg-slate-700 text-center">
          <span className="text-sm font-bold text-white tracking-wide">
            {isAr ? "الإجمالي" : "Total"}
          </span>
        </div>
      </div>

      {/* Data rows */}
      <div className="divide-y divide-border">
        {cat.byProject.map((r: GroupMetrics) => {
          const totalRequired = Math.max(0, Math.ceil(cat.target * r.total) - r.saudi);
          const pct = r.total > 0 ? (r.currentPct * 100).toFixed(0) : "0";
          return (
            <div
              key={r.name}
              className={cn(
                "grid grid-cols-[minmax(200px,1.4fr)_1fr_1fr_minmax(150px,1.2fr)] items-stretch",
                !r.isCompliant && "bg-red-50/30"
              )}
            >
              {/* Project */}
              <div className="px-6 py-5 flex items-center gap-2 bg-muted/10 border-r border-border">
                {r.isCompliant
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  : <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                <p className="text-base font-bold text-foreground whitespace-nowrap">{r.name}</p>
                <p className={cn("text-sm font-semibold whitespace-nowrap", r.isCompliant ? "text-emerald-600" : "text-red-500")}>
                  {pct}%
                </p>
              </div>

              {/* Per-company */}
              {r.byCompany.map((c) => (
                <div key={c.company} className={cn("px-3 py-5 flex items-center justify-center gap-1.5 border-r border-border", companyBg[c.company])}>
                  {c.total === 0 ? (
                    <p className="text-xl font-bold text-muted-foreground/40">—</p>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-foreground whitespace-nowrap">
                        {c.saudi}
                        <span className="text-base font-normal text-muted-foreground"> / {c.total}</span>
                      </p>
                      {c.required > 0 ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-sm font-bold bg-red-100 text-red-700 whitespace-nowrap">
                          +{c.required}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                          ✓
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* Total */}
              <div className="px-6 py-5 flex items-center justify-center gap-2 bg-slate-50">
                <p className="text-xl font-bold text-foreground whitespace-nowrap">
                  {r.saudi}
                  <span className="text-base font-normal text-muted-foreground"> / {r.total}</span>
                </p>
                {!r.isCompliant ? (
                  <span className="inline-block px-3 py-0.5 rounded-full text-sm font-bold bg-red-100 text-red-700 whitespace-nowrap">
                    +{totalRequired} {isAr ? "مطلوب" : "needed"}
                  </span>
                ) : (
                  <span className="inline-block px-3 py-0.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                    {isAr ? "ممتثل" : "Compliant"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer legend */}
      <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center gap-6 text-sm text-muted-foreground">
        <span className="font-medium">{isAr ? "سعودي / الإجمالي" : "Saudi / Total"}</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
          <span>+N = {isAr ? "مطلوب" : "Replacement needed"}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
          <span>{isAr ? "ممتثل" : "Compliant"}</span>
        </span>
      </div>
    </div>
  );
}
