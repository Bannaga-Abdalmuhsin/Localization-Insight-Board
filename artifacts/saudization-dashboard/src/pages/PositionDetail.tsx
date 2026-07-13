import { useState } from "react";
import { Search, Filter, UserCheck, UserX, Briefcase } from "lucide-react";
import CompanyLogo, { REGION_AR } from "@/components/CompanyLogo";
import { useProjectData } from "@/lib/useProjectData";
import { getOccupationCode } from "@/lib/occupationCodes";
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
  const [alignFilter, setAlignFilter] = useState<"all" | "aligned" | "partial" | "misaligned">("all");

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

  const regions = Array.from(new Set(employees.map((e) => e.region ?? "").filter(Boolean))).sort();
  const companies = Array.from(new Set(employees.map((e) => e.company ?? "").filter(Boolean))).sort();

  const filtered = employees.filter((e) => {
    if (regionFilter !== "all" && e.region !== regionFilter) return false;
    if (companyFilter !== "all" && e.company !== companyFilter) return false;
    if (codeFilter === "Eng" && e.saudization_code !== "Eng") return false;
    if (codeFilter === "Spec" && e.saudization_code !== "Spec") return false;
    if (codeFilter === "Tech" && e.saudization_code !== "Tech") return false;
    if (codeFilter === "NA" && e.saudization_code !== "NA") return false;
    if (codeFilter !== "all" && codeFilter !== "Eng" && codeFilter !== "Spec" && codeFilter !== "Tech" && codeFilter !== "NA") return false;
    if (saudiFilter === "saudi" && !e.is_saudi) return false;
    if (saudiFilter === "non-saudi" && e.is_saudi) return false;
    if (alignFilter !== "all" && e.jd_alignment !== alignFilter) return false;
    const q = search.toLowerCase();
    if (
      q &&
      !e.employee_name.toLowerCase().includes(q) &&
      !(e.job_title ?? "").toLowerCase().includes(q) &&
      !(e.nationality ?? "").toLowerCase().includes(q) &&
      !(e.iqama_profession ?? "").toLowerCase().includes(q) &&
      !(getOccupationCode(e.iqama_profession)?.code ?? "").includes(q)
    ) return false;
    return true;
  });

  const filteredSaudi = filtered.filter((e) => e.is_saudi).length;
  const filteredNon = filtered.filter((e) => !e.is_saudi).length;
  const filteredMisaligned = filtered.filter((e) => e.jd_alignment === "misaligned").length;

  const ALIGN_META: Record<string, { labelEn: string; labelAr: string; cls: string; dot: string }> = {
    aligned: { labelEn: "Aligned", labelAr: "متوافق", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    partial: { labelEn: "Partial", labelAr: "جزئي", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    misaligned: { labelEn: "Misaligned", labelAr: "غير متوافق", cls: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  };

  const CODE_COLORS: Record<string, string> = {
    Eng: "bg-blue-100 text-blue-700 border-blue-200",
    Spec: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Tech: "bg-violet-100 text-violet-700 border-violet-200",
    NA: "bg-slate-100 text-slate-600 border-slate-200",
  };

  function getCodeLabel(emp: { saudization_code: string | null; required_saudization_pct: number | null }): string {
    if (emp.saudization_code === "Eng") return "Engineer (30%)";
    if (emp.saudization_code === "Spec") return "Specialist (30%)";
    if (emp.saudization_code === "Tech") return "Technician (30%)";
    return emp.saudization_code ?? "NA";
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="fade-in-up stagger-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isAr ? "تفاصيل الوظائف" : "Position Detail"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {isAr
                ? "قائمة كاملة بالموظفين — مع تصفية حسب المنطقة والشركة وفئة التوطين"
                : "Full employee list — filterable by region, company, and Localization category"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in-up stagger-2">
        {[
          { label: isAr ? "عرض" : "Showing", value: filtered.length, cls: "text-slate-800", bg: "bg-white", border: "border-slate-200" },
          { label: isAr ? "سعودي" : "Saudi", value: filteredSaudi, cls: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: isAr ? "غير سعودي" : "Non-Saudi", value: filteredNon, cls: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
          { label: isAr ? "وصف غير متوافق" : "JD Misaligned", value: filteredMisaligned, cls: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
        ].map((s) => (
          <div key={s.label} className={cn("flex flex-col justify-center border rounded-2xl px-5 py-4 shadow-sm", s.bg, s.border)}>
            <span className="text-sm font-bold text-slate-600 mb-1">{s.label}</span>
            <span className={cn("text-2xl font-black tabular-nums", s.cls)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 fade-in-up stagger-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder={isAr ? "البحث في الاسم أو الوظيفة أو الجنسية..." : "Search name, job title, nationality…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
              "ps-10 pe-4"
            )}
          />
        </div>

        {/* Region */}
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-3 cursor-pointer"
        >
          <option value="all">{isAr ? "جميع المناطق" : "All Regions"}</option>
          {regions.map((r) => <option key={r} value={r}>{isAr ? (REGION_AR[r] ?? r) : r}</option>)}
        </select>

        {/* Company */}
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-3 cursor-pointer"
        >
          <option value="all">{isAr ? "جميع الشركات" : "All Companies"}</option>
          {companies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Saudization code */}
        <select
          value={codeFilter}
          onChange={(e) => setCodeFilter(e.target.value)}
          className="h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-3 cursor-pointer"
        >
          <option value="all">{isAr ? "جميع الفئات" : "All Categories"}</option>
          <option value="Eng">{isAr ? "مهندس (30%)" : "Engineer (30%)"}</option>
          <option value="Tech">{isAr ? "فني (30%)" : "Technician (30%)"}</option>
          <option value="Spec">{isAr ? "أخصائي (30%)" : "Specialist (30%)"}</option>
          <option value="NA">NA ({isAr ? "معفى" : "Excluded"})</option>
        </select>

        {/* Job-description alignment */}
        <select
          value={alignFilter}
          onChange={(e) => setAlignFilter(e.target.value as typeof alignFilter)}
          className="h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-3 cursor-pointer"
        >
          <option value="all">{isAr ? "توافق الوصف الوظيفي: الكل" : "JD Alignment: All"}</option>
          <option value="aligned">{isAr ? "متوافق" : "Aligned"}</option>
          <option value="partial">{isAr ? "جزئي" : "Partial"}</option>
          <option value="misaligned">{isAr ? "غير متوافق" : "Misaligned"}</option>
        </select>

        {/* Saudi / Non-Saudi quick filter */}
        <div className="flex items-center gap-1.5 ms-auto">
          <Filter className="w-4 h-4 text-slate-400 me-1" />
          <button
            onClick={() => setSaudiFilter((v) => v === "saudi" ? "all" : "saudi")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all",
              saudiFilter === "saudi"
                ? "bg-[#0a1d37] text-white border-[#0a1d37] shadow-md transform scale-[1.02]"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <UserCheck className="w-3.5 h-3.5" />
            {isAr ? "سعودي فقط" : "Saudi Only"}
          </button>
          <button
            onClick={() => setSaudiFilter((v) => v === "non-saudi" ? "all" : "non-saudi")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all",
              saudiFilter === "non-saudi"
                ? "bg-[#0a1d37] text-white border-[#0a1d37] shadow-md transform scale-[1.02]"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <UserX className="w-3.5 h-3.5" />
            {isAr ? "غير سعودي فقط" : "Non-Saudi Only"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden fade-in-up stagger-4">
        {filtered.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-bold text-slate-700">
              {isAr ? "لا توجد نتائج تطابق المرشحات." : "No results match your filters."}
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
                    isAr ? "الجنسية" : "Nationality",
                    isAr ? "المسمى الوظيفي" : "Position",
                    isAr ? "رمز المهنة (HRSD)" : "HRSD Code",
                    isAr ? "المنطقة" : "Region",
                    isAr ? "الشركة" : "Company",
                    isAr ? "فئة التوطين" : "Category",
                    isAr ? "النسبة المطلوبة" : "Required %",
                    isAr ? "توافق الوصف الوظيفي" : "JD Alignment",
                    isAr ? "الحالة" : "Status",
                  ].map((h) => (
                    <th key={h} className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-start whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-4 py-4 align-middle tabular-nums text-slate-400 text-xs font-bold">{emp.employee_no ?? idx + 1}</td>
                    <td className="px-4 py-4 align-middle font-bold text-slate-800 whitespace-nowrap">{emp.employee_name}</td>
                    <td className="px-4 py-4 align-middle text-slate-600 font-medium whitespace-nowrap">{emp.nationality}</td>
                    <td className="px-4 py-4 align-middle">
                      <p className="text-slate-800 font-bold text-sm leading-tight">{emp.job_title ?? "—"}</p>
                      {emp.iqama_profession && (
                        <p className="text-xs text-slate-500 font-medium mt-1">{emp.iqama_profession}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 align-middle whitespace-nowrap border-s border-slate-100">
                      {(() => {
                        const oc = getOccupationCode(emp.iqama_profession);
                        if (!oc || oc.confidence === "pending" || !oc.code) {
                          const title = oc ? `${oc.officialAr}\n${oc.officialEn}` : undefined;
                          return (
                            <span
                              title={title}
                              className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold italic cursor-help bg-amber-50 px-2 py-0.5 rounded-md"
                            >
                              {isAr ? "بانتظار التحقق" : "to verify"}
                            </span>
                          );
                        }
                        const title = `${oc.officialAr}\n${oc.officialEn}`;
                        const isReview = oc.confidence === "review";
                        return (
                          <span
                            title={title}
                            className={cn(
                              "inline-flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums cursor-help bg-slate-100 px-2 py-1 rounded-md",
                              isReview ? "text-amber-700" : "text-slate-700"
                            )}
                          >
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full shrink-0 shadow-sm",
                                isReview ? "bg-amber-500" : "bg-emerald-500"
                              )}
                            />
                            {isReview ? `~${oc.code}` : oc.code}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 align-middle text-slate-600 font-medium whitespace-nowrap">
                      {emp.region ? (isAr ? (REGION_AR[emp.region] ?? emp.region) : emp.region) : "—"}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      {emp.company ? <CompanyLogo company={emp.company} className="h-6" /> : <span className="text-slate-400 font-bold">—</span>}
                    </td>
                    <td className="px-4 py-4 align-middle border-s border-slate-100">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border", CODE_COLORS[emp.saudization_code ?? "NA"] ?? CODE_COLORS.NA)}>
                        {getCodeLabel(emp)}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle tabular-nums text-slate-800 font-black text-center">
                      {emp.required_saudization_pct != null
                        ? `${(emp.required_saudization_pct * 100).toFixed(0)}%`
                        : <span className="text-slate-400 text-xs font-bold">{isAr ? "معفى" : "Excluded"}</span>}
                    </td>
                    <td className="px-4 py-4 align-middle border-s border-slate-100">
                      {(() => {
                        const meta = emp.jd_alignment ? ALIGN_META[emp.jd_alignment] : null;
                        if (!meta) {
                          return <span className="text-xs text-slate-400 font-bold italic">—</span>;
                        }
                        const note = isAr
                          ? (emp.jd_alignment_note_ar ?? emp.jd_alignment_note_en)
                          : (emp.jd_alignment_note_en ?? emp.jd_alignment_note_ar);
                        const title = [
                          note,
                          emp.jd_alignment_score != null
                            ? (isAr ? `الدرجة: ${emp.jd_alignment_score}/100` : `Score: ${emp.jd_alignment_score}/100`)
                            : null,
                        ].filter(Boolean).join("\n");
                        return (
                          <span
                            title={title || undefined}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-help whitespace-nowrap border shadow-sm",
                              meta.cls
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full shrink-0 shadow-[0_0_4px_rgba(0,0,0,0.2)]", meta.dot)} />
                            {isAr ? meta.labelAr : meta.labelEn}
                            {emp.jd_alignment_score != null && (
                              <span className="opacity-60 ms-1 tabular-nums">{emp.jd_alignment_score}</span>
                            )}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 align-middle border-s border-slate-100">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm",
                        emp.is_saudi ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {emp.is_saudi
                          ? <><UserCheck className="w-4 h-4" />{isAr ? "سعودي" : "Saudi"}</>
                          : <><UserX className="w-4 h-4" />{isAr ? "غير سعودي" : "Non-Saudi"}</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
