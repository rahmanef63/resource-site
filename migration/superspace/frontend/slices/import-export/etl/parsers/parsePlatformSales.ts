/**
 * Parser sheet platform sales: LAP. PENJUALAN GRAB FOOD, GO FOOD, SHOPEE FOOD, LAP TAMBAHAN.
 * Auto-detects date row position (varies per sheet) and number of daily columns.
 *
 * channel map:
 *   "GRAB"    → "grabfood"
 *   "GO FOOD" → "gofood"
 *   "SHOPEE"  → "shopeefood"
 *   "TAMBAHAN"→ "tambahan"
 */

import { getSheetRows, toDateString, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";
import type { ProductSaleItem } from "./parsePenjualan";

const PLATFORM_SHEETS: { keyword: string; channel: string }[] = [
  { keyword: "GRAB",     channel: "grabfood"   },
  { keyword: "GO FOOD",  channel: "gofood"     },
  { keyword: "GO",       channel: "gofood"     },
  { keyword: "SHOPEE",   channel: "shopeefood" },
  { keyword: "TAMBAHAN", channel: "tambahan"   },
];

function detectChannel(sheetName: string): string | null {
  const upper = sheetName.toUpperCase().trim();
  // Skip main penjualan sheet and PPN sheet
  if (!upper.includes("PENJUALAN") && !upper.includes("TAMBAHAN")) return null;
  // Exact match exclusions
  const clean = upper.replace(/\s+/g, " ").trim();
  if (clean === "LAP. PENJUALAN" || clean === "LAP PENJUALAN") return null;
  if (upper.includes("PPN")) return null;

  for (const p of PLATFORM_SHEETS) {
    if (upper.includes(p.keyword)) return p.channel;
  }
  return null;
}

/** Auto-detect date row by scanning rows 3-8 for Date objects at col 3+ */
function findDateRow(rows: (string | number | Date | null | boolean)[][]): {
  rowIdx: number;
  dates: (string | null)[];
  colStart: number;
} | null {
  for (let i = 3; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    const dates: (string | null)[] = [];
    let firstDateCol = -1;

    for (let c = 3; c < Math.min(row.length, 20); c++) {
      const d = toDateString(row[c]);
      if (d && !d.startsWith("1899") && !d.startsWith("1900")) {
        if (firstDateCol < 0) firstDateCol = c;
        dates.push(d);
      } else if (firstDateCol >= 0 && dates.length > 0) {
        const cellStr = String(row[c] ?? "").toUpperCase().trim();
        if (cellStr === "TOTAL" || cellStr.includes("TOTAL")) break;
        const d2 = toDateString(row[c]);
        if (d2 && (d2.startsWith("1899") || d2.startsWith("1900"))) continue;
        break;
      }
    }

    if (dates.length >= 3) {
      return { rowIdx: i, dates, colStart: firstDateCol };
    }
  }
  return null;
}

export function parsePlatformSales(wb: XLSX.WorkBook): ProductSaleItem[] {
  const result: ProductSaleItem[] = [];

  for (const sheetName of wb.SheetNames) {
    const channel = detectChannel(sheetName);
    if (!channel) continue;

    const rows = getSheetRows(wb, sheetName);
    const dateInfo = findDateRow(rows);
    if (!dateInfo) continue;

    const { rowIdx: dateRowIdx, dates, colStart } = dateInfo;
    const dataStart = dateRowIdx + 2; // skip day-name row

    // Auto-detect HARGA and FC ITEM columns
    let colUnitPrice = 18;
    let colFcItem = 16;
    for (let i = Math.max(0, dateRowIdx - 1); i <= dateRowIdx + 1; i++) {
      const row = rows[i] ?? [];
      for (let c = 10; c < row.length; c++) {
        const cell = String(row[c] ?? "").toUpperCase().trim();
        if (cell.includes("HARGA") || cell === "( UNIT )" || cell === "(UNIT)") colUnitPrice = c;
        if (cell.includes("FC ITEM") || cell === "FC ITEM") colFcItem = c;
      }
    }

    for (let i = dataStart; i < rows.length; i++) {
      const row = rows[i];
      const productName = String(row[1] ?? row[2] ?? "").trim();
      if (!productName) continue;

      const upper = productName.toUpperCase();
      if (upper.includes("TOTAL") || upper.includes("JUMLAH") || upper.includes("GRAND")) continue;

      const unitPrice = toNumber(row[colUnitPrice]);
      const foodCostItem = toNumber(row[colFcItem]);

      for (let d = 0; d < dates.length; d++) {
        const qty = toNumber(row[colStart + d]);
        const date = dates[d];
        if (!date || qty <= 0) continue;
        result.push({
          businessDate: date,
          productName,
          qty,
          amount: qty * unitPrice,
          unitPrice,
          foodCostItem: foodCostItem > 0 ? foodCostItem : undefined,
          channel,
        });
      }
    }
  }

  return result;
}
