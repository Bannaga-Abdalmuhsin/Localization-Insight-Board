import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Building,
} from "lucide-react";
import { useProjectData, ProjectEmployee } from "@/lib/useProjectData";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import CompanyLogo from "@/components/CompanyLogo";

type SortKey = "name" | "total" | "saudi" | "nonSaudi" | "eng30Pct" | "specPct" | "techPct";

interface GroupRow {
  name: string;
  total: number;
  saudi: number;
  nonSaudi: number;
  eng30Total: number;
  eng30Saudi: number;
  eng30Pct: number;
  eng30Compliant: boolean;
  specTotal: number;
  specSaudi: number;
  specPct: number;
  specCompliant: boolean;
  techTotal: number;
  techSaudi: number;
  techPct: number;
  techCompliant: boolean;
}

function buildGroups(employees: ProjectEmployee[]): GroupRow[] {
  const map = new Map<string, ProjectEmployee[]>();
  for (const e of employees) {
    const key = e.company ?? "Unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }

  return Array.from(map.entries()).map(([name, emps]) => {
    const saudi = emps.filter((e) => e.is_saudi).length;
    const eng30 = emps.filter((e) => e.saudization_code === "Eng");
    const eng30Saudi = eng30.filter((e) => e.is_saudi).length;
    const eng30Pct = eng30.length > 0 ? eng30Saudi / eng30.length : 0;
    const spec = emps.filter((e) => e.saudization_code === "Spec");
    const specSaudi = spec.filter((e) => e.is_saudi).length;
    const specPct = spec.length > 0 ? specSaudi / spec.length : 0;
    const tech = emps.filter((e) => e.saudization_code === "Tech");
    const techSaudi = tech.filter((e) => e.is_saudi).length;
    const techPct = tech.length > 0 ? techSaudi / tech.length : 0;
    return {
      name,
      total: emps.length,
      saudi,
      nonSaudi: emps.length - saudi,
      eng30Total: eng30.length,
      eng30Saudi,
      eng30Pct,
      eng30Compliant: eng30.length === 0 || eng30Pct >= 0.3,
      specTotal: spec.length,
      specSaudi,
      specPct,
      specCompliant: spec.length === 0 || specPct >= 0.3,
      techTotal: tech.length,
      techSaudi,
      techPct,
      techCompliant: tech.length === 0 || techPct >= 0.3,
    };
  });
}

export default function TeamBreakdown({ targetPct: _unused }: { targetPct: number }) {
  const { metrics, isLoading } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "compliant" | "action">("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(k: SortKey) {
    if (sortKey === k) setSortAsc((v) => !v);
    else { setSortKey(k); setSortAsc(true); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortAsc
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  }

  function Th({ label, k, className }: { label: string; k: SortKey; className?: string }) {
    return (
      <th
        className={cn(
          "px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-800 hover:bg-slate-100 transition-colors select-none whitespace-nowrap group",
          className
        )}
        onClick={() => handleSort(k)}
      >
        <div className="flex items-center gap-1.5">
          {label}
          <div className={cn("transition-opacity", sortKey !== k && "opacity-0 group-hover:opacity-50")}>
            <SortIcon k={k} />
          </div>
        </div>
      </th>
    );
  }

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

  const rows = buildGroups(metrics.employees);

  const filtered = rows
    .filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      const overallCompliant = r.eng30Compliant && r.specCompliant && r.techCompliant;
      if (statusFilter === "compliant" && !overallCompliant) return false;
      if (statusFilter === "action" && overallCompliant) return false;
      return true;
    })
    .sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case "name": av = a.name; bv = b.name; break;
        case "total": av = a.total; bv = b.total; break;
        case "saudi": av = a.saudi; bv = b.saudi; break;
        case "nonSaudi": av = a.nonSaudi; bv = b.nonSaudi; break;
        case "eng30Pct": av = a.eng30Pct; bv = b.eng30Pct; break;
        case "specPct": av = a.specPct; bv = b.specPct; break;
        case "techPct": av = a.techPct; bv = b.techPct; break;
      }
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortAsc ? cmp : -cmp;
    });

  const compliantCount = filtered.filter((r) => r.eng30Compliant && r.specCompliant && r.techCompliant).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="fade-in-up stagger-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isAr ? "تفصيل الفرق والشركات" : "Team Breakdown"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {isAr
                ? "حالة الامتثال للتوطين حسب الشركة — مشروع stc COW MS"
                : "Localization compliance by Company — stc COW MS project"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in-up stagger-2">
        {[
          { label: isAr ? "إجمالي الفئات" : "Total Groups", value: filtered.length, cls: "text-slate-800", bg: "bg-white", border: "border-slate-200" },
          { label: isAr ? "ممتثل" : "Compliant", value: compliantCount, cls: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: isAr ? "يتطلب إجراء" : "Action Required", value: filtered.length - compliantCount, cls: "text-red-700", bg: "bg-red-50", border: "border-red-100" },
        ].map((s) => (
          <div key={s.label} className={cn("flex items-center justify-between border rounded-2xl px-5 py-4 shadow-sm", s.bg, s.border)}>
            <span className="text-sm font-bold text-slate-600">{s.label}</span>
            <span className={cn("text-2xl font-black tabular-nums", s.cls)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 fade-in-up stagger-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder={isAr ? "بحث بالشركة..." : "Search company…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all",
              "ps-10 pe-4"
            )}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {(["all", "compliant", "action"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap",
                statusFilter === f
                  ? "bg-[#0a1d37] text-white border-[#0a1d37] shadow-md transform scale-[1.02]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {f === "all"
                ? (isAr ? "الكل" : "All")
                : f === "compliant"
                ? (isAr ? "ممتثل" : "Compliant")
                : (isAr ? "يتطلب إجراء" : "Action Required")}
            </button>
          ))}
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
              {isAr ? "لا توجد نتائج." : "No results found."}
            </p>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {isAr ? "جرب تغيير مصطلح البحث أو الفلاتر" : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <Th label={isAr ? "الشركة" : "Company"} k="name" className="text-start" />
                  <Th label={isAr ? "الإجمالي" : "Total"} k="total" className="text-center" />
                  <Th label={isAr ? "سعودي" : "Saudi"} k="saudi" className="text-center" />
                  <Th label={isAr ? "غير سعودي" : "Non-Saudi"} k="nonSaudi" className="text-center" />
                  <Th label={isAr ? "مهندسون (30%)" : "Engineers (30%)"} k="eng30Pct" className="text-start" />
                  <Th label={isAr ? "أخصائيون (30%)" : "Specialists (30%)"} k="specPct" className="text-start" />
                  <Th label={isAr ? "فنيون (30%)" : "Technicians (30%)"} k="techPct" className="text-start" />
                  <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-start whitespace-nowrap">
                    {isAr ? "الحالة" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row, idx) => {
                  const overallCompliant = row.eng30Compliant && row.specCompliant && row.techCompliant;
                  return (
                    <tr
                      key={row.name}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <CompanyLogo company={row.name} className="h-8 max-w-[80px]" />
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <span className="text-lg font-black text-slate-800">{row.total}</span>
                      </td>
                      <td className="px-4 py-4 align-middle text-center border-s border-slate-100">
                        <span className="text-lg font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{row.saudi}</span>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <span className="text-lg font-bold text-slate-500">{row.nonSaudi}</span>
                      </td>

                      {/* Eng 30% cell */}
                      <td className="px-4 py-4 align-middle border-s border-slate-100">
                        {row.eng30Total > 0 ? (
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex items-center justify-between">
                              <span className={cn("text-sm font-black tabular-nums", row.eng30Compliant ? "text-emerald-600" : "text-red-600")}>
                                {(row.eng30Pct * 100).toFixed(0)}%
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">({row.eng30Saudi}/{row.eng30Total})</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all duration-1000", row.eng30Compliant ? "bg-emerald-500" : "bg-red-500")}
                                style={{ width: `${Math.min(100, (row.eng30Pct / 0.3) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-300">—</span>
                        )}
                      </td>

                      {/* Specialist 30% cell */}
                      <td className="px-4 py-4 align-middle border-s border-slate-100">
                        {row.specTotal > 0 ? (
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex items-center justify-between">
                              <span className={cn("text-sm font-black tabular-nums", row.specCompliant ? "text-emerald-600" : "text-red-600")}>
                                {(row.specPct * 100).toFixed(0)}%
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">({row.specSaudi}/{row.specTotal})</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all duration-1000", row.specCompliant ? "bg-emerald-500" : "bg-red-500")}
                                style={{ width: `${Math.min(100, (row.specPct / 0.3) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-300">—</span>
                        )}
                      </td>

                      {/* Tech cell */}
                      <td className="px-4 py-4 align-middle border-s border-slate-100">
                        {row.techTotal > 0 ? (
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex items-center justify-between">
                              <span className={cn("text-sm font-black tabular-nums", row.techCompliant ? "text-emerald-600" : "text-red-600")}>
                                {(row.techPct * 100).toFixed(0)}%
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">({row.techSaudi}/{row.techTotal})</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all duration-1000", row.techCompliant ? "bg-emerald-500" : "bg-red-500")}
                                style={{ width: `${Math.min(100, (row.techPct / 0.3) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 align-middle border-s border-slate-100">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border shadow-sm",
                          overallCompliant ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {overallCompliant
                            ? <><ShieldCheck className="w-4 h-4" />{isAr ? "ممتثل" : "Compliant"}</>
                            : <><ShieldAlert className="w-4 h-4" />{isAr ? "يتطلب إجراء" : "Action Required"}</>}
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
    </div>
  );
}
