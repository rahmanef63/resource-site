/**
 * Parser file "PERGANTIAN PRODUK" (Pergantian/Penggantian Bahan)
 *
 * Struktur sheet "Sheet1" (row index 0-based):
 *   Row 2: title "PERGANTIAN PRODUK"
 *   Row 4: "RC SAMATA"
 *   Row 6: PERIODE — e.g. "22-31 JANUARI 2026"
 *   Row 9: headers — NAMA BAHAN | EXPIRED | UNIT | HARGA | JMLH | PPN (11%) | TOTAL HARGA
 *   Row 10+: data rows (until empty NAMA BAHAN or total row)
 *
 * Kolom (0-based):
 *   [0] NAMA BAHAN
 *   [1] EXPIRED (date or empty)
 *   [2] UNIT (string, e.g. "KG", "PCS")
 *   [3] HARGA — unit price
 *   [4] JMLH — quantity
 *   [5] PPN (11%) — tax amount (optional)
 *   [6] TOTAL HARGA — total price
 */

import { getSheetRows, toDateString, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type ProductChangeItem = {
  itemName: string;
  expiredDate?: string;
  unit?: string;
  unitPrice: number;
  qty: number;
  ppn: number;
  totalPrice: number;
};

const HEADER_ROW = 9;
const DATA_START_ROW = 10;

export function parseProductChanges(wb: XLSX.WorkBook): ProductChangeItem[] {
  // Use first sheet (usually "Sheet1")
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: ProductChangeItem[] = [];

  for (let i = DATA_START_ROW; i < rows.length; i++) {
    const row = rows[i];

    const itemName = String(row[0] ?? "").trim();
    if (!itemName) continue;

    // Stop at total/summary rows
    const upper = itemName.toUpperCase();
    if (upper.includes("TOTAL") || upper.includes("JUMLAH")) break;

    const totalPrice = toNumber(row[6]);
    // Skip rows where total is 0 (empty template rows)
    if (totalPrice === 0) continue;

    result.push({
      itemName,
      expiredDate: toDateString(row[1]) ?? undefined,
      unit: row[2] ? String(row[2]).trim() : undefined,
      unitPrice: toNumber(row[3]),
      qty: toNumber(row[4]),
      ppn: toNumber(row[5]),
      totalPrice,
    });
  }

  return result;
}

/**
 * Extract period label from the file (row 6, col 1).
 * e.g. "22-31 JANUARI 2026"
 */
export function extractPeriodLabel(wb: XLSX.WorkBook): string {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return "";
  const rows = getSheetRows(wb, sheetName);
  // Row 6, col 1 contains period text
  return String(rows[6]?.[1] ?? "").trim();
}
