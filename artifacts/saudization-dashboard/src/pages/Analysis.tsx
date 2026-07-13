import { useState, useMemo } from "react";
import { Search, BarChart3, Building2, FolderKanban, Network } from "lucide-react";
import { useProjectData } from "@/lib/useProjectData";
import type { ProjectEmployee } from "@/lib/useProjectData";
import { getOccupationCode } from "@/lib/occupationCodes";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

type Basis = "msd" | "company" | "project";

interface CodeCard {
  key: string;
  code: string | null;
  officialAr: string;
  officialEn: string;
  total: number;
}

function buildCards(employees: ProjectEmployee[]): CodeCard[] {
  const map = new Map<string, CodeCard>();
  for (const e of employees) {
    const oc = getOccupationCode(e.iqama_profession);
    const hasCode = !!(oc && oc.code);
    const key = hasCode ? oc!.code! : "__unmapped__";
    let c = map.get(key);
    if (!c) {
      c = {
        key,
        code: hasCode ? oc!.code! : null,
        officialAr: hasCode ? oc!.officialAr : "بانتظار التحقق",
        officialEn: hasCode ? oc!.officialEn : "To verify",
        total: 0,
      };
      map.set(key, c);
    }
    c.total += 1;
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.code === null && b.code !== null) return 1;
    if (b.code === null && a.code !== null) return -1;
    return b.total - a.total;
  });
}

export default function Analysis() {
  const { metrics, isLoading } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";

  const [basis, setBasis] = useState<Basis>("msd");
  const [search, setSearch] = useState("");

  const employees = metrics.employees;

  const sections = useMemo(() => {
    const unknownLabel = isAr ? "غير محدد" : "Unknown";
    const groupBy = (getKey: (e: ProjectEmployee) => string | null) => {
      const names = Array.from(
        new Set(employees.map((e) => getKey(e)?.trim() || unknownLabel)),
      ).sort();
      return names.map((name) => ({
        name,
        employees: employees.filter((e) => (getKey(e)?.trim() || unknownLabel) === name),
      }));
    };

    let groups: { name: string; employees: ProjectEmployee[] }[];
    if (basis === "company") {
      groups = groupBy((e) => e.company);
    } else if (basis === "project") {
      groups = groupBy((e) => e.project);
    } else {
      groups = [{ name: isAr ? "إدارة الخدمات المدارة (MSD)" : "MSD Department", employees }];
    }
    return groups.map((g) => ({ name: g.name, headcount: g.employees.length, cards: buildCards(g.employees) }));
  }, [employees, basis, isAr]);

  const visibleSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        cards: s.cards.filter(
          (c) =>
            (c.code ?? "").includes(q) ||
            c.officialAr.toLowerCase().includes(q) ||
            c.officialEn.toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.cards.length > 0);
  }, [sections, search]);

  const allCards = buildCards(employees);
  const distinctCodes = allCards.filter((c) => c.code !== null).length;

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

  const BASIS_BUTTONS: { key: Basis; label: string; icon: typeof Building2 }[] = [
    { key: "company", label: isAr ? "حسب الشركة" : "Company basis", icon: Building2 },
    { key: "project", label: isAr ? "حسب المشروع" : "Project basis", icon: FolderKanban },
    { key: "msd", label: isAr ? "حسب إدارة MSD" : "MSD Department basis", icon: Network },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 fade-in-up stagger-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {isAr ? "تحليل المهن حسب الرمز" : "Analysis by Occupation Code"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              {isAr
                ? "عدد الموظفين لكل رمز مهنة رسمي (HRSD)"
                : "Employee count per official HRSD occupation code"}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3">
          {[
            { label: isAr ? "عدد الرموز" : "Codes", value: distinctCodes, cls: "text-blue-600 bg-blue-50 border-blue-100" },
            { label: isAr ? "إجمالي الموظفين" : "Employees", value: employees.length, cls: "text-slate-800 bg-white border-slate-200" },
          ].map((s) => (
            <div
              key={s.label}
              className={cn("flex flex-col justify-center border rounded-2xl px-5 py-3 shadow-sm", s.cls)}
            >
              <span className="text-xs font-bold opacity-70 mb-1">{s.label}</span>
              <span className="text-xl font-black tabular-nums leading-none">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 fade-in-up stagger-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Basis buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {BASIS_BUTTONS.map((b) => (
            <button
              key={b.key}
              onClick={() => setBasis(b.key)}
              data-testid={`btn-basis-${b.key}`}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap",
                basis === b.key
                  ? "bg-[#0a1d37] text-white border-[#0a1d37] shadow-md transform scale-[1.02]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <b.icon className={cn("w-4 h-4", basis === b.key ? "text-blue-300" : "text-slate-400")} />
              {b.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder={isAr ? "البحث برمز المهنة أو المسمى..." : "Search by code or title…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 text-sm font-medium rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ps-10 pe-4"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8 fade-in-up stagger-3">
        {visibleSections.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-bold text-slate-700">
              {isAr ? "لا توجد نتائج تطابق البحث." : "No results match your search."}
            </p>
          </div>
        ) : (
          visibleSections.map((section, idx) => (
            <div key={section.name} className="space-y-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
              {/* Section header */}
              <div className="flex items-center gap-4 border-b border-slate-200 pb-2">
                <h2 className="text-xl font-black text-slate-800">{section.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                    {section.cards.length} {isAr ? "رمز" : "codes"}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                    {section.headcount} {isAr ? "موظف" : "employees"}
                  </span>
                </div>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {section.cards.map((c) => {
                  const isUnmapped = c.code === null;
                  return (
                    <div
                      key={c.key}
                      className={cn(
                        "rounded-2xl border bg-white shadow-sm p-4 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md",
                        isUnmapped ? "border-amber-300 bg-amber-50/30" : "border-slate-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        {isUnmapped ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">
                            {isAr ? "بانتظار التحقق" : "to verify"}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {c.code}
                          </span>
                        )}
                        <span className={cn("text-2xl font-black tabular-nums leading-none", isUnmapped ? "text-amber-600" : "text-slate-800")}>
                          {c.total}
                        </span>
                      </div>
                      <div className="mt-auto">
                        <p className="text-xs font-bold text-slate-700 leading-snug line-clamp-2" title={`${c.officialAr}\n${c.officialEn}`}>
                          {isAr ? c.officialAr : c.officialEn}
                        </p>
                        {!isAr && (
                           <p className="text-[10px] font-medium text-slate-400 mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             {c.officialAr}
                           </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
