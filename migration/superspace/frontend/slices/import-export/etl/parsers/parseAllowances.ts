/**
 * Parser file "FORM PENGAJUAN TUNJANGAN KHUSUS"
 * (Luar Kota, Kost, dan Subsidi Transport)
 *
 * Struktur sheet "1." (row index 0-based):
 *   Row 1: title "PENGAJUAN TUNJANGAN KHUSUS (LUAR KOTA, KOST DAN SUBSIDI TRANSPORT)"
 *   Row 2: "TAHUN 2025"
 *   Row 3: STORE, AREA, REGION, TANGGAL PENGAJUAN
 *   Row 5-7: headers (merged cells):
 *     NO | NAMA LENGKAP | TGL MASUK | JABATAN |
 *     STORE AWAL (TRAINEE) | STORE PENEMPATAN |
 *     ROTASI ANTAR | JARAK | WAKTU TEMPUH |
 *     LUAR KOTA | SUBSIDI TRANSPORT | BUDGET KOS | REIMBURSE | KETERANGAN KOS
 *   Row 8+: data rows (numbered 1-15, most empty)
 *
 * Columns (0-based):
 *   [0]  NO
 *   [1]  NAMA LENGKAP
 *   [2]  TGL MASUK
 *   [3]  JABATAN
 *   [4]  STORE AWAL MASUK (TRAINEE)
 *   [5]  STORE PENEMPATAN
 *   [6]  ROTASI ANTAR
 *   [7]  JARAK
 *   [8]  WAKTU TEMPUH
 *   [9]  LUAR KOTA (tunjangan amount)
 *   [10] SUBSIDI TRANSPORT (amount)
 *   [11] BUDGET KOS/KONTRAKAN (amount)
 *   [12] REIMBURSE / MASUK DAFTAR GAJI
 *   [13] KETERANGAN KOS/KONTRAKAN
 */

import { getSheetRows, toDateString, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type AllowanceItem = {
  employeeName: string;
  joinDate?: string;
  position?: string;
  storeOrigin?: string;
  storePlacement?: string;
  rotationType?: string;
  distance?: string;
  travelTime?: string;
  luarKotaAmount: number;
  subsidiTransportAmount: number;
  budgetKosAmount: number;
  reimburseNote?: string;
  kosNote?: string;
};

const DATA_START_ROW = 8;
const DATA_END_ROW = 23; // rows 8-22 (numbered 1-15)

export function parseAllowances(wb: XLSX.WorkBook): AllowanceItem[] {
  // Find the first sheet
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: AllowanceItem[] = [];

  for (let i = DATA_START_ROW; i < Math.min(rows.length, DATA_END_ROW); i++) {
    const row = rows[i];

    const employeeName = String(row[1] ?? "").trim();
    if (!employeeName) continue;

    // Skip if it's a header or total row
    const upper = employeeName.toUpperCase();
    if (upper.includes("NAMA") || upper.includes("TOTAL")) continue;

    result.push({
      employeeName,
      joinDate: toDateString(row[2]) ?? (row[2] ? String(row[2]).trim() : undefined),
      position: row[3] ? String(row[3]).trim() : undefined,
      storeOrigin: row[4] ? String(row[4]).trim() : undefined,
      storePlacement: row[5] ? String(row[5]).trim() : undefined,
      rotationType: row[6] ? String(row[6]).trim() : undefined,
      distance: row[7] ? String(row[7]).trim() : undefined,
      travelTime: row[8] ? String(row[8]).trim() : undefined,
      luarKotaAmount: toNumber(row[9]),
      subsidiTransportAmount: toNumber(row[10]),
      budgetKosAmount: toNumber(row[11]),
      reimburseNote: row[12] ? String(row[12]).trim() : undefined,
      kosNote: row[13] ? String(row[13]).trim() : undefined,
    });
  }

  return result;
}

/**
 * Extract metadata from the header rows.
 */
export function extractAllowanceMetadata(wb: XLSX.WorkBook): {
  year: string;
  store: string;
  area: string;
  region: string;
  submissionDate: string;
} {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { year: "", store: "", area: "", region: "", submissionDate: "" };
  const rows = getSheetRows(wb, sheetName);

  // Row 2: "TAHUN 2025"
  const yearText = String(rows[2]?.[0] ?? "").trim();
  const yearMatch = yearText.match(/\d{4}/);

  // Row 3: STORE : RC SAMATA | AREA : SULSEL | REGION : 11 | TANGGAL PENGAJUAN : ...
  const store = String(rows[3]?.[1] ?? "").replace(/^STORE\s*:\s*/i, "").trim();
  const area = String(rows[3]?.[3] ?? "").replace(/^AREA\s*:\s*/i, "").trim();
  const region = String(rows[3]?.[5] ?? "").replace(/^REGION\s*:\s*/i, "").trim();
  const submissionDate = String(rows[3]?.[9] ?? "").replace(/^:\s*/, "").trim();

  return {
    year: yearMatch?.[0] ?? "",
    store,
    area,
    region,
    submissionDate,
  };
}
