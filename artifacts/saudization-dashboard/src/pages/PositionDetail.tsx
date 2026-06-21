import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Filter } from "lucide-react";
import { useEmployeeData } from "@/lib/useEmployeeData";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface PositionDetailProps {
  targetPct: number;
}

export default function PositionDetail({ targetPct }: PositionDetailProps) {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const initialTeam = params.get("team") ?? "all";

  const [teamFilter, setTeamFilter] = useState(initialTeam);
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [saudiOnly, setSaudiOnly] = useState(false);
  const [nonSaudiOnly, setNonSaudiOnly] = useState(false);

  const { employees, teamMetrics, isLoading } = useEmployeeData(targetPct);
  const { t, isRtl } = useTranslation();

  const teams = Array.from(
    new Map(teamMetrics.map((tm) => [tm.teamId, tm])).values()
  );

  const nationalities = Array.from(
    new Set(employees.map((e) => e.nationality).filter(Boolean))
  ).sort();

  const filtered = employees.filter((e) => {
    if (teamFilter !== "all" && e.team_id !== teamFilter) return false;
    if (nationalityFilter !== "all" && e.nationality !== nationalityFilter) return false;
    if (saudiOnly && !e.is_saudi) return false;
    if (nonSaudiOnly && e.is_saudi) return false;
    const q = search.toLowerCase();
    if (q && !e.position_title.toLowerCase().includes(q) && !e.nationality.toLowerCase().includes(q)) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summaryItems = [
    { label: t.positions.showing, value: filtered.length, className: "text-foreground" },
    { label: t.positions.saudi, value: filtered.filter((e) => e.is_saudi).length, className: "text-emerald-600" },
    { label: t.positions.nonSaudi, value: filtered.filter((e) => !e.is_saudi).length, className: "text-amber-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.positions.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.positions.subtitle}</p>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-4">
        {summaryItems.map((s) => (
          <div key={s.label} className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className={cn("text-sm font-bold tabular-nums", s.className)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-56 max-w-xs">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
          <input
            type="search"
            placeholder={t.positions.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-positions"
            className={cn(
              "w-full h-9 text-sm rounded-lg border border-border bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/30",
              isRtl ? "pr-9 pl-4" : "pl-9 pr-4"
            )}
          />
        </div>

        {/* Team filter */}
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          data-testid="select-team-filter"
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{t.positions.allTeams}</option>
          {teams.map((tm) => (
            <option key={tm.teamId} value={tm.teamId}>{tm.teamName} ({tm.departmentName})</option>
          ))}
        </select>

        {/* Nationality filter */}
        <select
          value={nationalityFilter}
          onChange={(e) => setNationalityFilter(e.target.value)}
          data-testid="select-nationality-filter"
          className="h-9 text-sm rounded-lg border border-border bg-white shadow-sm px-3 outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">{t.positions.allNationalities}</option>
          {nationalities.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        {/* Quick filters */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => { setNonSaudiOnly((v) => !v); setSaudiOnly(false); }}
            data-testid="filter-non-saudi-only"
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
              nonSaudiOnly
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-muted-foreground border-border hover:border-amber-400"
            )}
          >
            {t.positions.nonSaudiOnly}
          </button>
          <button
            onClick={() => { setSaudiOnly((v) => !v); setNonSaudiOnly(false); }}
            data-testid="filter-saudi-only"
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
              saudiOnly
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white text-muted-foreground border-border hover:border-emerald-400"
            )}
          >
            {t.positions.saudiOnly}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">{t.positions.noResults}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {[
                    t.positions.colPosition,
                    t.positions.colDepartment,
                    t.positions.colTeam,
                    t.positions.colNationality,
                    t.positions.colStatus,
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    data-testid={`row-employee-${emp.id}`}
                    className={cn("hover:bg-muted/20 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-muted/10")}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{emp.position_title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.department?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{emp.team?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-foreground">{emp.nationality}</td>
                    <td className="px-4 py-3">
                      <span
                        data-testid={`status-employee-${emp.id}`}
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
                          emp.is_saudi
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {emp.is_saudi ? t.positions.saudi : t.positions.nonSaudi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!filtered.every((e) => e.is_saudi) && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-amber-600">{filtered.filter((e) => !e.is_saudi).length}</span>{" "}
          {t.positions.transitionNote(filtered.filter((e) => !e.is_saudi).length)}
        </p>
      )}
    </div>
  );
}
