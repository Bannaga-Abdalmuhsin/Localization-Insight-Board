import { useState } from "react";
import { Search, Filter, UserCheck, UserX, Download } from "lucide-react";
import CompanyLogo, { REGION_AR } from "@/components/CompanyLogo";
import { useProjectData } from "@/lib/useProjectData";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function PositionDetail({ targetPct: _unused }: { targetPct: number }) {
  const { metrics, isLoading } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [codeFilter, setCodeFilter] = useState("all");
  const [saudiFilter, setSaudiFilter] = useState<"all" | "saudi" | "non-saudi">("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const employees = metrics.employees;

  const regions = Array.from(new Set(employees.map((e) => e.region ?? "").filter(Boolean))).sort();
  const companies = Array.from(new Set(employees.map((e) => e.company ?? "").filter(Boolean))).sort();

  const filtered = employees.filter((e) => {
    if (regionFilter !== "all" && e.region !== regionFilter) return false;
    if (companyFilter !== "all" && e.company !== companyFilter) return false;
    if (codeFilter === "Eng30" && !(e.saudization_code === "Eng" && e.required_saudization_pct === 0.3)) return false;
    if (codeFilter === "Eng25" && !(e.saudization_code === "Eng" && e.required_saudization_pct === 0.25)) return false;
    if (codeFilter === "Tech" && e.saudization_code !== "Tech") return false;
    if (codeFilter === "NA" && e.saudization_code !== "NA") return false;
    if (codeFilter !== "all" && codeFilter !== "Eng30" && codeFilter !== "Eng25" && codeFilter !== "Tech" && codeFilter !== "NA") return false;
    if (saudiFilter === "saudi" && !e.is_saudi) return false;
    if (saudiFilter === "non-saudi" && e.is_saudi) return false;
    const q = search.toLowerCase();
    if (
      q &&
      !e.employee_name.toLowerCase().includes(q) &&
      !(e.job_title ?? "").toLowerCase().includes(q) &&
      !(e.nationality ?? "").toLowerCase().includes(q) &&
      !(e.iqama_profession ?? "").toLowerCase().includes(q)
    ) return false;
    return true;
  });

  const filteredSaudi = filtered.filter((e) => e.is_saudi).length;
  const filteredNon = filtered.filter((e) => !e.is_saudi).length;

  const CODE_COLORS: Record<string, string> = {
    Eng: "bg-blue-100 text-blue-700",
    Tech: "bg-violet-100 text-violet-700",
    NA: "bg-muted text-muted-foreground",
  };

  function getCodeLabel(emp: { saudization_code: string | null; required_saudization_pct: number | null }): string {
    if (emp.saudization_code === "Eng") {
      return emp.required_saudization_pct === 0.25 ? "Engineering (25%)" : "Engineering (30%)";
    }
    if (emp.saudization_code === "Tech") return "Technical (25%)";
    return emp.saudization_code ?? "NA";
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAr ? "تفاصيل الوظائف" : "Position Detail"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "قائمة كاملة بالموظفين — مع تصفية حسب المنطقة والشركة وفئة التوطين"
              : "Full employee list — filterable by region, company, and Localization category"}
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: isAr ? "عرض" : "Showing", value: filtered.length, cls: "text-foreground" },
          { label: isAr ? "سعودي" : "Saudi", value: filteredSaudi, cls: "text-emerald-600" },
          { label: isAr ? "غير سعودي" : "Non-Saudi", value: filteredNon, cls: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className={cn("text-sm font-bold tabular-nums", s.cls)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={isAr ? "البحث في الاسم أو الوظيفة أو الجنسية..." : "Search name, job title, nationality…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 text-sm rounded-lg border border-border bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ps-9 pe-4"
          />
        </div>

        {/* Region */}
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{isAr ? "جميع المناطق" : "All Regions"}</option>
          {regions.map((r) => <option key={r} value={r}>{isAr ? (REGION_AR[r] ?? r) : r}</option>)}
        </select>

        {/* Company */}
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{isAr ? "جميع الشركات" : "All Companies"}</option>
          {companies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Saudization code */}
        <select
          value={codeFilter}
          onChange={(e) => setCodeFilter(e.target.value)}
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{isAr ? "جميع الفئات" : "All Categories"}</option>
          <option value="Eng30">{isAr ? "هندسة (30%)" : "Engineering (30%)"}</option>
          <option value="Eng25">{isAr ? "هندسة (25%)" : "Engineering (25%)"}</option>
          <option value="Tech">{isAr ? "تقني (25%)" : "Technical (25%)"}</option>
          <option value="NA">NA ({isAr ? "معفى" : "Exempt"})</option>
        </select>

        {/* Saudi / Non-Saudi quick filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setSaudiFilter((v) => v === "saudi" ? "all" : "saudi")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
              saudiFilter === "saudi"
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-muted-foreground border-border hover:border-emerald-400"
            )}
          >
            <UserCheck className="w-3.5 h-3.5" />
            {isAr ? "سعودي فقط" : "Saudi Only"}
          </button>
          <button
            onClick={() => setSaudiFilter((v) => v === "non-saudi" ? "all" : "non-saudi")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
              saudiFilter === "non-saudi"
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-muted-foreground border-border hover:border-amber-400"
            )}
          >
            <UserX className="w-3.5 h-3.5" />
            {isAr ? "غير سعودي فقط" : "Non-Saudi Only"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isAr ? "لا توجد نتائج تطابق المرشحات." : "No results match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {[
                    isAr ? "#" : "#",
                    isAr ? "اسم الموظف" : "Employee Name",
                    isAr ? "الجنسية" : "Nationality",
                    isAr ? "المسمى الوظيفي" : "Position",
                    isAr ? "المنطقة" : "Region",
                    isAr ? "الشركة" : "Company",
                    isAr ? "فئة التوطين" : "Category",
                    isAr ? "النسبة المطلوبة" : "Required %",
                    isAr ? "الحالة" : "Status",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap text-start">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    className={cn("hover:bg-muted/20 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-muted/10")}
                  >
                    <td className="px-4 py-3 tabular-nums text-muted-foreground text-xs">{emp.employee_no ?? idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{emp.employee_name}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{emp.nationality}</td>
                    <td className="px-4 py-3">
                      <p className="text-foreground font-medium">{emp.job_title ?? "—"}</p>
                      {emp.iqama_profession && (
                        <p className="text-xs text-muted-foreground mt-0.5">{emp.iqama_profession}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {emp.region ? (isAr ? (REGION_AR[emp.region] ?? emp.region) : emp.region) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {emp.company ? <CompanyLogo company={emp.company} className="h-6" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", CODE_COLORS[emp.saudization_code ?? "NA"] ?? CODE_COLORS.NA)}>
                        {getCodeLabel(emp)}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground">
                      {emp.required_saudization_pct != null
                        ? `${(emp.required_saudization_pct * 100).toFixed(0)}%`
                        : <span className="text-muted-foreground text-xs">{isAr ? "معفى" : "Exempt"}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                        emp.is_saudi ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {emp.is_saudi
                          ? <><UserCheck className="w-3 h-3" />{isAr ? "سعودي" : "Saudi"}</>
                          : <><UserX className="w-3 h-3" />{isAr ? "غير سعودي" : "Non-Saudi"}</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredNon > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-amber-600">{filteredNon}</span>{" "}
          {isAr
            ? `وظيفة يشغلها غير سعوديين — مصنفة لتخطيط التوطين.`
            : `position${filteredNon !== 1 ? "s" : ""} held by Non-Saudi nationals — flagged for Saudization transition planning.`}
</p>
      )}
    </div>
  );
}
