import { useState, useMemo } from "react";
import { Search, BarChart3, UserCheck, UserX } from "lucide-react";
import { REGION_AR } from "@/components/CompanyLogo";
import { useProjectData } from "@/lib/useProjectData";
import { getOccupationCode } from "@/lib/occupationCodes";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface CodeGroup {
  key: string;
  code: string | null;
  officialAr: string;
  officialEn: string;
  professions: Set<string>;
  total: number;
  saudi: number;
  nonSaudi: number;
}

export default function Analysis() {
  const { metrics, isLoading } = useProjectData();
  const { lang } = useTranslation();
  const isAr = lang === "ar";

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  const employees = metrics.employees;

  const regions = useMemo(
    () => Array.from(new Set(employees.map((e) => e.region ?? "").filter(Boolean))).sort(),
    [employees],
  );
  const companies = useMemo(
    () => Array.from(new Set(employees.map((e) => e.company ?? "").filter(Boolean))).sort(),
    [employees],
  );

  const groups = useMemo(() => {
    const scoped = employees.filter((e) => {
      if (regionFilter !== "all" && e.region !== regionFilter) return false;
      if (companyFilter !== "all" && e.company !== companyFilter) return false;
      return true;
    });

    const map = new Map<string, CodeGroup>();
    for (const e of scoped) {
      const oc = getOccupationCode(e.iqama_profession);
      const hasCode = !!(oc && oc.code);
      const key = hasCode ? oc!.code! : "__unmapped__";
      let g = map.get(key);
      if (!g) {
        g = {
          key,
          code: hasCode ? oc!.code! : null,
          officialAr: hasCode ? oc!.officialAr : "بانتظار التحقق",
          officialEn: hasCode ? oc!.officialEn : "To verify",
          professions: new Set<string>(),
          total: 0,
          saudi: 0,
          nonSaudi: 0,
        };
        map.set(key, g);
      }
      if (e.iqama_profession) g.professions.add(e.iqama_profession);
      g.total += 1;
      if (e.is_saudi) g.saudi += 1;
      else g.nonSaudi += 1;
    }

    return Array.from(map.values()).sort((a, b) => {
      // Unmapped bucket always last
      if (a.code === null && b.code !== null) return 1;
      if (b.code === null && a.code !== null) return -1;
      return b.total - a.total;
    });
  }, [employees, regionFilter, companyFilter]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        (g.code ?? "").includes(q) ||
        g.officialAr.toLowerCase().includes(q) ||
        g.officialEn.toLowerCase().includes(q) ||
        Array.from(g.professions).some((p) => p.toLowerCase().includes(q)),
    );
  }, [groups, search]);

  const mappedGroups = groups.filter((g) => g.code !== null);
  const totalInScope = groups.reduce((s, g) => s + g.total, 0);
  const unmapped = groups.find((g) => g.code === null);
  const maxTotal = Math.max(1, ...visible.map((g) => g.total));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = [
    {
      label: isAr ? "عدد الرموز" : "Distinct codes",
      value: mappedGroups.length,
      cls: "text-foreground",
    },
    {
      label: isAr ? "موظفون مصنّفون" : "Coded employees",
      value: totalInScope - (unmapped?.total ?? 0),
      cls: "text-emerald-600",
    },
    {
      label: isAr ? "بانتظار التحقق" : "To verify",
      value: unmapped?.total ?? 0,
      cls: "text-amber-600",
    },
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
              ? "توزيع الموظفين حسب رمز المهنة الرسمي (HRSD) — السعوديون مقابل غير السعوديين لكل رمز"
              : "Workforce distribution by official HRSD occupation code — Saudi vs Non-Saudi per code"}
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-3">
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm"
          >
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className={cn("text-sm font-bold tabular-nums", s.cls)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
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

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{isAr ? "جميع المناطق" : "All Regions"}</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {isAr ? REGION_AR[r] ?? r : r}
            </option>
          ))}
        </select>

        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{isAr ? "جميع الشركات" : "All Companies"}</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {visible.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isAr ? "لا توجد نتائج تطابق البحث." : "No results match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {[
                    isAr ? "رمز المهنة (HRSD)" : "HRSD Code",
                    isAr ? "المسمى الرسمي" : "Official Title",
                    isAr ? "العدد" : "Headcount",
                    isAr ? "التوزيع" : "Distribution",
                    isAr ? "سعودي" : "Saudi",
                    isAr ? "غير سعودي" : "Non-Saudi",
                    isAr ? "نسبة التوطين" : "Localization %",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap text-start"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((g, idx) => {
                  const pct = g.total > 0 ? Math.round((g.saudi / g.total) * 100) : 0;
                  const isUnmapped = g.code === null;
                  return (
                    <tr
                      key={g.key}
                      className={cn(
                        "hover:bg-muted/20 transition-colors",
                        idx % 2 === 0 ? "bg-white" : "bg-muted/10",
                      )}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isUnmapped ? (
                          <span className="text-xs text-muted-foreground italic">
                            {isAr ? "بانتظار التحقق" : "to verify"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums text-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {g.code}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground font-medium">
                          {isAr ? g.officialAr : g.officialEn}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isAr ? g.officialEn : g.officialAr}
                          {g.professions.size > 1 && (
                            <span className="ms-1">
                              · {g.professions.size} {isAr ? "مسميات" : "titles"}
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-bold text-foreground">{g.total}</td>
                      <td className="px-4 py-3 min-w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${(g.saudi / maxTotal) * 100}%` }}
                            />
                            <div
                              className="h-full bg-amber-400"
                              style={{ width: `${(g.nonSaudi / maxTotal) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <UserCheck className="w-3.5 h-3.5" />
                          {g.saudi}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <UserX className="w-3.5 h-3.5" />
                          {g.nonSaudi}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums",
                            pct >= 50
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {pct}%
                        </span>
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
