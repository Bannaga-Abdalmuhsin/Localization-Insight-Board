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
  ChevronDown,
  Building2,
} from "lucide-react";
import { useEmployeeData } from "@/lib/useEmployeeData";
import { buildDepartmentMetrics } from "@/lib/metrics";
import MetricCard from "@/components/MetricCard";
import ProgressBar from "@/components/ProgressBar";
import ScopeFilter from "@/components/ScopeFilter";
import type { ScopeType } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import acesLogo from "@assets/MSD_Logo_1782037993058.png";

const DEPARTMENTS = [
  { id: "aces-msd", en: "ACES MSD", ar: "قسم المشاريع المدارة" },
];

interface DashboardProps {
  targetPct: number;
  onTargetChange: (v: number) => void;
}

export default function Dashboard({ targetPct, onTargetChange }: DashboardProps) {
  const [scope, setScope] = useState<ScopeType>("department");
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0].id);
  const { departmentMetrics, teamMetrics, isLoading, error } = useEmployeeData(targetPct);
  const { t, lang, isRtl } = useTranslation();

  const activeDept = DEPARTMENTS.find((d) => d.id === selectedDept) ?? DEPARTMENTS[0];

  const totalHeadcount = teamMetrics.reduce((a, tm) => a + tm.total, 0);
  const totalSaudi = teamMetrics.reduce((a, tm) => a + tm.saudi, 0);
  const totalNonSaudi = teamMetrics.reduce((a, tm) => a + tm.nonSaudi, 0);
  const overallPct = totalHeadcount > 0 ? (totalSaudi / totalHeadcount) * 100 : 0;
  const totalGap = teamMetrics.reduce((a, tm) => a + tm.gap, 0);
  const compliantTeams = teamMetrics.filter((tm) => tm.isCompliant).length;

  const primaryDept = departmentMetrics[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t.dashboard.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive font-medium">{t.dashboard.errorLoading} {error}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.dashboard.errorHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">

        {/* Left: Logo + Department dropdown */}
        <div className="flex items-center gap-3">
          {/* ACES logo — shown on both languages, positioned at layout start */}
          <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#000", height: 44, width: 100 }}>
            <img
              src={acesLogo}
              alt="ACES"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>

          {/* Department dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm">
              <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-sm font-semibold text-foreground bg-transparent outline-none cursor-pointer appearance-none pe-5"
                data-testid="select-department"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {lang === "ar" ? d.ar : d.en}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Target % + Scope */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-medium">{t.dashboard.target}:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={targetPct}
              onChange={(e) => onTargetChange(Number(e.target.value))}
              data-testid="input-target-pct"
              className="w-14 text-sm font-semibold text-primary bg-transparent outline-none text-center"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <ScopeFilter scope={scope} onScopeChange={setScope} departmentName={primaryDept?.departmentName} />
        </div>
      </div>

      {/* Page title below header controls */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{t.dashboard.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t.dashboard.subtitle}</p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={t.dashboard.totalHeadcount}
          value={totalHeadcount.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          accent="purple"
          data-testid="metric-total-headcount"
        />
        <MetricCard
          label={t.dashboard.saudiNationals}
          value={totalSaudi.toLocaleString()}
          sub={`${overallPct.toFixed(1)}% ${t.dashboard.ofWorkforce}`}
          icon={<UserCheck className="w-5 h-5" />}
          accent="success"
          data-testid="metric-total-saudi"
        />
        <MetricCard
          label={t.dashboard.nonSaudi}
          value={totalNonSaudi.toLocaleString()}
          sub={`${totalHeadcount > 0 ? ((totalNonSaudi / totalHeadcount) * 100).toFixed(1) : 0}% ${t.dashboard.ofWorkforce}`}
          icon={<UserX className="w-5 h-5" />}
          accent="default"
          data-testid="metric-total-non-saudi"
        />
        <MetricCard
          label={t.dashboard.totalHiringGap}
          value={totalGap}
          sub={`${compliantTeams} ${t.dashboard.teamsCompliant}`}
          icon={totalGap === 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          accent={totalGap === 0 ? "success" : "warning"}
          data-testid="metric-total-gap"
        />
      </div>

      {/* Department Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">{t.dashboard.departmentOverview}</h2>
          <Link href="/teams">
            <span
              className="text-sm text-primary font-medium flex items-center gap-1 cursor-pointer hover:underline"
              data-testid="link-view-all-teams"
            >
              {t.dashboard.viewAllTeams}
              <ArrowRight className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
            </span>
          </Link>
        </div>

        {departmentMetrics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">{t.dashboard.noData}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.dashboard.noDataHint}</p>
            <Link href="/upload">
              <span
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-medium cursor-pointer hover:underline"
                data-testid="link-upload-data"
              >
                {t.dashboard.uploadData}
                <ArrowRight className={cn("w-3 h-3", isRtl && "rotate-180")} />
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
            <h3 className="text-sm font-semibold text-foreground">{t.dashboard.overallProgress}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t.dashboard.overallProgressSub}</p>
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
            {t.common.gapWarning(totalGap, targetPct)}
          </p>
        )}
        {totalGap === 0 && totalHeadcount > 0 && (
          <p className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t.dashboard.allCompliant}
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
  const { t, isRtl } = useTranslation();
  const compliant = dept.teams.filter((tm) => tm.isCompliant).length;

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
            {dept.total} {t.dashboard.employees} · {dept.teams.length} {t.dashboard.teams}
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
            <><CheckCircle2 className="w-3.5 h-3.5" /> {t.dashboard.compliant}</>
          ) : (
            <><AlertTriangle className="w-3.5 h-3.5" /> {t.dashboard.actionRequired}</>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{dept.saudi}</p>
          <p className="text-[11px] text-muted-foreground">{t.dashboard.saudi}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{dept.nonSaudi}</p>
          <p className="text-[11px] text-muted-foreground">{t.dashboard.nonSaudiLabel}</p>
        </div>
        <div className="text-center">
          <p className={cn("text-lg font-bold", dept.totalGap > 0 ? "text-amber-600" : "text-emerald-600")}>
            {dept.totalGap}
          </p>
          <p className="text-[11px] text-muted-foreground">{t.dashboard.gap}</p>
        </div>
      </div>

      <ProgressBar value={dept.saudizationPct} target={targetPct} />

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{compliant} {t.dashboard.ofTeamsCompliant}</span>
        <Link href="/teams">
          <span
            className="text-primary font-medium cursor-pointer hover:underline flex items-center gap-0.5"
            data-testid={`link-dept-teams-${dept.departmentId}`}
          >
            {t.dashboard.details} <ArrowRight className={cn("w-3 h-3", isRtl && "rotate-180")} />
          </span>
        </Link>
      </div>
    </div>
  );
}
