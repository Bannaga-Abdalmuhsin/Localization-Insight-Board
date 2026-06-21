import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronUp,
  ChevronDown,
  MapPin,
  Building,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useProjectData, ProjectEmployee } from "@/lib/useProjectData";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

type GroupBy = "region" | "company";
type SortKey = "name" | "total" | "saudi" | "nonSaudi" | "engPct" | "techPct";

interface GroupRow {
  name: string;
  total: number;
  saudi: number;
  nonSaudi: number;
  engTotal: number;
  engSaudi: number;
  engPct: number;
  engCompliant: boolean;
  techTotal: number;
  techSaudi: number;
  techPct: number;
  techCompliant: boolean;
}

function buildGroups(employees: ProjectEmployee[], groupBy: GroupBy): GroupRow[] {
  const map = new Map<string, ProjectEmployee[]>();
  for (const e of employees) {
    const key = groupBy === "region"
      ? (e.region ?? "Unknown")
      : (e.company ?? "Unknown");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }

  return Array.from(map.entries()).map(([name, emps]) => {
    const saudi = emps.filter((e) => e.is_saudi).length;
    const eng = emps.filter((e) => e.saudization_code === "Eng");
    const engSaudi = eng.filter((e) => e.is_saudi).length;
    const engPct = eng.length > 0 ? engSaudi / eng.length : 0;
    const tech = emps.filter((e) => e.saudization_code === "Tech");
    const techSaudi = tech.filter((e) => e.is_saudi).length;
    const techPct = tech.length > 0 ? techSaudi / tech.length : 0;
    return {
      name,
      total: emps.length,
      saudi,
      nonSaudi: emps.length - saudi,
      engTotal: eng.length,
      engSaudi,
      engPct,
      engCompliant: eng.length === 0 || engPct >= 0.3,
      techTotal: tech.length,
      techSaudi,
      techPct,
      techCompliant: tech.length === 0 || techPct >= 0.25,
    };
  });
}

export default function TeamBreakdown({ targetPct: _unused }: { targetPct: number }) {
  const { metrics, isLoading } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";

  const [groupBy, setGroupBy] = useState<GroupBy>("region");
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
          "px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap",
          className
        )}
        onClick={() => handleSort(k)}
      >
        <div className="flex items-center gap-1.5">
          {label}
          <SortIcon k={k} />
        </div>
      </th>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rows = buildGroups(metrics.employees, groupBy);

  const filtered = rows
    .filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      const overallCompliant = r.engCompliant && r.techCompliant;
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
        case "engPct": av = a.engPct; bv = b.engPct; break;
        case "techPct": av = a.techPct; bv = b.techPct; break;
      }
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortAsc ? cmp : -cmp;
    });

  const compliantCount = filtered.filter((r) => r.engCompliant && r.techCompliant).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isAr ? "تفصيل الفرق" : "Team Breakdown"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAr
            ? "حالة الامتثال لنطاقات حسب المنطقة أو الشركة — مشروع STC COW MS"
            : "Nitaqat compliance by Region or Company — STC COW MS project"}
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: isAr ? "إجمالي الفئات" : "Total Groups", value: filtered.length, cls: "text-foreground" },
          { label: isAr ? "ممتثل" : "Compliant", value: compliantCount, cls: "text-emerald-600" },
          { label: isAr ? "يتطلب إجراء" : "Action Required", value: filtered.length - compliantCount, cls: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className={cn("text-sm font-bold tabular-nums", s.cls)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Group by toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setGroupBy("region")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              groupBy === "region"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            {isAr ? "حسب المنطقة" : "By Region"}
          </button>
          <button
            onClick={() => setGroupBy("company")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              groupBy === "company"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building className="w-3.5 h-3.5" />
            {isAr ? "حسب الشركة" : "By Company"}
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={isAr ? "بحث..." : "Search…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 text-sm rounded-lg border border-border bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/30 ps-9 pe-4"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          {(["all", "compliant", "action"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                statusFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/50"
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
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isAr ? "لا توجد نتائج." : "No results."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <Th label={groupBy === "region" ? (isAr ? "المنطقة" : "Region") : (isAr ? "الشركة" : "Company")} k="name" />
                  <Th label={isAr ? "الإجمالي" : "Total"} k="total" />
                  <Th label={isAr ? "سعودي" : "Saudi"} k="saudi" />
                  <Th label={isAr ? "غير سعودي" : "Non-Saudi"} k="nonSaudi" />
                  <Th label={isAr ? "هندسة % (هدف 30%)" : "Engineering % (30% target)"} k="engPct" />
                  <Th label={isAr ? "تقني % (هدف 25%)" : "Technical % (25% target)"} k="techPct" />
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {isAr ? "الحالة" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row, idx) => {
                  const overallCompliant = row.engCompliant && row.techCompliant;
                  return (
                    <tr
                      key={row.name}
                      className={cn("hover:bg-muted/30 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-muted/10")}
                    >
                      <td className="px-4 py-3.5 font-semibold text-foreground whitespace-nowrap">{row.name}</td>
                      <td className="px-4 py-3.5 tabular-nums text-foreground">{row.total}</td>
                      <td className="px-4 py-3.5 tabular-nums text-emerald-600 font-medium">{row.saudi}</td>
                      <td className="px-4 py-3.5 tabular-nums text-foreground">{row.nonSaudi}</td>

                      {/* Eng cell */}
                      <td className="px-4 py-3.5">
                        {row.engTotal > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", row.engCompliant ? "bg-emerald-500" : "bg-red-500")}
                                style={{ width: `${Math.min(100, (row.engPct / 0.3) * 100)}%` }}
                              />
                            </div>
                            <span className={cn("text-xs font-bold tabular-nums", row.engCompliant ? "text-emerald-600" : "text-red-600")}>
                              {(row.engPct * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-muted-foreground">({row.engSaudi}/{row.engTotal})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Tech cell */}
                      <td className="px-4 py-3.5">
                        {row.techTotal > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", row.techCompliant ? "bg-emerald-500" : "bg-red-500")}
                                style={{ width: `${Math.min(100, (row.techPct / 0.25) * 100)}%` }}
                              />
                            </div>
                            <span className={cn("text-xs font-bold tabular-nums", row.techCompliant ? "text-emerald-600" : "text-red-600")}>
                              {(row.techPct * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-muted-foreground">({row.techSaudi}/{row.techTotal})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                          overallCompliant ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {overallCompliant
                            ? <><ShieldCheck className="w-3 h-3" />{isAr ? "ممتثل" : "Compliant"}</>
                            : <><ShieldAlert className="w-3 h-3" />{isAr ? "يتطلب إجراء" : "Action Required"}</>}
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
