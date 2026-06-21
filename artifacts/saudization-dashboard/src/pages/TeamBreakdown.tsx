import { useState } from "react";
import { CheckCircle2, AlertTriangle, Search, ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useEmployeeData } from "@/lib/useEmployeeData";
import ProgressBar from "@/components/ProgressBar";
import ScopeFilter from "@/components/ScopeFilter";
import type { ScopeType, TeamMetrics } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface TeamBreakdownProps {
  targetPct: number;
}

type SortKey = "teamName" | "departmentName" | "total" | "saudi" | "saudizationPct" | "gap";

export default function TeamBreakdown({ targetPct }: TeamBreakdownProps) {
  const [scope, setScope] = useState<ScopeType>("department");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("teamName");
  const [sortAsc, setSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "compliant" | "action">("all");

  const { teamMetrics, departmentMetrics, isLoading } = useEmployeeData(targetPct);
  const { t, isRtl } = useTranslation();

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  const filtered = teamMetrics
    .filter((tm) => {
      const q = search.toLowerCase();
      if (q && !tm.teamName.toLowerCase().includes(q) && !tm.departmentName.toLowerCase().includes(q)) return false;
      if (statusFilter === "compliant" && !tm.isCompliant) return false;
      if (statusFilter === "action" && tm.isCompliant) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortAsc ? cmp : -cmp;
    });

  const primaryDept = departmentMetrics[0];

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortAsc ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />;
  }

  function Th({ label, k, className }: { label: string; k: SortKey; className?: string }) {
    return (
      <th
        className={cn("px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap", className)}
        onClick={() => handleSort(k)}
        data-testid={`th-${k}`}
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.teams.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.teams.subtitle}</p>
        </div>
        <ScopeFilter scope={scope} onScopeChange={setScope} departmentName={primaryDept?.departmentName} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56 max-w-xs">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
          <input
            type="search"
            placeholder={t.teams.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-teams"
            className={cn(
              "w-full h-9 text-sm rounded-lg border border-border bg-white shadow-sm outline-none focus:ring-2 focus:ring-primary/30",
              isRtl ? "pr-9 pl-4" : "pl-9 pr-4"
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          {(["all", "compliant", "action"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              data-testid={`filter-status-${f}`}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                statusFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {f === "all" ? t.teams.all : f === "compliant" ? t.teams.compliant : t.teams.actionRequired}
            </button>
          ))}
        </div>
        <div className="ms-auto text-sm text-muted-foreground">
          {t.teams.teamCount(filtered.length)}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">{t.teams.noResults}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <Th label={t.teams.colTeam} k="teamName" />
                  <Th label={t.teams.colDepartment} k="departmentName" />
                  <Th label={t.teams.colTotal} k="total" />
                  <Th label={t.teams.colSaudi} k="saudi" />
                  <Th label={t.teams.colSaudizationPct} k="saudizationPct" />
                  <Th label={t.teams.colGap} k="gap" />
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t.teams.colStatus}
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((team, idx) => (
                  <TeamRow key={team.teamId} team={team} idx={idx} targetPct={targetPct} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamRow({ team, idx, targetPct }: { team: TeamMetrics; idx: number; targetPct: number }) {
  const { t, isRtl } = useTranslation();
  return (
    <tr
      data-testid={`row-team-${team.teamId}`}
      className={cn("hover:bg-muted/30 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-muted/10")}
    >
      <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">{team.teamName}</td>
      <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">{team.departmentName}</td>
      <td className="px-4 py-3.5 text-foreground tabular-nums">{team.total}</td>
      <td className="px-4 py-3.5 text-foreground tabular-nums">{team.saudi}</td>
      <td className="px-4 py-3.5 min-w-40">
        <ProgressBar value={team.saudizationPct} target={targetPct} />
      </td>
      <td className="px-4 py-3.5">
        <span
          data-testid={`gap-team-${team.teamId}`}
          className={cn(
            "inline-flex items-center justify-center w-8 h-7 rounded-md text-xs font-bold",
            team.gap === 0
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          )}
        >
          {team.gap === 0 ? "✓" : `+${team.gap}`}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div
          data-testid={`status-team-${team.teamId}`}
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
            team.isCompliant
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          )}
        >
          {team.isCompliant ? (
            <><CheckCircle2 className="w-3 h-3" /> {t.teams.compliant}</>
          ) : (
            <><AlertTriangle className="w-3 h-3" /> {t.teams.actionRequired}</>
          )}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <Link href={`/positions?team=${team.teamId}`}>
          <span
            className="text-primary hover:underline cursor-pointer flex items-center gap-1 text-xs font-medium"
            data-testid={`link-positions-${team.teamId}`}
          >
            {t.teams.colPositions} <ArrowRight className={cn("w-3 h-3", isRtl && "rotate-180")} />
          </span>
        </Link>
      </td>
    </tr>
  );
}
