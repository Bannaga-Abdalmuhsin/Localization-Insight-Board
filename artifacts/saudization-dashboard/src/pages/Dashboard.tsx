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
  Building,
  BriefcaseBusiness,
} from "lucide-react";
import { useState } from "react";
import { useProjectData, computeMetrics, CategoryMetrics, GroupMetrics } from "@/lib/useProjectData";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import CompanyLogo from "@/components/CompanyLogo";

type ScopeFilter = "all" | "cow" | "ibs" | "aces" | "anet";

export default function Dashboard() {
  const { metrics: allMetrics, isLoading, error } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {isAr ? "جارٍ تحميل البيانات..." : "Loading data…"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
          <p className="text-sm text-destructive font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </p>
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

  const FILTERS: { key: ScopeFilter; label: string; labelAr: string; icon: any }[] = [
    { key: "all", label: "All Scope", labelAr: "النطاق الكامل", icon: Users },
    { key: "cow", label: "COW Project", labelAr: "مشروع COW", icon: Building },
    { key: "ibs", label: "IBS Project", labelAr: "مشروع IBS", icon: Building },
    { key: "aces", label: "ACES", labelAr: "ACES", icon: Building2 },
    { key: "anet", label: "Anet", labelAr: "Anet", icon: Building2 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Project Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a1d37] text-white shadow-xl isolate fade-in-up stagger-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent mix-blend-overlay" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/30 rounded-full blur-[80px]" />
        
        <div className="relative z-10 px-8 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold tracking-widest uppercase text-blue-100 flex items-center gap-1.5">
                <BriefcaseBusiness className="w-3 h-3" />
                {isAr ? "الإدارة" : "Department"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">ACES MSD</h1>
            <p className="text-sm font-medium text-blue-200 mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 opacity-70" />
              {projectNames.length > 0 ? projectNames.join(" · ") : "ACES-MSD Projects"}
            </p>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8 bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 w-full md:w-auto overflow-x-auto">
            <Stat label={isAr ? "إجمالي العمالة" : "Total Workforce"} value={totalAll} />
            <div className="w-px h-10 bg-white/10" />
            <Stat label={isAr ? "المستهدف" : "Scoped"} value={scopedTotal} />
            <div className="w-px h-10 bg-white/10" />
            <Stat label={isAr ? "سعوديون" : "Saudis"} value={scopedSaudi} highlight="green" />
            <div className="w-px h-10 bg-white/10" />
            <Stat
              label={isAr ? "الامتثال" : "Compliance"}
              value={`${(scopedPct * 100).toFixed(1)}%`}
              highlight={metrics.overallCompliant ? "green" : "red"}
              isPercentage
            />
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 fade-in-up stagger-2">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            {isAr ? "مؤشرات التوطين" : "Localization Metrics"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {isAr
              ? "مستهدفات وزارة الموارد البشرية لعام 2024/2025"
              : "HRSD localization targets for 2024/2025"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-border shadow-sm">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = scopeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setScopeFilter(f.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                  active
                    ? "bg-[#0a1d37] text-white shadow-md transform scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-blue-300" : "opacity-60")} />
                {isAr ? f.labelAr : f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 fade-in-up stagger-3">
        <CategoryCard cat={eng30} isAr={isAr} code="Eng" />
        <CategoryCard cat={tech} isAr={isAr} code="Tech" />
        <CategoryCard cat={spec} isAr={isAr} code="Spec" />
      </div>

      {/* NA Exempt Banner */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-5 flex items-center gap-4 shadow-sm fade-in-up stagger-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200/50 flex items-center justify-center flex-shrink-0 text-slate-500">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">
            {isAr ? `${naTotal} موظف (معفاة من التوطين)` : `${naTotal} Employees (Excluded)`}
          </p>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {isAr
              ? "هذه الوظائف غير خاضعة لاشتراطات التوطين بحسب تصنيف الهيئة السعودية للمهندسين"
              : "These positions do not fall under current SCE localization requirements"}
          </p>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="space-y-8 fade-in-up stagger-5">
        <BreakdownTable
          title={isAr ? "تفصيل المشاريع — مهندس" : "Project Breakdown — Engineer"}
          cat={eng30}
          isAr={isAr}
          colorTheme="blue"
        />
        <BreakdownTable
          title={isAr ? "تفصيل المشاريع — فني" : "Project Breakdown — Technician"}
          cat={tech}
          isAr={isAr}
          colorTheme="violet"
        />
        <BreakdownTable
          title={isAr ? "تفصيل المشاريع — أخصائي" : "Project Breakdown — Specialist"}
          cat={spec}
          isAr={isAr}
          colorTheme="cyan"
        />
      </div>
    </div>
  );
}

/* ── sub-components ─────────────────────────────────────── */

function Stat({
  label,
  value,
  highlight,
  isPercentage = false,
}: {
  label: string;
  value: string | number;
  highlight?: "green" | "red";
  isPercentage?: boolean;
}) {
  return (
    <div className="text-center min-w-[80px]">
      <p className="text-[11px] font-bold text-blue-200/70 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl md:text-3xl font-black tracking-tight",
          highlight === "green" ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" :
          highlight === "red" ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]" :
          "text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CategoryCard({ cat, isAr, code }: { cat: CategoryMetrics; isAr: boolean; code: string }) {
  const targetPct = cat.target * 100;
  const currentPct = cat.currentPct * 100;
  const gapPct = targetPct - currentPct;

  const labels = {
    Eng: { en: "Engineering", ar: "مهن هندسية", color: "from-blue-500 to-blue-700", bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700" },
    Spec: { en: "Specialist", ar: "مهن أخصائيين", color: "from-cyan-500 to-cyan-700", bg: "bg-cyan-500", light: "bg-cyan-50", text: "text-cyan-700" },
    Tech: { en: "Technician", ar: "مهن فنية", color: "from-violet-500 to-violet-700", bg: "bg-violet-500", light: "bg-violet-50", text: "text-violet-700" },
  };

  const theme = labels[code as keyof typeof labels] || labels.Eng;
  const statusColor = cat.isCompliant ? "text-emerald-600" : "text-red-600";
  const statusBg = cat.isCompliant ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100";

  return (
    <div className="rounded-3xl border border-border bg-white shadow-xl shadow-slate-200/50 overflow-hidden relative group transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60">
      {/* Decorative top bar */}
      <div className={cn("h-2 w-full bg-gradient-to-r", theme.color)} />
      
      {/* Card Header */}
      <div className="px-6 py-5 flex items-start justify-between border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("w-2 h-2 rounded-full", theme.bg)} />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {isAr ? "فئة التوطين" : "Category"}
            </p>
          </div>
          <h3 className="text-2xl font-black text-foreground">
            {isAr ? theme.ar : theme.en}
          </h3>
          <p className={cn("text-sm font-bold mt-1", theme.text)}>
            {targetPct}% {isAr ? "مستهدف" : "Target"}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm",
            statusBg, statusColor
          )}
        >
          {cat.isCompliant ? (
            <><ShieldCheck className="w-4 h-4" />{isAr ? "ممتثل" : "Compliant"}</>
          ) : (
            <><ShieldAlert className="w-4 h-4" />{isAr ? "غير ممتثل" : "Non-Compliant"}</>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{isAr ? "الإجمالي" : "Total"}</p>
            <p className="text-2xl font-black text-slate-800">{cat.total}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">{isAr ? "سعودي" : "Saudi"}</p>
            <p className="text-2xl font-black text-emerald-600">{cat.saudi}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100">
            <p className="text-[11px] font-bold text-amber-600/70 uppercase tracking-widest mb-1">{isAr ? "غير سعودي" : "Non-Saudi"}</p>
            <p className="text-2xl font-black text-amber-600">{cat.nonSaudi}</p>
          </div>
          <div className={cn("rounded-2xl p-4 text-center border", cat.isCompliant ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100")}>
            <p className={cn("text-[11px] font-bold uppercase tracking-widest mb-1", cat.isCompliant ? "text-emerald-600/70" : "text-red-600/70")}>{isAr ? "النسبة" : "Current"}</p>
            <p className={cn("text-2xl font-black", statusColor)}>{currentPct.toFixed(1)}%</p>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <div className="flex justify-between text-xs font-bold mb-3">
            <span className="text-slate-500">{isAr ? "التقدم" : "Progress"}</span>
            <span className="text-slate-800">{currentPct.toFixed(1)}% / {targetPct}%</span>
          </div>
          <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div
              className={cn("h-full rounded-full transition-all duration-1000 relative", cat.isCompliant ? "bg-emerald-500" : "bg-red-500")}
              style={{ width: `${Math.min(100, (currentPct / targetPct) * 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', transform: 'skewX(-20deg)' }} />
            </div>
            {/* Target line */}
            <div className="absolute top-0 bottom-0 w-1 bg-slate-800 shadow-[0_0_4px_rgba(0,0,0,0.5)] z-10" style={{ left: '100%', marginLeft: '-4px' }} />
          </div>
          {!cat.isCompliant && (
            <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg inline-flex">
              <TrendingUp className="w-3.5 h-3.5" />
              {isAr ? `فجوة التوطين: ${gapPct.toFixed(1)}%` : `Localization Gap: ${gapPct.toFixed(1)}%`}
            </div>
          )}
        </div>

        {/* Action Panel */}
        {!cat.isCompliant ? (
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-white rounded-full p-1.5 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-red-800/60 uppercase tracking-widest mb-1">
                  {isAr ? "الإجراء المطلوب" : "Required Action"}
                </p>
                <p className="text-sm font-bold text-red-900 leading-snug">
                  {isAr
                    ? `استبدال ${cat.nonSaudiToTerminate} غير سعودي بـ ${cat.saudiNeededToHire} سعودي`
                    : `Replace ${cat.nonSaudiToTerminate} Non-Saudi with ${cat.saudiNeededToHire} Saudi`}
                </p>
                <p className="text-xs font-semibold text-red-700/80 mt-2 bg-red-100/50 px-2.5 py-1 rounded-md inline-block">
                  {isAr
                    ? `للوصول للهدف (${Math.ceil(cat.target * cat.total)} من ${cat.total})`
                    : `To reach target (${Math.ceil(cat.target * cat.total)} of ${cat.total})`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-5 shadow-sm flex items-center gap-3">
            <div className="bg-white rounded-full p-2 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                {isAr ? "مستوفٍ للاشتراطات" : "Requirements Met"}
              </p>
              <p className="text-xs font-semibold text-emerald-700/80 mt-0.5">
                {isAr ? "لا توجد إجراءات تصحيحية مطلوبة" : "No corrective action needed"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownTable({
  title,
  cat,
  isAr,
  colorTheme,
}: {
  title: string;
  cat: CategoryMetrics;
  isAr: boolean;
  colorTheme: "blue" | "violet" | "cyan";
}) {
  const companies = ["Aces", "Anet"];

  const themeColors = {
    blue: { bg: "bg-blue-600", border: "border-blue-500", text: "text-blue-600", light: "bg-blue-50" },
    violet: { bg: "bg-violet-600", border: "border-violet-500", text: "text-violet-600", light: "bg-violet-50" },
    cyan: { bg: "bg-cyan-600", border: "border-cyan-500", text: "text-cyan-600", light: "bg-cyan-50" },
  };

  const theme = themeColors[colorTheme];

  return (
    <div className="rounded-3xl border border-border bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
      {/* Header */}
      <div className={cn("px-6 py-5 border-b flex items-center gap-3 text-white", theme.bg, theme.border)}>
        <Building2 className="w-5 h-5 text-white/70" />
        <h3 className="text-lg font-black tracking-tight">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-start whitespace-nowrap">
                {isAr ? "المشروع" : "Project"}
              </th>
              {companies.map((c) => (
                <th key={c} className="px-6 py-4 text-center border-s border-slate-200 whitespace-nowrap bg-white">
                  <div className="flex justify-center">
                    <CompanyLogo company={c} className="h-7" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-center border-s border-slate-200 bg-slate-800 whitespace-nowrap">
                <span className="text-xs font-bold text-white uppercase tracking-widest">
                  {isAr ? "الإجمالي" : "Total"}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cat.byProject.map((r: GroupMetrics) => {
              const totalRequired = Math.max(0, Math.ceil(cat.target * r.total) - r.saudi);
              const pct = r.total > 0 ? (r.currentPct * 100).toFixed(0) : "0";
              const isCompliant = r.isCompliant;

              return (
                <tr key={r.name} className={cn("hover:bg-slate-50/50 transition-colors", !isCompliant && "bg-red-50/20")}>
                  {/* Project Name & Status */}
                  <td className="px-6 py-5 align-middle">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", isCompliant ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]")} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{r.name}</p>
                        <p className={cn("text-xs font-bold mt-0.5", isCompliant ? "text-emerald-600" : "text-red-600")}>
                          {pct}% {isAr ? "توطين" : "Localization"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Company Breakdowns */}
                  {r.byCompany.map((c) => (
                    <td key={c.company} className="px-6 py-5 align-middle text-center border-s border-slate-100">
                      {c.total === 0 ? (
                        <span className="text-slate-300 font-bold">—</span>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="flex items-baseline gap-1 text-slate-800">
                            <span className="text-xl font-black">{c.saudi}</span>
                            <span className="text-xs font-bold text-slate-400">/{c.total}</span>
                          </div>
                          {c.required > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 w-fit">
                              +{c.required} {isAr ? "مطلوب" : "req"}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 w-fit">
                              {isAr ? "مكتمل" : "Ok"}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  ))}

                  {/* Total Column */}
                  <td className="px-6 py-5 align-middle text-center border-s border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">{r.saudi}</span>
                        <span className="text-sm font-bold text-slate-500">/{r.total}</span>
                      </div>
                      {!isCompliant ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md shadow-red-500/20 w-fit">
                          +{totalRequired} {isAr ? "مطلوب" : "needed"}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md shadow-emerald-500/20 w-fit flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {isAr ? "ممتثل" : "Compliant"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
