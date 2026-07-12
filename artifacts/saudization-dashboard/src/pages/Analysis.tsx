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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const BASIS_BUTTONS: { key: Basis; label: string; icon: typeof Building2 }[] = [
    { key: "company", label: isAr ? "حسب الشركة" : "Company basis", icon: Building2 },
    { key: "project", label: isAr ? "حسب المشروع" : "Project basis", icon: FolderKanban },
    { key: "msd", label: isAr ? "حسب إدارة MSD" : "MSD Department basis", icon: Network },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            {isAr ? "تحليل المهن حسب الرمز" : "Analysis by Occupation Code"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "عدد الموظفين لكل رمز مهنة رسمي (HRSD)"
              : "Employee count per official HRSD occupation code"}
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: isAr ? "عدد الرموز" : "Codes", value: distinctCodes },
            { label: isAr ? "إجمالي الموظفين" : "Employees", value: employees.length },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm"
            >
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-sm font-bold tabular-nums text-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Basis buttons + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          {BASIS_BUTTONS.map((b) => (
            <button
              key={b.key}
              onClick={() => setBasis(b.key)}
              data-testid={`btn-basis-${b.key}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors",
                basis === b.key
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-white text-muted-foreground border-border hover:border-primary/50",
              )}
            >
              <b.icon className="w-3.5 h-3.5" />
              {b.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={isAr ? "البحث برمز المهنة أو المسمى..." : "Search by code or title…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 text-sm rounded-lg border border-border bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ps-9 pe-4"
          />
        </div>
      </div>

      {/* Sections */}
      {visibleSections.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-border bg-white shadow-sm">
          <p className="text-sm text-muted-foreground">
            {isAr ? "لا توجد نتائج تطابق البحث." : "No results match your search."}
          </p>
        </div>
      ) : (
        visibleSections.map((section) => (
          <div key={section.name} className="space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-bold text-foreground">{section.name}</h2>
              <span className="text-xs text-muted-foreground">
                {section.cards.length} {isAr ? "رمز" : "codes"} ·{" "}
                {section.headcount} {isAr ? "موظف" : "employees"}
              </span>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {section.cards.map((c) => {
                const isUnmapped = c.code === null;
                return (
                  <div
                    key={c.key}
                    className={cn(
                      "rounded-lg border bg-white shadow-sm px-3 py-2.5 flex flex-col gap-1",
                      isUnmapped ? "border-dashed border-amber-300" : "border-border",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {isUnmapped ? (
                        <span className="text-[11px] text-amber-600 italic">
                          {isAr ? "بانتظار التحقق" : "to verify"}
                        </span>
                      ) : (
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {c.code}
                        </span>
                      )}
                      <span className="text-lg font-bold tabular-nums text-foreground leading-none">
                        {c.total}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-foreground leading-snug line-clamp-2" title={`${c.officialAr}\n${c.officialEn}`}>
                      {isAr ? c.officialAr : c.officialEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
