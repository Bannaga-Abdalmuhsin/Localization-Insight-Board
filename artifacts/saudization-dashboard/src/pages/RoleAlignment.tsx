import { useState } from "react";
import { Search, CheckCircle2, AlertTriangle, HelpCircle, Download, CircleDot } from "lucide-react";
import { useProjectData } from "@/lib/useProjectData";
import { matchProfession, localizeProfession, MatchStatus } from "@/lib/professionMatch";
import CompanyLogo, { REGION_AR } from "@/components/CompanyLogo";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const STATUS_CONFIG: Record<MatchStatus, { icon: React.ElementType; labelEn: string; labelAr: string; badge: string; row: string }> = {
  match:       { icon: CheckCircle2,  labelEn: "Match",        labelAr: "متطابق",       badge: "bg-emerald-100 text-emerald-700", row: "" },
  conditional: { icon: CircleDot,     labelEn: "Conditional",  labelAr: "مشروط",        badge: "bg-sky-100 text-sky-700",        row: "bg-sky-50/30" },
  mismatch:    { icon: AlertTriangle, labelEn: "Mismatch",     labelAr: "غير متطابق",   badge: "bg-red-100 text-red-700",        row: "bg-red-50/40" },
  review:      { icon: HelpCircle,    labelEn: "Needs Review", labelAr: "يحتاج مراجعة", badge: "bg-amber-100 text-amber-700",    row: "bg-amber-50/30" },
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAr ? "مطابقة المهن" : "Role Alignment"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "مقارنة المسمى الوظيفي الفعلي مع المهنة المسجلة في الإقامة لكل موظف"
              : "Compare each employee's actual job title against their Iqama registered profession"}
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-white hover:bg-muted/40 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          {isAr ? "تصدير CSV" : "Export CSV"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { key: "all",         label: isAr ? "إجمالي الموظفين" : "Total Employees", value: rows.length,        badge: "bg-slate-100 text-slate-700",   icon: null },
          { key: "match",       label: isAr ? "متطابق"          : "Match",           value: counts.match,       badge: STATUS_CONFIG.match.badge,       icon: CheckCircle2  },
          { key: "conditional", label: isAr ? "مشروط"           : "Conditional",     value: counts.conditional, badge: STATUS_CONFIG.conditional.badge, icon: CircleDot     },
          { key: "mismatch",    label: isAr ? "غير متطابق"      : "Mismatch",        value: counts.mismatch,    badge: STATUS_CONFIG.mismatch.badge,    icon: AlertTriangle },
          { key: "review",      label: isAr ? "يحتاج مراجعة"   : "Needs Review",    value: counts.review,      badge: STATUS_CONFIG.review.badge,      icon: HelpCircle    },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key as "all" | MatchStatus)}
            className={cn(
              "rounded-xl border bg-white shadow-sm px-5 py-4 text-start transition-all hover:shadow-md",
              statusFilter === s.key ? "ring-2 ring-primary border-primary" : "border-border"
            )}
          >
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {s.icon && <s.icon className="w-3.5 h-3.5" />}
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", s.badge)}>{s.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "بحث بالاسم أو الوظيفة..." : "Search name or title…"}
            className="w-full h-9 text-sm rounded-lg border border-border bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ps-9 pe-4"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | MatchStatus)}
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
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
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{isAr ? "جميع الشركات" : "All Companies"}</option>
          {companies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{isAr ? "جميع المناطق" : "All Regions"}</option>
          {regions.map((r) => <option key={r} value={r}>{isAr ? (REGION_AR[r] ?? r) : r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {isAr ? `${filtered.length} موظف` : `${filtered.length} employees`}
          </span>
          <span className="text-xs text-muted-foreground">
            {isAr
              ? "تم توحيد المسمى والمهنة إلى اللغة العربية؛ النص الأصلي يظهر أسفل كل قيمة للمراجعة"
              : "Title & profession unified to English; the original text appears beneath each value for audit"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {isAr ? "لا توجد نتائج." : "No results."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
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
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap text-start">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(({ emp, result, title, profession }, idx) => {
                  const cfg = STATUS_CONFIG[result.status];
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={emp.id}
                      className={cn("transition-colors hover:brightness-95", cfg.row, idx % 2 === 0 ? "" : "bg-muted/5")}
                    >
                      <td className="px-4 py-3 tabular-nums text-muted-foreground text-xs">{emp.employee_no ?? idx + 1}</td>

                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{emp.employee_name}</td>

                      <td className="px-4 py-3">
                        {emp.company
                          ? <CompanyLogo company={emp.company} className="h-6" />
                          : <span className="text-muted-foreground">—</span>}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {emp.region ? (isAr ? (REGION_AR[emp.region] ?? emp.region) : emp.region) : "—"}
                      </td>

                      <td className="px-4 py-3 text-foreground">
                        {title.text ? (
                          <div className="flex flex-col">
                            <span className={cn(!title.classified && "text-amber-700")}>{title.text}</span>
                            {title.changed && (
                              <span className="text-[10px] text-muted-foreground" dir="auto">{title.original}</span>
                            )}
                          </div>
                        ) : "—"}
                      </td>

                      <td className="px-4 py-3 text-foreground">
                        {profession.text ? (
                          <div className="flex flex-col">
                            <span className={cn(!profession.classified && "text-amber-700")}>{profession.text}</span>
                            {profession.changed && (
                              <span className="text-[10px] text-muted-foreground" dir="auto">{profession.original}</span>
                            )}
                          </div>
                        ) : "—"}
                      </td>

                      {/* Detected categories */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {result.jobCategory && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                              {isAr ? result.jobCategoryAr : result.jobCategory}
                            </span>
                          )}
                          {result.iqamaCategory && result.iqamaCategory !== result.jobCategory && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-violet-50 text-violet-700 border border-violet-100 whitespace-nowrap">
                              {isAr ? result.iqamaCategoryAr : result.iqamaCategory}
                            </span>
                          )}
                          {!result.jobCategory && !result.iqamaCategory && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status badge + confidence */}
                      <td className="px-4 py-3" title={result.explanation}>
                        <div className="flex flex-col items-start gap-1">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap", cfg.badge)}>
                            <Icon className="w-3.5 h-3.5" />
                            {isAr ? cfg.labelAr : cfg.labelEn}
                          </span>
                          <span className="text-[10px] tabular-nums text-muted-foreground">
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
      <div className="rounded-xl border border-border bg-muted/20 px-5 py-4 text-sm text-muted-foreground space-y-1.5">
        <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-2">
          {isAr ? "كيف تعمل المطابقة؟" : "How matching works"}
        </p>
        <p>
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold me-2", STATUS_CONFIG.match.badge)}>
            <CheckCircle2 className="w-3 h-3" />{isAr ? "متطابق" : "Match"}
          </span>
          {isAr
            ? "المسمى الوظيفي ومهنة الإقامة ينتميان لنفس الفئة المهنية (مهندس، فني، مشرف...)"
            : "Job title and Iqama profession belong to the same role category (engineer, technician, supervisor…)"}
        </p>
        <p>
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold me-2", STATUS_CONFIG.conditional.badge)}>
            <CircleDot className="w-3 h-3" />{isAr ? "مشروط" : "Conditional"}
          </span>
          {isAr
            ? "الفئتان مختلفتان لكنهما مرتبطتان مهنياً (مثل مهندس يشغل وظيفة مدير) — مقبول مع التنويه"
            : "Categories differ but are professionally related (e.g. an engineer in a manager role) — acceptable, flagged for awareness"}
        </p>
        <p>
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold me-2", STATUS_CONFIG.mismatch.badge)}>
            <AlertTriangle className="w-3 h-3" />{isAr ? "غير متطابق" : "Mismatch"}
          </span>
          {isAr
            ? "الفئتان مختلفتان بوضوح — قد يكون الموظف يعمل خارج تخصصه المسجل"
            : "Categories clearly differ — employee may be working outside their registered specialty"}
        </p>
        <p>
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold me-2", STATUS_CONFIG.review.badge)}>
            <HelpCircle className="w-3 h-3" />{isAr ? "يحتاج مراجعة" : "Needs Review"}
          </span>
          {isAr
            ? "لم يتمكن النظام من تصنيف أحد الحقلين أو كليهما — يستلزم مراجعة يدوية"
            : "System could not classify one or both fields — manual review required"}
        </p>
      </div>
    </div>
  );
}
