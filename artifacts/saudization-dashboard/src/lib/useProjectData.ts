import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface ProjectEmployee {
  id: string;
  employee_no: number | null;
  employee_name: string;
  nationality: string;
  is_saudi: boolean;
  company: string | null;
  iqama_no: number | null;
  department: string | null;
  job_title: string | null;
  region: string | null;
  saudization_code: string | null;
  iqama_profession: string | null;
  project: string | null;
  profession_category: string | null;
  required_saudization_pct: number | null;
}

export interface CategoryMetrics {
  code: string;
  target: number;
  total: number;
  saudi: number;
  nonSaudi: number;
  currentPct: number;
  isCompliant: boolean;
  saudiNeededToHire: number;
  nonSaudiToTerminate: number;
  targetTotal: number;
  byRegion: RegionMetrics[];
}

export interface CompanySlice {
  company: string;
  total: number;
  saudi: number;
  required: number;
}

export interface RegionMetrics {
  region: string;
  total: number;
  saudi: number;
  nonSaudi: number;
  currentPct: number;
  isCompliant: boolean;
  byCompany: CompanySlice[];
}

export interface ProjectMetrics {
  totalAll: number;
  scopedTotal: number;
  scopedSaudi: number;
  scopedNonSaudi: number;
  scopedPct: number;
  naTotal: number;
  naSaudi: number;
  eng: CategoryMetrics;
  tech: CategoryMetrics;
  employees: ProjectEmployee[];
}

function computeCategory(
  employees: ProjectEmployee[],
  code: string,
  targetPct: number
): CategoryMetrics {
  const group = employees.filter((e) => e.saudization_code === code);
  const saudi = group.filter((e) => e.is_saudi).length;
  const total = group.length;
  const nonSaudi = total - saudi;
  const currentPct = total > 0 ? saudi / total : 0;
  const isCompliant = currentPct >= targetPct;

  // Localization formula (fixed headcount / replacement scenario):
  // Required Saudis = ceil(target% × total); gap = required - current
  const requiredSaudi = Math.ceil(targetPct * total);
  const gap = isCompliant ? 0 : Math.max(0, requiredSaudi - saudi);

  const saudiNeededToHire = gap;
  const nonSaudiToTerminate = gap;
  const targetTotal = total; // headcount stays fixed

  const REGIONS = ["Central", "East", "South", "West"];
  const COMPANIES = ["Aces", "Mac", "Anet"];
  const byRegion: RegionMetrics[] = REGIONS.map((region) => {
    const rg = group.filter(
      (e) => (e.region ?? "").toLowerCase() === region.toLowerCase()
    );
    const rs = rg.filter((e) => e.is_saudi).length;
    const rt = rg.length;
    const byCompany: CompanySlice[] = COMPANIES.map((company) => {
      const cg = rg.filter(
        (e) => (e.company ?? "").toLowerCase() === company.toLowerCase()
      );
      const cs = cg.filter((e) => e.is_saudi).length;
      const ct = cg.length;
      const req = Math.max(0, Math.ceil(targetPct * ct) - cs);
      return { company, total: ct, saudi: cs, required: req };
    });
    return {
      region,
      total: rt,
      saudi: rs,
      nonSaudi: rt - rs,
      currentPct: rt > 0 ? rs / rt : 0,
      isCompliant: rt > 0 ? rs / rt >= targetPct : true,
      byCompany,
    };
  }).filter((r) => r.total > 0);

  return {
    code,
    target: targetPct,
    total,
    saudi,
    nonSaudi,
    currentPct,
    isCompliant,
    saudiNeededToHire,
    nonSaudiToTerminate,
    targetTotal,
    byRegion,
  };
}

function computeMetrics(employees: ProjectEmployee[]): ProjectMetrics {
  const scoped = employees.filter((e) => e.saudization_code !== "NA");
  const na = employees.filter((e) => e.saudization_code === "NA");
  const scopedSaudi = scoped.filter((e) => e.is_saudi).length;

  return {
    totalAll: employees.length,
    scopedTotal: scoped.length,
    scopedSaudi,
    scopedNonSaudi: scoped.length - scopedSaudi,
    scopedPct: scoped.length > 0 ? scopedSaudi / scoped.length : 0,
    naTotal: na.length,
    naSaudi: na.filter((e) => e.is_saudi).length,
    eng: computeCategory(employees, "Eng", 0.3),
    tech: computeCategory(employees, "Tech", 0.25),
    employees,
  };
}

const MOCK_METRICS: ProjectMetrics = computeMetrics([]);

export function useProjectData() {
  const [metrics, setMetrics] = useState<ProjectMetrics>(MOCK_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setMetrics(MOCK_METRICS);
      setIsLoading(false);
      return;
    }

    supabase
      .from("project_employees")
      .select("*")
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setMetrics(computeMetrics((data as ProjectEmployee[]) ?? []));
        }
        setIsLoading(false);
      });
  }, []);

  return { metrics, isLoading, error };
}
