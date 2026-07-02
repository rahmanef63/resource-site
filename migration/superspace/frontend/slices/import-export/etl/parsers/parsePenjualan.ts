/**
 * Parser sheet "LAP. PENJUALAN" (Laporan Penjualan Harian per Produk)
 *
 * Struktur bervariasi — auto-detect:
 *   Date row: scan rows 3–8 for Date objects starting at col 3
 *   Data start: 2 rows after date row
 *   Daily columns: col 3 to last valid date column
 *   FC ITEM: col 16, HARGA: col 18 (but also auto-detect from header)
 */

import { getSheetRows, toDateString, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type ProductSaleItem = {
  businessDate: string;
  productName: string;
  qty: number;
  amount: number;
  unitPrice: number;
  foodCostItem?: number;
  channel?: string;
};

/** Auto-detect: find the row containing Date objects at cols 3+ */
function findDateRow(rows: (string | number | Date | null | boolean)[][]): {
  rowIdx: number;
  dates: (string | null)[];
  colStart: number;
  colEnd: number;
} | null {
  for (let i = 3; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    const dates: (string | null)[] = [];
    let firstDateCol = -1;
    let lastDateCol = -1;

    for (let c = 3; c < Math.min(row.length, 20); c++) {
      const d = toDateString(row[c]);
      if (d && !d.startsWith("1899") && !d.startsWith("1900")) {
        if (firstDateCol < 0) firstDateCol = c;
        lastDateCol = c;
        dates.push(d);
      } else if (firstDateCol >= 0 && dates.length > 0) {
        // Check if the next non-date cell is "TOTAL" — end of dates
        const cellStr = String(row[c] ?? "").toUpperCase().trim();
        if (cellStr === "TOTAL" || cellStr.includes("TOTAL")) break;
        // Skip 1899 dates (empty columns in the template)
        const d2 = toDateString(row[c]);
        if (d2 && (d2.startsWith("1899") || d2.startsWith("1900"))) continue;
        break;
      }
    }

    if (dates.length >= 3) {
      return { rowIdx: i, dates, colStart: firstDateCol, colEnd: lastDateCol };
    }
  }
  return null;
}

/** Auto-detect FC ITEM and HARGA columns from header rows */
function findValueCols(rows: (string | number | Date | null | boolean)[][], dateRowIdx: number): {
  colUnitPrice: number;
  colFcItem: number;
} {
  // Default positions
  let colUnitPrice = 18;
  let colFcItem = 16;

  // Scan header area (date row and row above/below)
  for (let i = Math.max(0, dateRowIdx - 1); i <= dateRowIdx + 1; i++) {
    const row = rows[i] ?? [];
    for (let c = 10; c < row.length; c++) {
      const cell = String(row[c] ?? "").toUpperCase().trim();
      if (cell.includes("HARGA") || cell === "( UNIT )" || cell === "(UNIT)") {
        colUnitPrice = c;
      }
      if (cell.includes("FC ITEM") || cell === "FC ITEM") {
        colFcItem = c;
      }
    }
  }

  return { colUnitPrice, colFcItem };
}

export function parsePenjualan(wb: XLSX.WorkBook): ProductSaleItem[] {
  const sheetName = wb.SheetNames.find((n) => {
    const up = n.toUpperCase().trim();
    return up.includes("PENJUALAN") &&
      !up.includes("GRAB") && !up.includes("GO") &&
      !up.includes("SHOPEE") && !up.includes("TAMBAHAN") &&
      !up.includes("PPN");
  });
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const dateInfo = findDateRow(rows);
  if (!dateInfo) return [];

  const { rowIdx: dateRowIdx, dates, colStart, colEnd } = dateInfo;
  const { colUnitPrice, colFcItem } = findValueCols(rows, dateRowIdx);
  const dataStart = dateRowIdx + 2; // skip day-name row, then first data row
  const result: ProductSaleItem[] = [];

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    const productName = String(row[1] ?? row[2] ?? "").trim();
    if (!productName) continue;

    const upper = productName.toUpperCase();
    if (upper.includes("TOTAL") || upper.includes("JUMLAH") || upper.includes("GRAND")) continue;

    const unitPrice = toNumber(row[colUnitPrice]);
    const foodCostItem = toNumber(row[colFcItem]);

    // Generate record per day
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
      });
    }
  }

  return result;
}
