/**
 * Parser sheet "WEEKLY FC" (Weekly Food Cost / Valuasi Inventory)
 *
 * Struktur sheet:
 * - Header rows (0–4)
 * - Data: nama item, QTY, PRICE, TOTAL
 * - Dikelompokkan per kategori (BAHAN AYAM, ES, MINUMAN, dll)
 *
 * Strategi:
 * - Scan baris dari atas
 * - Deteksi baris kategori (berisi teks kategori tanpa angka)
 * - Baris data: kolom dengan nama item + qty + harga + total
 */

import { getSheetRows, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type InventoryValuationItem = {
  category: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
};

const CATEGORY_KEYWORDS = [
  "BAHAN AYAM",
  "ES",
  "MINUMAN",
  "BAHAN PELENGKAP",
  "MINYAK",
  "BUMBU",
  "PEMBUNGKUS",
  "PEMBERSIH",
  "LAIN-LAIN",
  "GROCERIES",
];

function detectCategory(row: (string | number | Date | null | boolean)[]): string | null {
  const text = String(row[0] ?? row[1] ?? "").trim().toUpperCase();
  for (const kw of CATEGORY_KEYWORDS) {
    if (text.includes(kw)) return text;
  }
  return null;
}

function isDataRow(row: (string | number | Date | null | boolean)[]): boolean {
  // Baris data: ada nama item di kolom 0/1 dan minimal satu angka
  const name = String(row[0] ?? row[1] ?? "").trim();
  if (!name || name.toUpperCase().includes("TOTAL") || name.toUpperCase().includes("JUMLAH")) return false;

  const hasNumber = row.some((v) => typeof v === "number" && v > 0) ||
    row.some((v) => typeof v === "string" && toNumber(v) > 0);
  return hasNumber;
}

export function parseWeeklyFC(wb: XLSX.WorkBook): InventoryValuationItem[] {
  const sheetName = wb.SheetNames.find((n) =>
    n.toUpperCase().includes("WEEKLY") || n.toUpperCase().includes("FC")
  );
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: InventoryValuationItem[] = [];

  let currentCategory = "Umum";

  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];

    // Skip fully empty rows
    const hasContent = row.some((v) => v !== null && v !== "" && v !== undefined);
    if (!hasContent) continue;

    // Cek apakah ini baris kategori
    const cat = detectCategory(row);
    if (cat) {
      currentCategory = cat;
      continue;
    }

    // Cek apakah ini baris data
    if (!isDataRow(row)) continue;

    // Nama item: kolom 0 atau 1
    const itemName = String(row[0] ?? row[1] ?? "").trim();
    if (!itemName) continue;

    // Cari kolom QTY, UNIT, HARGA, TOTAL
    // Biasanya: col 1=item, col 2=qty, col 3=unit, col 4=harga, col 5=total
    // atau      col 0=item, col 1=qty, col 2=unit, col 3=harga, col 4=total
    // Kita cari angka secara posisi relatif
    const nums: { col: number; val: number }[] = [];
    for (let c = 0; c < row.length; c++) {
      const v = toNumber(row[c]);
      if (v > 0) nums.push({ col: c, val: v });
    }

    if (nums.length < 2) continue;

    // Unit: cari string pendek setelah item name
    let unit = "unit";
    for (let c = 1; c < Math.min(row.length, 5); c++) {
      const v = String(row[c] ?? "").trim();
      if (v && v.length <= 6 && isNaN(Number(v)) && !/^\d/.test(v)) {
        unit = v;
        break;
      }
    }

    // Total value = angka terbesar (biasanya di kolom terakhir)
    const totalValue = Math.max(...nums.map((n) => n.val));

    // Qty = angka pertama yang bukan total (biasanya < 1000)
    const qty = nums.find((n) => n.val < 1000 && n.val !== totalValue)?.val ??
      nums[0].val;

    // Unit price = totalValue / qty (jika bisa dihitung)
    const unitPrice = qty > 0 ? totalValue / qty : 0;

    result.push({
      category: currentCategory,
      itemName,
      qty,
      unit,
      unitPrice: Math.round(unitPrice),
      totalValue,
    });
  }

  return result;
}
