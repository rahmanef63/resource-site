/**
 * Parser sheet "INSENTIF" — insentif karyawan.
 *
 * Struktur (index 0-based):
 *   Row 6: Header: No(0), Nama(1), Tgl Masuk(2), Jabatan(3), Insentif(4), Tanda Tangan(5)
 *   Row 8+: Data rows
 *   Stop di TOTAL atau baris tanpa nama
 */

import { getSheetRows, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type IncentiveItem = {
  employeeName: string;
  incentiveType: string;
  amount: number;
  notes?: string;
};

export function parseInsentif(wb: XLSX.WorkBook): IncentiveItem[] {
  const sheetName = wb.SheetNames.find((n) =>
    n.toUpperCase().includes("INSENTIF") || n.toUpperCase().includes("INCENTIVE")
  );
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: IncentiveItem[] = [];

  // Find header row — look for "Nama" + ("Insentif" or "Jumlah" or "Amount")
  let headerRowIdx = -1;
  let colName = 1;
  let colType = 3;
  let colAmount = 4;

  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i];
    const cells = row.map((c) => String(c ?? "").toUpperCase().trim());
    const hasName = cells.some((c) => c.includes("NAMA") || c.includes("NAME"));
    const hasAmount = cells.some((c) =>
      c.includes("JUMLAH") || c.includes("AMOUNT") || c.includes("NOMINAL") ||
      c.includes("INSENTIF") || c.includes("INCENTIVE")
    );

    if (hasName && hasAmount) {
      headerRowIdx = i;
      for (let c = 0; c < cells.length; c++) {
        const cell = cells[c];
        if (cell.includes("NAMA") || cell.includes("NAME")) colName = c;
        else if (cell.includes("JABATAN") || cell.includes("POSISI") || cell.includes("TYPE")) colType = c;
        else if (cell.includes("INSENTIF") || cell.includes("INCENTIVE") ||
                 cell.includes("JUMLAH") || cell.includes("AMOUNT") || cell.includes("NOMINAL")) colAmount = c;
      }
      break;
    }
  }

  // Start scanning from header + 2 (skip possible sub-header row)
  const startRow = headerRowIdx >= 0 ? headerRowIdx + 2 : 8;

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row[colName] ?? "").trim();
    if (!name) continue;

    const upper = name.toUpperCase();
    if (upper.includes("TOTAL") || upper.includes("JUMLAH")) break;

    const amount = toNumber(row[colAmount]);
    if (amount <= 0) continue;

    const jabatan = String(row[colType] ?? "").trim();

    result.push({
      employeeName: name,
      incentiveType: jabatan || "UMUM",
      amount,
    });
  }

  return result;
}
