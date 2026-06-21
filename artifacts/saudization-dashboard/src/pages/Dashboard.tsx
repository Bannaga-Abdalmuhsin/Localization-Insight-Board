import { useState } from "react";
import { Link } from "wouter";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Target,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEmployeeData } from "@/lib/useEmployeeData";
import { buildDepartmentMetrics } from "@/lib/metrics";
import MetricCard from "@/components/MetricCard";
import ProgressBar from "@/components/ProgressBar";
import ScopeFilter from "@/components/ScopeFilter";
import type { ScopeType } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardProps {
  targetPct: number;
  onTargetChange: (v: number) => void;
}

export default function Dashboard({ targetPct, onTargetChange }: DashboardProps) {
  const [scope, setScope] = useState<ScopeType>("department");
  const { departmentMetrics, teamMetrics, isLoading, error } = useEmployeeData(targetPct);

  const totalHeadcount = teamMetrics.reduce((a, t) => a + t.total, 0);
  const totalSaudi = teamMetrics.reduce((a, t) => a + t.saudi, 0);
  const totalNonSaudi = teamMetrics.reduce((a, t) => a + t.nonSaudi, 0);
  const overallPct = totalHeadcount > 0 ? (totalSaudi / totalHeadcount) * 100 : 0;
  const totalGap = teamMetrics.reduce((a, t) => a + t.gap, 0);
  const compliantTeams = teamMetrics.filter((t) => t.isCompliant).length;

  const primaryDept = departmentMetrics[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive font-medium">Error loading data: {error}</p>
          <p className="text-xs text-muted-foreground mt-1">Check your Supabase connection and try refreshing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saudization Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Workforce compliance overview — Current Saudization status by department and team
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Target % control */}
          <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">Target:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={targetPct}
              onChange={(e) => onTargetChange(Number(e.target.value))}
              data-testid="input-target-pct"
              className="w-14 text-sm font-semibold text-primary bg-transparent outline-none text-right"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <ScopeFilter scope={scope} onScopeChange={setScope} departmentName={primaryDept?.departmentName} />
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Headcount"
          value={totalHeadcount.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          accent="purple"
          data-testid="metric-total-headcount"
        />
        <MetricCard
          label="Saudi Nationals"
          value={totalSaudi.toLocaleString()}
          sub={`${overallPct.toFixed(1)}% of workforce`}
          icon={<UserCheck className="w-5 h-5" />}
          accent="success"
          data-testid="metric-total-saudi"
        />
        <MetricCard
          label="Non-Saudi"
          value={totalNonSaudi.toLocaleString()}
          sub={`${totalHeadcount > 0 ? ((totalNonSaudi / totalHeadcount) * 100).toFixed(1) : 0}% of workforce`}
          icon={<UserX className="w-5 h-5" />}
          accent="default"
          data-testid="metric-total-non-saudi"
        />
        <MetricCard
          label="Total Hiring Gap"
          value={totalGap}
          sub={`${compliantTeams} of ${teamMetrics.length} teams compliant`}
          icon={totalGap === 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          accent={totalGap === 0 ? "success" : "warning"}
          data-testid="metric-total-gap"
        />
      </div>

      {/* Department Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Department Overview</h2>
          <Link href="/teams">
            <span className="text-sm text-primary font-medium flex items-center gap-1 cursor-pointer hover:underline" data-testid="link-view-all-teams">
              View all teams <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {departmentMetrics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No data available</p>
            <p className="text-xs text-muted-foreground mt-1">Upload a CSV file to get started</p>
            <Link href="/upload">
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline" data-testid="link-upload-data">
                Upload data <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {departmentMetrics.map((dept) => (
              <DepartmentCard key={dept.departmentId} dept={dept} targetPct={targetPct} />
            ))}
          </div>
        )}
      </div>

      {/* Overall Saudization Progress */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Overall Saudization Progress</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Current vs. target across all teams</p>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className={cn("w-4 h-4", overallPct >= targetPct ? "text-emerald-500" : "text-amber-500")} />
            <span className={cn("text-sm font-semibold", overallPct >= targetPct ? "text-emerald-600" : "text-amber-600")}>
              {overallPct.toFixed(1)}%
            </span>
          </div>
        </div>
        <ProgressBar value={overallPct} target={targetPct} />
        {totalGap > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-amber-600">{totalGap}</span> additional Saudi national{totalGap !== 1 ? "s" : ""} required across all teams to meet the {targetPct}% target.
          </p>
        )}
        {totalGap === 0 && totalHeadcount > 0 && (
          <p className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> All teams meet the Saudization target.
          </p>
        )}
      </div>
    </div>
  );
}

function DepartmentCard({
  dept,
  targetPct,
}: {
  dept: ReturnType<typeof buildDepartmentMetrics>[0];
  targetPct: number;
}) {
  const compliant = dept.teams.filter((t) => t.isCompliant).length;

  return (
    <div
      data-testid={`card-department-${dept.departmentId}`}
      className={cn(
        "rounded-xl border bg-white shadow-sm p-5 transition-shadow hover:shadow-md",
        dept.isCompliant ? "border-emerald-200" : "border-amber-200"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{dept.departmentName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dept.total} employees · {dept.teams.length} teams
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
            dept.isCompliant
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          )}
          data-testid={`status-dept-${dept.departmentId}`}
        >
          {dept.isCompliant ? (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Compliant</>
          ) : (
            <><AlertTriangle className="w-3.5 h-3.5" /> Action Required</>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{dept.saudi}</p>
          <p className="text-[11px] text-muted-foreground">Saudi</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{dept.nonSaudi}</p>
          <p className="text-[11px] text-muted-foreground">Non-Saudi</p>
        </div>
        <div className="text-center">
          <p className={cn("text-lg font-bold", dept.totalGap > 0 ? "text-amber-600" : "text-emerald-600")}>
            {dept.totalGap}
          </p>
          <p className="text-[11px] text-muted-foreground">Gap</p>
        </div>
      </div>

      <ProgressBar value={dept.saudizationPct} target={targetPct} />

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{compliant} of {dept.teams.length} teams compliant</span>
        <Link href="/teams">
          <span className="text-primary font-medium cursor-pointer hover:underline flex items-center gap-0.5" data-testid={`link-dept-teams-${dept.departmentId}`}>
            Details <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}
