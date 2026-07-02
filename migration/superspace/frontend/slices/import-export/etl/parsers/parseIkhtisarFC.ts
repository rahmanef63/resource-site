/**
 * Parser sheet "IKHTISAR FOOD COST" — ringkasan food cost.
 *
 * Struktur (index 0-based):
 *   Row 6: Header — col 1 "FOOD & BEVERAGE", col 3 "PAPER"
 *   Vertical label-value layout:
 *     Row 8:  PERSEDIAAN AWAL       → col 1 (F&B), col 3 (PAPER)
 *     Row 15: TOTAL TRANSFER IN     → col 1, col 3
 *     Row 20: TOTAL PEMBELIAN       → col 1, col 3
 *     Row 31: TOTAL TRANSFER OUT    → col 1, col 3
 *     Row 33: PERSEDIAAN AKHIR      → col 1, col 3
 *     Row 35: JUMLAH YANG DIPAKAI   → col 1, col 3
 *     Row 36: (%)                   → col 1, col 3
 *     Row 45: PENJUALAN BERSIH      → col 1
 *
 * Output: one record per category (FOOD & BEVERAGE, PAPER).
 */

import { getSheetRows, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type FoodCostSummaryItem = {
  category: string;
  openingValue: number;
  purchaseValue: number;
  transferOutValue: number;
  transferInValue: number;
  closingValue: number;
  usageValue: number;
  salesRevenue?: number;
  foodCostPct?: number;
};

export function parseIkhtisarFC(wb: XLSX.WorkBook): FoodCostSummaryItem[] {
  const sheetName = wb.SheetNames.find((n) => {
    const up = n.toUpperCase();
    return up.includes("IKHTISAR") && up.includes("FOOD COST");
  });
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);

  // Detect category columns from header row (usually row 6)
  // Look for row with "FOOD" or "BEVERAGE" label
  const categories: { name: string; col: number }[] = [];

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] ?? "").toUpperCase().trim();
      if (cell.includes("FOOD") && cell.includes("BEVERAGE")) {
        categories.push({ name: "FOOD & BEVERAGE", col: c });
      } else if (cell === "PAPER" || cell.includes("PAPER")) {
        categories.push({ name: "PAPER", col: c });
      }
    }
    if (categories.length > 0) break;
  }

  // Fallback: assume col 1 = F&B, col 3 = PAPER
  if (categories.length === 0) {
    categories.push({ name: "FOOD & BEVERAGE", col: 1 });
    categories.push({ name: "PAPER", col: 3 });
  }

  // Scan rows for labeled values
  const data: Record<string, Record<string, number>> = {};
  for (const cat of categories) {
    data[cat.name] = {
      opening: 0, purchase: 0, transferIn: 0, transferOut: 0,
      closing: 0, usage: 0, fcPct: 0, sales: 0,
    };
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const label = String(row[0] ?? "").toUpperCase().trim();
    if (!label) continue;

    let field: string | null = null;

    if (label.includes("PERSEDIAAN AWAL"))                           field = "opening";
    else if (label.includes("TOTAL TRANSFER IN") || label === "TOTAL TRANSFER IN") field = "transferIn";
    else if (label.includes("TOTAL PEMBELIAN"))                      field = "purchase";
    else if (label.includes("TOTAL TRANSFER OUT") || label === "TOTAL TRANSFER OUT") field = "transferOut";
    else if (label.includes("PERSEDIAAN AKHIR"))                     field = "closing";
    else if (label.includes("JUMLAH YANG DIPAKAI") || label.includes("JUMLAH YG DIPAKAI")) field = "usage";
    else if (label.includes("(%)") || label === "(%)")               field = "fcPct";
    else if (label.includes("PENJUALAN BERSIH"))                     field = "sales";

    if (!field) continue;

    for (const cat of categories) {
      const val = toNumber(row[cat.col]);
      if (val !== 0) {
        data[cat.name][field] = val;
      }
    }
  }

  const result: FoodCostSummaryItem[] = [];

  for (const cat of categories) {
    const d = data[cat.name];
    // Skip if all zeros
    if (d.opening === 0 && d.purchase === 0 && d.closing === 0 && d.usage === 0) continue;

    // Calculate usage if not present
    const usage = d.usage !== 0
      ? d.usage
      : d.opening + d.purchase + d.transferIn - d.transferOut - d.closing;

    result.push({
      category: cat.name,
      openingValue: d.opening,
      purchaseValue: d.purchase,
      transferInValue: d.transferIn,
      transferOutValue: d.transferOut,
      closingValue: d.closing,
      usageValue: usage,
      salesRevenue: d.sales > 0 ? d.sales : undefined,
      foodCostPct: d.fcPct > 0 ? d.fcPct : undefined,
    });
  }

  return result;
}
