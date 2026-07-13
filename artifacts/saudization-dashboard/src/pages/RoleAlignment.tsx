import { useState } from "react";
import { Search, CheckCircle2, AlertTriangle, HelpCircle, Download, CircleDot, GitCompareArrows } from "lucide-react";
import { useProjectData } from "@/lib/useProjectData";
import { matchProfession, localizeProfession, MatchStatus } from "@/lib/professionMatch";
import CompanyLogo, { REGION_AR } from "@/components/CompanyLogo";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const STATUS_CONFIG: Record<MatchStatus, { icon: React.ElementType; labelEn: string; labelAr: string; badge: string; row: string }> = {
  match:       { icon: CheckCircle2,  labelEn: "Match",        labelAr: "متطابق",       badge: "bg-emerald-50 text-emerald-700 border-emerald-200", row: "" },
  conditional: { icon: CircleDot,     labelEn: "Conditional",  labelAr: "مشروط",        badge: "bg-sky-50 text-sky-700 border-sky-200",        row: "bg-sky-50/30" },
  mismatch:    { icon: AlertTriangle, labelEn: "Mismatch",     labelAr: "غير متطابق",   badge: "bg-red-50 text-red-700 border-red-200",        row: "bg-red-50/40" },
  review:      { icon: HelpCircle,    labelEn: "Needs Review", labelAr: "يحتاج مراجعة", badge: "bg-amber-50 text-amber-700 border-amber-200",    row: "bg-amber-50/30" },
};

export default function RoleAlignment() {
  const { metrics, isLoading } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";

  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<"all" | MatchStatus>("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [regionFilter, setRegionFilter]   = useState("all");

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

  const employees = metrics.employees;
  const regions   = Array.from(new Set(employees.map((e) => e.region  ?? "").filter(Boolean))).sort();
  const companies = Array.from(new Set(employees.map((e) => e.company ?? "").filter(Boolean))).sort();

  const rows = employees.map((emp) => ({
    emp,
    result: matchProfession(emp.job_title, emp.iqama_profession),
    title: localizeProfession(emp.job_title, lang),
    profession: localizeProfession(emp.iqama_profession, lang),
  }));

  const filtered = rows.filter(({ emp, result, title, profession }) => {
    if (statusFilter  !== "all" && result.status !== statusFilter)   return false;
    if (companyFilter !== "all" && emp.company !== companyFilter)     return false;
    if (regionFilter  !== "all" && emp.region  !== regionFilter)      return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !emp.employee_name.toLowerCase().includes(q) &&
        !title.text.toLowerCase().includes(q) &&
        !title.original.toLowerCase().includes(q) &&
        !profession.text.toLowerCase().includes(q) &&
        !profession.original.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const counts = {
    match:       rows.filter((r) => r.result.status === "match").length,
    conditional: rows.filter((r) => r.result.status === "conditional").length,
    mismatch:    rows.filter((r) => r.result.status === "mismatch").length,
    review:      rows.filter((r) => r.result.status === "review").length,
  };

  function exportCsv() {
    const header = ["#", "Employee Name", "Company", "Region", "Job Title", "Job Title (original)", "Iqama Profession", "Iqama Profession (original)", "Status", "Confidence", "Job Category", "Iqama Category", "Explanation"];
    const csvRows = filtered.map(({ emp, result, title, profession }, i) => [
      (emp.employee_no ?? i + 1),
      `"${emp.employee_name}"`,
      emp.company ?? "",
      emp.region  ?? "",
      `"${title.text}"`,
      `"${title.original}"`,
      `"${profession.text}"`,
      `"${profession.original}"`,
      result.status,
      `${result.confidence}%`,
      result.jobCategory  ?? "",
      result.iqamaCategory ?? "",
      `"${result.explanation.replace(/"/g, "'")}"`,
    ].join(","));
    const blob = new Blob([[header.join(","), ...csvRows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "role-alignment.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 fade-in-up stagger-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <GitCompareArrows className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isAr ? "مطابقة المهن" : "Role Alignment"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {isAr
                ? "مقارنة المسمى الوظيفي الفعلي مع المهنة المسجلة في الإقامة لكل موظف"
                : "Compare each employee's actual job title against their Iqama registered profession"}
            </p>
          </div>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1d37] hover:bg-[#15345a] text-white text-sm font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" />
          {isAr ? "تصدير CSV" : "Export CSV"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 fade-in-up stagger-2">
        {[
          { key: "all",         label: isAr ? "إجمالي الموظفين" : "Total Employees", value: rows.length,        badge: "bg-slate-100 text-slate-700 border-slate-200",   icon: null },
          { key: "match",       label: isAr ? "متطابق"          : "Match",           value: counts.match,       badge: STATUS_CONFIG.match.badge,       icon: CheckCircle2  },
          { key: "conditional", label: isAr ? "مشروط"           : "Conditional",     value: counts.conditional, badge: STATUS_CONFIG.conditional.badge, icon: CircleDot     },
          { key: "mismatch",    label: isAr ? "غير متطابق"      : "Mismatch",        value: counts.mismatch,    badge: STATUS_CONFIG.mismatch.badge,    icon: AlertTriangle },
          { key: "review",      label: isAr ? "يحتاج مراجعة"   : "Needs Review",    value: counts.review,      badge: STATUS_CONFIG.review.badge,      icon: HelpCircle    },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key as "all" | MatchStatus)}
            className={cn(
              "rounded-2xl border bg-white shadow-sm px-5 py-4 text-start transition-all duration-200 group flex flex-col items-start gap-2",
              statusFilter === s.key ? "ring-2 ring-primary border-primary shadow-md scale-[1.02]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <p className="text-3xl font-black text-slate-800">{s.value}</p>
            <div className="flex items-center gap-1.5 mt-auto">
              {s.icon && <s.icon className={cn("w-4 h-4", statusFilter === s.key ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />}
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg border", s.badge)}>{s.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm fade-in-up stagger-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "بحث بالاسم أو الوظيفة..." : "Search name or title…"}
            className="w-full h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ps-10 pe-4"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | MatchStatus)}
          className="h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-3 cursor-pointer"
        >
          <option value="all">{isAr ? "جميع الحالات" : "All Statuses"}</option>
          <option value="match">{isAr ? "متطابق" : "Match"}</option>
          <option value="conditional">{isAr ? "مشروط" : "Conditional"}</option>
          <option value="mismatch">{isAr ? "غير متطابق" : "Mismatch"}</option>
          <option value="review">{isAr ? "يحتاج مراجعة" : "Needs Review"}</option>
        </select>

        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-3 cursor-pointer"
        >
          <option value="all">{isAr ? "جميع الشركات" : "All Companies"}</option>
          {companies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-3 cursor-pointer"
        >
          <option value="all">{isAr ? "جميع المناطق" : "All Regions"}</option>
          {regions.map((r) => <option key={r} value={r}>{isAr ? (REGION_AR[r] ?? r) : r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden fade-in-up stagger-4">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600">
            {isAr ? `${filtered.length} موظف` : `${filtered.length} employees`}
          </span>
          <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            {isAr
              ? "تم توحيد المسمى والمهنة إلى اللغة العربية؛ النص الأصلي يظهر أسفل كل قيمة للمراجعة"
              : "Title & profession unified to English; the original text appears beneath each value for audit"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-bold text-slate-700">
              {isAr ? "لا توجد نتائج." : "No results."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    isAr ? "#" : "#",
                    isAr ? "اسم الموظف" : "Employee Name",
                    isAr ? "الشركة" : "Company",
                    isAr ? "المنطقة" : "Region",
                    isAr ? "المسمى الوظيفي" : "Job Title",
                    isAr ? "مهنة الإقامة" : "Iqama Profession",
                    isAr ? "الفئة المكتشفة" : "Detected Category",
                    isAr ? "الحالة" : "Status",
                  ].map((h) => (
                    <th key={h} className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-start whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ emp, result, title, profession }, idx) => {
                  const cfg = STATUS_CONFIG[result.status];
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={emp.id}
                      className={cn("transition-colors group", cfg.row, idx % 2 === 0 ? "" : "bg-slate-50/50 hover:bg-slate-50/80")}
                    >
                      <td className="px-4 py-4 align-middle tabular-nums text-slate-400 font-bold text-xs">{emp.employee_no ?? idx + 1}</td>

                      <td className="px-4 py-4 align-middle font-bold text-slate-800 whitespace-nowrap">{emp.employee_name}</td>

                      <td className="px-4 py-4 align-middle">
                        {emp.company
                          ? <CompanyLogo company={emp.company} className="h-6" />
                          : <span className="text-slate-400 font-bold">—</span>}
                      </td>

                      <td className="px-4 py-4 align-middle text-slate-600 font-medium whitespace-nowrap border-s border-slate-100">
                        {emp.region ? (isAr ? (REGION_AR[emp.region] ?? emp.region) : emp.region) : "—"}
                      </td>

                      <td className="px-4 py-4 align-middle text-slate-800 border-s border-slate-100">
                        {title.text ? (
                          <div className="flex flex-col gap-1">
                            <span className={cn("font-bold text-sm", !title.classified && "text-amber-700")}>{title.text}</span>
                            {title.changed && (
                              <span className="text-[10px] font-medium text-slate-500" dir="auto">{title.original}</span>
                            )}
                          </div>
                        ) : "—"}
                      </td>

                      <td className="px-4 py-4 align-middle text-slate-800 border-s border-slate-100">
                        {profession.text ? (
                          <div className="flex flex-col gap-1">
                            <span className={cn("font-bold text-sm", !profession.classified && "text-amber-700")}>{profession.text}</span>
                            {profession.changed && (
                              <span className="text-[10px] font-medium text-slate-500" dir="auto">{profession.original}</span>
                            )}
                          </div>
                        ) : "—"}
                      </td>

                      {/* Detected categories */}
                      <td className="px-4 py-4 align-middle border-s border-slate-100">
                        <div className="flex flex-col gap-1.5">
                          {result.jobCategory && (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap w-fit">
                              {isAr ? result.jobCategoryAr : result.jobCategory}
                            </span>
                          )}
                          {result.iqamaCategory && result.iqamaCategory !== result.jobCategory && (
                            <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100 whitespace-nowrap w-fit">
                              {isAr ? result.iqamaCategoryAr : result.iqamaCategory}
                            </span>
                          )}
                          {!result.jobCategory && !result.iqamaCategory && (
                            <span className="text-xs text-slate-400 font-bold">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status badge + confidence */}
                      <td className="px-4 py-4 align-middle border-s border-slate-100" title={result.explanation}>
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shadow-sm", cfg.badge)}>
                            <Icon className="w-4 h-4" />
                            {isAr ? cfg.labelAr : cfg.labelEn}
                          </span>
                          <span className="text-[10px] font-bold tabular-nums text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {isAr ? `الثقة ${result.confidence}%` : `${result.confidence}% conf.`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 fade-in-up stagger-5">
        <p className="font-black text-slate-800 text-sm uppercase tracking-widest mb-4">
          {isAr ? "كيف تعمل المطابقة؟" : "How matching works"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border flex-shrink-0", STATUS_CONFIG.match.badge)}>
              <CheckCircle2 className="w-3.5 h-3.5" />{isAr ? "متطابق" : "Match"}
            </span>
            <p className="text-sm font-medium text-slate-600 leading-snug">
              {isAr
                ? "المسمى الوظيفي ومهنة الإقامة ينتميان لنفس الفئة المهنية (مهندس، فني، مشرف...)"
                : "Job title and Iqama profession belong to the same role category (engineer, technician, supervisor…)"}
            </p>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border flex-shrink-0", STATUS_CONFIG.conditional.badge)}>
              <CircleDot className="w-3.5 h-3.5" />{isAr ? "مشروط" : "Conditional"}
            </span>
            <p className="text-sm font-medium text-slate-600 leading-snug">
              {isAr
                ? "الفئتان مختلفتان لكنهما مرتبطتان مهنياً (مثل مهندس يشغل وظيفة مدير) — مقبول مع التنويه"
                : "Categories differ but are professionally related (e.g. an engineer in a manager role) — acceptable, flagged for awareness"}
            </p>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border flex-shrink-0", STATUS_CONFIG.mismatch.badge)}>
              <AlertTriangle className="w-3.5 h-3.5" />{isAr ? "غير متطابق" : "Mismatch"}
            </span>
            <p className="text-sm font-medium text-slate-600 leading-snug">
              {isAr
                ? "الفئتان مختلفتان بوضوح — قد يكون الموظف يعمل خارج تخصصه المسجل"
                : "Categories clearly differ — employee may be working outside their registered specialty"}
            </p>
          </div>
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border flex-shrink-0", STATUS_CONFIG.review.badge)}>
              <HelpCircle className="w-3.5 h-3.5" />{isAr ? "يحتاج مراجعة" : "Needs Review"}
            </span>
            <p className="text-sm font-medium text-slate-600 leading-snug">
              {isAr
                ? "لم يتمكن النظام من تصنيف أحد الحقلين أو كليهما — يستلزم مراجعة يدوية"
                : "System could not classify one or both fields — manual review required"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
