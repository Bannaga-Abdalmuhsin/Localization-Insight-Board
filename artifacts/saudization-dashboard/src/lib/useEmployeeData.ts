import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { buildTeamMetrics, buildDepartmentMetrics } from "@/lib/metrics";
import type {
  Employee,
  Department,
  TeamMetrics,
  DepartmentMetrics,
} from "@/types";

const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "Information Technology" },
  { id: "dept-2", name: "Finance" },
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: "e1", team_id: "t1", department_id: "dept-1", position_title: "Software Engineer", nationality: "Saudi", is_saudi: true, team: { id: "t1", department_id: "dept-1", name: "Frontend" }, department: MOCK_DEPARTMENTS[0] },
  { id: "e2", team_id: "t1", department_id: "dept-1", position_title: "UX Designer", nationality: "Indian", is_saudi: false, team: { id: "t1", department_id: "dept-1", name: "Frontend" }, department: MOCK_DEPARTMENTS[0] },
  { id: "e3", team_id: "t1", department_id: "dept-1", position_title: "Product Manager", nationality: "Saudi", is_saudi: true, team: { id: "t1", department_id: "dept-1", name: "Frontend" }, department: MOCK_DEPARTMENTS[0] },
  { id: "e4", team_id: "t2", department_id: "dept-1", position_title: "DevOps Engineer", nationality: "Egyptian", is_saudi: false, team: { id: "t2", department_id: "dept-1", name: "Backend" }, department: MOCK_DEPARTMENTS[0] },
  { id: "e5", team_id: "t2", department_id: "dept-1", position_title: "DBA", nationality: "Saudi", is_saudi: true, team: { id: "t2", department_id: "dept-1", name: "Backend" }, department: MOCK_DEPARTMENTS[0] },
  { id: "e6", team_id: "t2", department_id: "dept-1", position_title: "Backend Developer", nationality: "Pakistani", is_saudi: false, team: { id: "t2", department_id: "dept-1", name: "Backend" }, department: MOCK_DEPARTMENTS[0] },
  { id: "e7", team_id: "t3", department_id: "dept-2", position_title: "Financial Analyst", nationality: "Saudi", is_saudi: true, team: { id: "t3", department_id: "dept-2", name: "Accounting" }, department: MOCK_DEPARTMENTS[1] },
  { id: "e8", team_id: "t3", department_id: "dept-2", position_title: "Accountant", nationality: "Lebanese", is_saudi: false, team: { id: "t3", department_id: "dept-2", name: "Accounting" }, department: MOCK_DEPARTMENTS[1] },
  { id: "e9", team_id: "t4", department_id: "dept-2", position_title: "Budget Analyst", nationality: "Jordanian", is_saudi: false, team: { id: "t4", department_id: "dept-2", name: "Budgeting" }, department: MOCK_DEPARTMENTS[1] },
  { id: "e10", team_id: "t4", department_id: "dept-2", position_title: "CFO Assistant", nationality: "Saudi", is_saudi: true, team: { id: "t4", department_id: "dept-2", name: "Budgeting" }, department: MOCK_DEPARTMENTS[1] },
];

export interface EmployeeDataState {
  employees: Employee[];
  departments: Department[];
  teamMetrics: TeamMetrics[];
  departmentMetrics: DepartmentMetrics[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useEmployeeData(targetPct: number): EmployeeDataState {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      await new Promise((r) => setTimeout(r, 400));
      setEmployees(MOCK_EMPLOYEES);
      setDepartments(MOCK_DEPARTMENTS);
      setIsLoading(false);
      return;
    }

    try {
      const [empRes, deptRes] = await Promise.all([
        supabase
          .from("employees")
          .select("*, team:teams(*, department:departments(*)), department:departments(*)"),
        supabase.from("departments").select("*"),
      ]);

      if (empRes.error) throw empRes.error;
      if (deptRes.error) throw deptRes.error;

      setEmployees((empRes.data as Employee[]) ?? []);
      setDepartments((deptRes.data as Department[]) ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const teamMetrics = buildTeamMetrics(employees, targetPct);
  const departmentMetrics = buildDepartmentMetrics(teamMetrics);

  return { employees, departments, teamMetrics, departmentMetrics, isLoading, error, refresh: load };
}
