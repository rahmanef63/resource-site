/**
 * useDbImportExport Hook
 * Features #112-115 - CSV and JSON import/export for database tables
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback, useState } from "react";

export type ImportJobType = "import_csv" | "import_json" | "import_excel";
export type ExportJobType = "export_csv" | "export_json" | "export_excel";
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";

export interface ImportConfig {
  fieldMapping?: Record<string, string>;
  skipFirstRow?: boolean;
  dateFormat?: string;
  nullValues?: string[];
  updateMode?: "insert_only" | "update_only" | "upsert";
  matchField?: Id<"dbFields">;
}

export interface ExportConfig {
  includeFields?: Id<"dbFields">[];
  excludeFields?: Id<"dbFields">[];
  filters?: any;
  sortBy?: string;
}

export interface UseDbImportExportOptions {
  tableId: Id<"dbTables">;
  workspaceId: Id<"workspaces">;
}

export function useDbImportExport(options: UseDbImportExportOptions) {
  const { tableId, workspaceId } = options;

  const [isProcessing, setIsProcessing] = useState(false);

  // Queries
  const jobs = useQuery(api.features.database.dbImportExport.getJobs, {
    tableId,
  });

  const recentJobs = useQuery(
    api.features.database.dbImportExport.getRecentJobs,
    { workspaceId, limit: 5 }
  );

  // Mutations
  const createImportJobMutation = useMutation(
    api.features.database.dbImportExport.createImportJob
  );
  const createExportJobMutation = useMutation(
    api.features.database.dbImportExport.createExportJob
  );
  const processCSVImportMutation = useMutation(
    api.features.database.dbImportExport.processCSVImport
  );
  const processJSONImportMutation = useMutation(
    api.features.database.dbImportExport.processJSONImport
  );
  const cancelJobMutation = useMutation(
    api.features.database.dbImportExport.cancelJob
  );

  // CSV Export Query
  const csvExportData = useQuery(
    api.features.database.dbImportExport.generateCSVExport,
    { tableId }
  );

  // JSON Export Query
  const jsonExportData = useQuery(
    api.features.database.dbImportExport.generateJSONExport,
    { tableId, includeMetadata: false }
  );

  // Import CSV
  const importCSV = useCallback(
    async (csvData: Record<string, any>[], fileName?: string, config?: ImportConfig) => {
      setIsProcessing(true);
      try {
        // Create job
        const jobId = await createImportJobMutation({
          tableId,
          workspaceId,
          jobType: "import_csv",
          fileName,
          config,
        });

        // Process import
        const result = await processCSVImportMutation({
          jobId,
          csvData,
        });

        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [tableId, workspaceId, createImportJobMutation, processCSVImportMutation]
  );

  // Import JSON
  const importJSON = useCallback(
    async (jsonData: Record<string, any>[], fileName?: string, config?: ImportConfig) => {
      setIsProcessing(true);
      try {
        // Create job
        const jobId = await createImportJobMutation({
          tableId,
          workspaceId,
          jobType: "import_json",
          fileName,
          config,
        });

        // Process import
        const result = await processJSONImportMutation({
          jobId,
          jsonData,
        });

        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [tableId, workspaceId, createImportJobMutation, processJSONImportMutation]
  );

  // Export to CSV string
  const exportCSV = useCallback(() => {
    if (!csvExportData) return null;

    const { headers, rows } = csvExportData;

    // Build CSV string
    const csvLines: string[] = [];

    // Header row
    csvLines.push(headers.map(escapeCSVValue).join(","));

    // Data rows
    for (const row of rows) {
      csvLines.push(row.map(escapeCSVValue).join(","));
    }

    return csvLines.join("\n");
  }, [csvExportData]);

  // Export to JSON string
  const exportJSON = useCallback(() => {
    if (!jsonExportData) return null;

    return JSON.stringify(jsonExportData.data, null, 2);
  }, [jsonExportData]);

  // Download CSV
  const downloadCSV = useCallback(
    (fileName = "export.csv") => {
      const csv = exportCSV();
      if (!csv) return;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, fileName);
    },
    [exportCSV]
  );

  // Download JSON
  const downloadJSON = useCallback(
    (fileName = "export.json") => {
      const json = exportJSON();
      if (!json) return;

      const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
      downloadBlob(blob, fileName);
    },
    [exportJSON]
  );

  // Cancel job
  const cancelJob = useCallback(
    async (jobId: Id<"dbImportExportJobs">) => {
      return await cancelJobMutation({ jobId });
    },
    [cancelJobMutation]
  );

  // Parse CSV file
  const parseCSVFile = useCallback(async (file: File): Promise<Record<string, any>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const result = parseCSVString(text);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }, []);

  // Parse JSON file
  const parseJSONFile = useCallback(async (file: File): Promise<Record<string, any>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);

          // Handle both array and object with data property
          if (Array.isArray(data)) {
            resolve(data);
          } else if (data.data && Array.isArray(data.data)) {
            resolve(data.data);
          } else {
            reject(new Error("Invalid JSON format. Expected array or object with data array."));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }, []);

  return {
    // Data
    jobs: jobs ?? [],
    recentJobs: recentJobs ?? [],
    csvExportData,
    jsonExportData,
    isLoading: jobs === undefined,
    isProcessing,

    // Import Actions
    importCSV,
    importJSON,
    parseCSVFile,
    parseJSONFile,

    // Export Actions
    exportCSV,
    exportJSON,
    downloadCSV,
    downloadJSON,

    // Job Actions
    cancelJob,
  };
}

export function useImportExportJob(jobId: Id<"dbImportExportJobs"> | null) {
  const job = useQuery(
    api.features.database.dbImportExport.getJob,
    jobId ? { jobId } : "skip"
  );

  return {
    job,
    isLoading: jobId !== null && job === undefined,
    isComplete: job?.status === "completed",
    isFailed: job?.status === "failed",
    isProcessing: job?.status === "processing",
    progress: job?.totalRows
      ? Math.round(((job.processedRows ?? 0) / job.totalRows) * 100)
      : 0,
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseCSVString(csv: string): Record<string, any>[] {
  const lines = csv.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const result: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, any> = {};

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }

    result.push(row);
  }

  return result;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
