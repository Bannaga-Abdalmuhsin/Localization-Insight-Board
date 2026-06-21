import type { Employee, TeamMetrics, DepartmentMetrics } from "@/types";

const SAUDI_KEYWORDS = [
  "saudi",
  "saudi arabian",
  "saudi national",
  "ksa",
  "سعودي",
  "سعودية",
];

export function isSaudi(nationality: string): boolean {
  return SAUDI_KEYWORDS.includes(nationality.trim().toLowerCase());
}

export function calcGap(total: number, saudi: number, targetPct: number): number {
  const t = targetPct / 100;
  if (total === 0) return 0;
  const raw = (t * total - saudi) / (1 - t);
  return raw <= 0 ? 0 : Math.ceil(raw);
}

export function buildTeamMetrics(
  employees: Employee[],
  targetPct: number
): TeamMetrics[] {
  const teamsMap = new Map<
    string,
    {
      teamId: string;
      teamName: string;
      departmentId: string;
      departmentName: string;
      employees: Employee[];
    }
  >();

  for (const emp of employees) {
    const key = emp.team_id;
    if (!teamsMap.has(key)) {
      teamsMap.set(key, {
        teamId: emp.team_id,
        teamName: emp.team?.name ?? "Unknown Team",
        departmentId: emp.department_id,
        departmentName: emp.department?.name ?? "Unknown Dept",
        employees: [],
      });
    }
    teamsMap.get(key)!.employees.push(emp);
  }

  return Array.from(teamsMap.values()).map((t) => {
    const total = t.employees.length;
    const saudi = t.employees.filter((e) => e.is_saudi).length;
    const nonSaudi = total - saudi;
    const saudizationPct = total > 0 ? (saudi / total) * 100 : 0;
    const gap = calcGap(total, saudi, targetPct);
    return {
      teamId: t.teamId,
      teamName: t.teamName,
      departmentId: t.departmentId,
      departmentName: t.departmentName,
      total,
      saudi,
      nonSaudi,
      saudizationPct,
      targetPct,
      gap,
      isCompliant: gap === 0,
    };
  });
}

export function buildDepartmentMetrics(
  teamMetrics: TeamMetrics[]
): DepartmentMetrics[] {
  const deptMap = new Map<string, DepartmentMetrics>();

  for (const tm of teamMetrics) {
    if (!deptMap.has(tm.departmentId)) {
      deptMap.set(tm.departmentId, {
        departmentId: tm.departmentId,
        departmentName: tm.departmentName,
        total: 0,
        saudi: 0,
        nonSaudi: 0,
        saudizationPct: 0,
        targetPct: tm.targetPct,
        totalGap: 0,
        isCompliant: true,
        teams: [],
      });
    }
    const dept = deptMap.get(tm.departmentId)!;
    dept.total += tm.total;
    dept.saudi += tm.saudi;
    dept.nonSaudi += tm.nonSaudi;
    dept.totalGap += tm.gap;
    dept.teams.push(tm);
    if (!tm.isCompliant) dept.isCompliant = false;
  }

  for (const dept of deptMap.values()) {
    dept.saudizationPct =
      dept.total > 0 ? (dept.saudi / dept.total) * 100 : 0;
  }

  return Array.from(deptMap.values());
}
