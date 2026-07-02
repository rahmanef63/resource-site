/**
 * Parser sheet "LAPORAN KAS PERIODE" — ringkasan kas & penjualan harian.
 *
 * Struktur (index 0-based):
 *   Row 5: tanggal di kolom 2–8
 *   Row 7: Penjualan Kotor
 *   Row 8: Komisi Gofood
 *   Row 9: Komisi Grabfood
 *   Row 10: Komisi Shopee Food
 *   Row 11: Koreksi
 *   Row 13: Discount
 *   Row lain: cari "BERSIH" atau "NET" untuk net sales
 */

import { getSheetRows, toDateString, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type DailyCashSummaryItem = {
  businessDate: string;
  grossSales: number;
  komisiGofood: number;
  komisiGrabfood: number;
  komisiShopeefood: number;
  koreksi: number;
  discount: number;
  netSales: number;
};

const DATE_ROW     = 4;  // row 4 (0-based): tanggal di kolom 1–7
const DATA_COL_START = 1;
const DATA_COL_END   = 7;

export function parseLaporanKasPeriode(wb: XLSX.WorkBook): DailyCashSummaryItem[] {
  const sheetName = wb.SheetNames.find((n) =>
    n.toUpperCase().includes("KAS") && n.toUpperCase().includes("PERIODE")
  );
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);

  // Ambil tanggal dari row 5
  const dateRow = rows[DATE_ROW] ?? [];
  const dates: (string | null)[] = [];
  for (let c = DATA_COL_START; c <= DATA_COL_END; c++) {
    dates.push(toDateString(dateRow[c]));
  }
  if (!dates.some((d) => d !== null)) return [];

  // Map label → row values (7 nilai harian)
  const rowMap: Record<string, number[]> = {};

  for (let i = 6; i < rows.length; i++) {
    const row = rows[i];
    const label = String(row[0] ?? "").trim().toUpperCase();
    if (!label) continue;

    const vals: number[] = [];
    for (let c = DATA_COL_START; c <= DATA_COL_END; c++) {
      vals.push(toNumber(row[c]));
    }

    if (label.includes("KOTOR"))                          rowMap["gross"]      = vals;
    else if (label.includes("KOMISI") && (label.includes("GOFOOD") || label.includes("GO FOOD"))) rowMap["gofood"]    = vals;
    else if (label.includes("KOMISI") && label.includes("GRAB"))    rowMap["grabfood"]   = vals;
    else if (label.includes("KOMISI") && label.includes("SHOPEE"))  rowMap["shopeefood"] = vals;
    else if (label.includes("KOREKSI"))                   rowMap["koreksi"]    = vals;
    else if (label.includes("DISCOUNT") || label.includes("DISKON")) rowMap["discount"]  = vals;
    else if (label.includes("BERSIH") || label.includes("NET SALES") || label.includes("NETT")) rowMap["net"] = vals;
  }

  const result: DailyCashSummaryItem[] = [];

  for (let d = 0; d < dates.length; d++) {
    const date = dates[d];
    if (!date) continue;

    const gross = rowMap["gross"]?.[d] ?? 0;
    if (gross <= 0) continue;

    const komisiGofood      = rowMap["gofood"]?.[d]     ?? 0;
    const komisiGrabfood    = rowMap["grabfood"]?.[d]   ?? 0;
    const komisiShopeefood  = rowMap["shopeefood"]?.[d] ?? 0;
    const koreksi           = rowMap["koreksi"]?.[d]    ?? 0;
    const discount          = rowMap["discount"]?.[d]   ?? 0;
    // Net dari sheet; kalau tidak ada, hitung manual
    const netSales = rowMap["net"]?.[d] ??
      (gross - komisiGofood - komisiGrabfood - komisiShopeefood - koreksi - discount);

    result.push({
      businessDate: date,
      grossSales: gross,
      komisiGofood,
      komisiGrabfood,
      komisiShopeefood,
      koreksi,
      discount,
      netSales: Math.max(0, netSales),
    });
  }

  return result;
}
