/**
 * Parser sheet "LEFT OVER" — spoilage / sisa produk harian.
 *
 * Struktur (index 0-based):
 *   Row 6: header (ITEM, PERSEDIAAN AWAL, TANGGAL x7...)
 *   Row 7: tanggal di kolom 2–8
 *   Row 8+: data per item
 *     Col 0: nama item
 *     Col 2–8: qty leftover per hari
 */

import { getSheetRows, toDateString, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type LeftOverItem = {
  businessDate: string;
  itemName: string;
  qty: number;
};

const DATE_ROW      = 7; // row 8 (0-based)
const DATA_START    = 8; // row 9
const COL_ITEM      = 0;
const COL_DAY_START = 2;
const COL_DAY_END   = 8;

export function parseLeftOver(wb: XLSX.WorkBook): LeftOverItem[] {
  const sheetName = wb.SheetNames.find((n) =>
    n.toUpperCase().includes("LEFT") || n.toUpperCase().includes("OVER")
  );
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const dateRow = rows[DATE_ROW] ?? [];

  const dates: (string | null)[] = [];
  for (let c = COL_DAY_START; c <= COL_DAY_END; c++) {
    dates.push(toDateString(dateRow[c]));
  }
  if (!dates.some((d) => d !== null)) return [];

  const result: LeftOverItem[] = [];

  for (let i = DATA_START; i < rows.length; i++) {
    const row = rows[i];
    const itemName = String(row[COL_ITEM] ?? "").trim();
    if (!itemName || itemName.toUpperCase().includes("TOTAL") || itemName.toUpperCase().includes("JUMLAH")) continue;

    for (let d = 0; d < dates.length; d++) {
      const date = dates[d];
      const qty = toNumber(row[COL_DAY_START + d]);
      if (!date || qty <= 0) continue;
      result.push({ businessDate: date, itemName, qty });
    }
  }

  return result;
}
