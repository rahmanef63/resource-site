/**
 * Parser sheet "SALES CONTROL" — net sales & customer count harian.
 *
 * Struktur (index 0-based):
 *   Row 12+: data per hari
 *     Col 0: TGL (hari dalam bulan, 1–31)
 *     Col 1: NET SALES
 *     Col 2: CU (customer count)
 *     Col 3: DAYA BELI (spending power)
 *     Col 6: TARGET
 *     Col 7: % achievement
 *
 * PENTING: Sheet ini bersifat MTD (Month-to-Date / akumulasi bulanan).
 * File "8-14" selalu memuat baris dari tanggal 1 s/d 14.
 * Kita hanya mengambil baris yang masuk dalam periode file (periodStart–periodEnd)
 * agar tidak duplikat dengan laporan minggu sebelumnya.
 */

import { getSheetRows, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type SalesControlItem = {
  businessDate: string;
  netSales: number;
  customerCount: number;
  spendingPower: number;
  targetSales: number;
  achievementPct: number;
};

const DATA_START = 12; // row 13

export function parseSalesControl(wb: XLSX.WorkBook, periodStart: string, periodEnd?: string): SalesControlItem[] {
  const sheetName = wb.SheetNames.find((n) => n.toUpperCase().includes("SALES CONTROL"));
  if (!sheetName || !periodStart) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: SalesControlItem[] = [];

  // Ambil tahun + bulan dari periodStart ("2026-01-01" → "2026-01")
  const [year, month] = periodStart.split("-");

  for (let i = DATA_START; i < rows.length; i++) {
    const row = rows[i];
    const day = toNumber(row[0]);
    if (day <= 0 || day > 31) continue;

    const netSales = toNumber(row[1]);
    if (netSales <= 0) continue;

    const businessDate = `${year}-${month}-${String(day).padStart(2, "0")}`;

    // Filter MTD: hanya ambil baris dalam rentang periode file ini
    if (businessDate < periodStart) continue;
    if (periodEnd && businessDate > periodEnd) continue;

    const customerCount  = toNumber(row[2]);
    const spendingPower  = toNumber(row[3]);
    const targetSales    = toNumber(row[6]);
    const achievementPct = toNumber(row[7]);

    result.push({
      businessDate,
      netSales,
      customerCount,
      spendingPower,
      targetSales,
      achievementPct,
    });
  }

  return result;
}
