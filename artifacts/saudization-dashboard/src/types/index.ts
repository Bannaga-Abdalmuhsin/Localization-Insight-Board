export interface Department {
  id: string;
  name: string;
  created_at?: string;
}

export interface Team {
  id: string;
  department_id: string;
  name: string;
  created_at?: string;
  department?: Department;
}

export interface Employee {
  id: string;
  team_id: string;
  department_id: string;
  position_title: string;
  nationality: string;
  is_saudi: boolean;
  created_at?: string;
  team?: Team;
  department?: Department;
}

export interface CsvRow {
  Department: string;
  Team: string;
  "Position Title": string;
  Nationality: string;
}

export interface TeamMetrics {
  teamId: string;
  teamName: string;
  departmentId: string;
  departmentName: string;
  total: number;
  saudi: number;
  nonSaudi: number;
  saudizationPct: number;
  targetPct: number;
  gap: number;
  isCompliant: boolean;
}

export interface DepartmentMetrics {
  departmentId: string;
  departmentName: string;
  total: number;
  saudi: number;
  nonSaudi: number;
  saudizationPct: number;
  targetPct: number;
  totalGap: number;
  isCompliant: boolean;
  teams: TeamMetrics[];
}

export type ScopeType = "department" | "company";
