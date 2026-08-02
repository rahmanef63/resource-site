// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import Papa from "papaparse";
import type { ZodType } from "zod";

export async function parseCsvFile<T>(
  file: File,
  schema?: ZodType<T>,
): Promise<{ rows: T[]; errors: string[] }> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const rows: T[] = [];
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        for (const r of res.data) {
          if (!schema) { rows.push(r); continue; }
          const parsed = schema.safeParse(r);
          if (parsed.success) rows.push(parsed.data);
          else errors.push(JSON.stringify(parsed.error.flatten()));
        }
        resolve({ rows, errors });
      },
    });
  });
}

export function downloadAsCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
): void {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
