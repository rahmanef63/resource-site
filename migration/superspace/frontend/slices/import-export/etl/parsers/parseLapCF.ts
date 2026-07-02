/**
 * Parser sheet "LAP. CF" — Laporan Cash Flow harian.
 *
 * Struktur bervariasi antar file — kolom bisa bergeser. Deteksi dinamis:
 *   "SALDO AWAL PER"   → date nearby, value = largest number in row
 *   "Sales tanggal,"    → date nearby, amount = number after date
 *   "Belanja tanggal,"  → date nearby, amount = number after date
 *   "SALDO AKHIR PER"  → value = largest number in row
 */

import { getSheetRows, toNumber, toDateString } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type DailyCashFlowItem = {
  businessDate: string;
  openingBalance: number;
  salesInflow: number;
  otherInflow: number;
  expenseOutflow: number;
  otherOutflow: number;
  closingBalance: number;
};

/** Find the first valid date (non-1899/1900) in a row */
function findDate(row: (string | number | Date | null | boolean)[]): string | null {
  for (const cell of row) {
    const d = toDateString(cell);
    if (d && !d.startsWith("1899") && !d.startsWith("1900")) return d;
  }
  return null;
}

/** Find the largest number in a row (used for totals like SALDO AWAL/AKHIR) */
function findLargestNumber(row: (string | number | Date | null | boolean)[]): number {
  let max = 0;
  for (const cell of row) {
    const v = toNumber(cell);
    if (v > max) max = v;
  }
  return max;
}

/** Find a meaningful amount in a row — the last numeric value > 0, excluding date serials */
function findAmount(row: (string | number | Date | null | boolean)[]): number {
  // Look for "Rp" marker and take the value after it
  for (let c = 0; c < row.length; c++) {
    const cell = String(row[c] ?? "").toUpperCase().trim();
    if (cell === "RP" || cell === "RP.") {
      const val = toNumber(row[c + 1]);
      if (val > 0) return val;
    }
  }
  // Fallback: return the largest positive number
  return findLargestNumber(row);
}

/** Check if any cell in the row contains a substring (case-insensitive) */
function rowContains(row: (string | number | Date | null | boolean)[], text: string): boolean {
  return row.some((cell) => String(cell ?? "").toUpperCase().includes(text.toUpperCase()));
}

export function parseLapCF(wb: XLSX.WorkBook): DailyCashFlowItem[] {
  const sheetName = wb.SheetNames.find((n) => {
    const up = n.toUpperCase().replace(/\s+/g, " ").trim();
    return up.includes("LAP. CF") || up.includes("LAP CF") ||
           up.includes("CASH FLOW") || up.includes("LAPORAN CF");
  });
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);

  const salesByDate: Record<string, number> = {};
  const expenseByDate: Record<string, number> = {};
  let openingBalance = 0;
  let closingBalance = 0;
  let totalOtherInflow = 0;
  const dateOrder: string[] = [];

  let inOtherIncome = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c == null)) continue;

    // Skip notes/comments (e.g., "NB. UNTUK SALDO AKHIR...")
    const firstCell = String(row[0] ?? row[1] ?? row[2] ?? "").toUpperCase().trim();
    if (firstCell.startsWith("NB") || firstCell.startsWith("CATATAN") || firstCell.startsWith("NOTE")) continue;

    // Check all cells for labels
    const isSaldoAwal = rowContains(row, "SALDO AWAL");
    const isSaldoAkhir = rowContains(row, "SALDO AKHIR");
    const hasSalesTanggal = rowContains(row, "SALES TANGGAL");
    const hasBelanjaTanggal = rowContains(row, "BELANJA TANGGAL");
    const isPenerimaan = rowContains(row, "PENERIMAAN") && !rowContains(row, "TOTAL");
    const isPengeluaran = rowContains(row, "PENGELUARAN") && !rowContains(row, "TOTAL");
    const isTotalPenerimaan = rowContains(row, "TOTAL") && rowContains(row, "PENERIMAAN");

    if (isSaldoAwal) {
      openingBalance = findLargestNumber(row);
      continue;
    }

    if (isSaldoAkhir) {
      closingBalance = findLargestNumber(row);
      continue;
    }

    if (hasSalesTanggal) {
      const d = findDate(row);
      if (!d) continue;
      const amount = findAmount(row);
      if (amount <= 0) continue;
      salesByDate[d] = (salesByDate[d] ?? 0) + amount;
      if (!dateOrder.includes(d)) dateOrder.push(d);
      inOtherIncome = false;
      continue;
    }

    if (hasBelanjaTanggal) {
      const d = findDate(row);
      if (!d) continue;
      const amount = findAmount(row);
      if (amount <= 0) continue;
      expenseByDate[d] = (expenseByDate[d] ?? 0) + amount;
      if (!dateOrder.includes(d)) dateOrder.push(d);
      inOtherIncome = false;
      continue;
    }

    // Track "Penerimaan lain-lain" section
    if (isPenerimaan && rowContains(row, "LAIN")) {
      inOtherIncome = true;
      continue;
    }
    if (isPengeluaran || isTotalPenerimaan) {
      inOtherIncome = false;
      continue;
    }

    // Collect other income items
    if (inOtherIncome) {
      const amount = findAmount(row);
      if (amount > 0) {
        totalOtherInflow += amount;
      }
    }
  }

  if (dateOrder.length === 0) return [];

  // Build daily records
  const result: DailyCashFlowItem[] = [];
  const numDays = dateOrder.length;
  let runningBalance = openingBalance;

  for (let i = 0; i < numDays; i++) {
    const d = dateOrder[i];
    const sales = salesByDate[d] ?? 0;
    const expense = expenseByDate[d] ?? 0;
    const otherInflow = i === 0 ? totalOtherInflow : 0;

    const dayOpening = runningBalance;
    const dayClosing = dayOpening + sales + otherInflow - expense;

    result.push({
      businessDate: d,
      openingBalance: dayOpening,
      salesInflow: sales,
      otherInflow,
      expenseOutflow: expense,
      otherOutflow: 0,
      closingBalance: i === numDays - 1 ? closingBalance : dayClosing,
    });

    runningBalance = dayClosing;
  }

  return result;
}
