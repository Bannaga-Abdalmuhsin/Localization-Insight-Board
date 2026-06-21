import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isSaudi } from "@/lib/metrics";
import type { CsvRow } from "@/types";
import { cn } from "@/lib/utils";

type UploadStatus = "idle" | "parsing" | "upserting" | "done" | "error";

interface ParsedRow {
  department: string;
  team: string;
  positionTitle: string;
  nationality: string;
  isSaudi: boolean;
}

interface UploadResult {
  inserted: number;
  errors: string[];
}

export default function UploadData() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function parseFile(file: File) {
    setFileName(file.name);
    setStatus("parsing");
    setRows([]);
    setResult(null);
    setErrorMsg(null);

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (r) => {
          handleParsed(r.data);
        },
        error: (err) => {
          setErrorMsg(err.message);
          setStatus("error");
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result as ArrayBuffer, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json<CsvRow>(sheet);
          handleParsed(data);
        } catch (err) {
          setErrorMsg((err as Error).message);
          setStatus("error");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMsg("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.");
      setStatus("error");
    }
  }

  function handleParsed(data: CsvRow[]) {
    const parsed: ParsedRow[] = data
      .filter((r) => r["Department"] && r["Team"] && r["Position Title"] && r["Nationality"])
      .map((r) => ({
        department: r["Department"].trim(),
        team: r["Team"].trim(),
        positionTitle: r["Position Title"].trim(),
        nationality: r["Nationality"].trim(),
        isSaudi: isSaudi(r["Nationality"].trim()),
      }));

    if (parsed.length === 0) {
      setErrorMsg(
        "No valid rows found. Ensure columns: Department, Team, Position Title, Nationality"
      );
      setStatus("error");
      return;
    }

    setRows(parsed);
    setStatus("idle");
  }

  async function handleUpload() {
    if (rows.length === 0) return;

    if (!isSupabaseConfigured) {
      setResult({ inserted: rows.length, errors: [] });
      setStatus("done");
      return;
    }

    setStatus("upserting");
    const errors: string[] = [];
    let inserted = 0;

    try {
      const deptNames = [...new Set(rows.map((r) => r.department))];
      for (const name of deptNames) {
        const { error } = await supabase
          .from("departments")
          .upsert({ name }, { onConflict: "name" });
        if (error) errors.push(`Dept "${name}": ${error.message}`);
      }

      const { data: depts } = await supabase.from("departments").select("id, name");
      const deptMap = new Map((depts ?? []).map((d) => [d.name, d.id]));

      const teamNames = [...new Set(rows.map((r) => `${r.department}::${r.team}`))];
      for (const key of teamNames) {
        const [dept, team] = key.split("::");
        const deptId = deptMap.get(dept);
        if (!deptId) continue;
        const { error } = await supabase
          .from("teams")
          .upsert({ name: team, department_id: deptId }, { onConflict: "name,department_id" });
        if (error) errors.push(`Team "${team}": ${error.message}`);
      }

      const { data: teams } = await supabase.from("teams").select("id, name, department_id");
      const teamMap = new Map((teams ?? []).map((t) => [`${t.department_id}::${t.name}`, t.id]));

      const employeeRows = rows.map((r) => {
        const deptId = deptMap.get(r.department);
        const teamId = teamMap.get(`${deptId}::${r.team}`);
        return {
          team_id: teamId,
          department_id: deptId,
          position_title: r.positionTitle,
          nationality: r.nationality,
          is_saudi: r.isSaudi,
        };
      }).filter((r) => r.team_id && r.department_id);

      const BATCH = 100;
      for (let i = 0; i < employeeRows.length; i += BATCH) {
        const batch = employeeRows.slice(i, i + BATCH);
        const { error } = await supabase.from("employees").insert(batch);
        if (error) errors.push(`Batch ${i / BATCH + 1}: ${error.message}`);
        else inserted += batch.length;
      }
    } catch (err) {
      errors.push((err as Error).message);
    }

    setResult({ inserted, errors });
    setStatus("done");
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, []);

  const SAMPLE_CSV = `Department,Team,Position Title,Nationality
Information Technology,Frontend,Software Engineer,Saudi
Information Technology,Frontend,UX Designer,Indian
Information Technology,Backend,DevOps Engineer,Egyptian
Finance,Accounting,Financial Analyst,Saudi
Finance,Accounting,Accountant,Lebanese`;

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saudization_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Employee Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a CSV or Excel file with team members. Data will be parsed and upserted into your database.
        </p>
      </div>

      {/* Required columns */}
      <div className="rounded-xl border border-border bg-white shadow-sm p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Required Columns</h3>
        <div className="grid grid-cols-2 gap-3">
          {["Department", "Team", "Position Title", "Nationality"].map((col) => (
            <div key={col} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-sm font-mono text-foreground">{col}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Saudi nationals are detected automatically by nationality field value.</p>
          <button
            onClick={downloadSample}
            data-testid="btn-download-sample"
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            Download sample CSV
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "rounded-xl border-2 border-dashed transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        data-testid="dropzone-upload"
      >
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Drop your file here, or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Supports .csv, .xlsx, .xls</p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          data-testid="input-file-upload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) parseFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Parsed preview */}
      {rows.length > 0 && status !== "upserting" && status !== "done" && (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{fileName}</span>
              <span className="text-xs text-muted-foreground">— {rows.length} rows parsed</span>
            </div>
            <button onClick={() => { setRows([]); setFileName(null); setStatus("idle"); }} data-testid="btn-clear-file">
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b border-border">
                <tr>
                  {["Department", "Team", "Position Title", "Nationality", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 20).map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-4 py-2 text-foreground">{row.department}</td>
                    <td className="px-4 py-2 text-foreground">{row.team}</td>
                    <td className="px-4 py-2 text-foreground">{row.positionTitle}</td>
                    <td className="px-4 py-2 text-foreground">{row.nationality}</td>
                    <td className="px-4 py-2">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", row.isSaudi ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                        {row.isSaudi ? "Saudi" : "Non-Saudi"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p className="text-xs text-center text-muted-foreground py-2">…and {rows.length - 20} more rows</p>
            )}
          </div>
          <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span><span className="font-semibold text-emerald-600">{rows.filter((r) => r.isSaudi).length}</span> Saudi</span>
              <span><span className="font-semibold text-amber-600">{rows.filter((r) => !r.isSaudi).length}</span> Non-Saudi</span>
            </div>
            <button
              onClick={handleUpload}
              data-testid="btn-upload-confirm"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload {rows.length} Employees
            </button>
          </div>
        </div>
      )}

      {/* Uploading indicator */}
      {status === "upserting" && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-sm text-foreground">Upserting records into Supabase…</p>
        </div>
      )}

      {/* Result */}
      {status === "done" && result && (
        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Upload complete</p>
              <p className="text-xs text-muted-foreground">{result.inserted} employee records {isSupabaseConfigured ? "inserted into Supabase" : "processed (demo mode — no database connected)"}</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {result.errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{e}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => { setStatus("idle"); setRows([]); setFileName(null); setResult(null); }}
            data-testid="btn-upload-again"
            className="mt-4 text-xs text-primary font-medium hover:underline"
          >
            Upload another file
          </button>
        </div>
      )}

      {/* Error */}
      {status === "error" && errorMsg && (
        <div className="flex items-start gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Error parsing file</p>
            <p className="text-xs text-muted-foreground mt-1">{errorMsg}</p>
            <button
              onClick={() => { setStatus("idle"); setErrorMsg(null); }}
              data-testid="btn-error-dismiss"
              className="mt-2 text-xs text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
