/**
 * Parser sheet "LPKK" (Laporan Pengeluaran Kas Kecil)
 *
 * Struktur sheet (row index mulai 0):
 * - Row 0–7: header/judul
 * - Row 8–9: nama kolom
 * - Row 10+: data (sampai row kosong atau "JUMLAH"/"TOTAL")
 *
 * Kolom (index 0-based):
 *   [0]  TGL          — tanggal (sparse, carry-forward)
 *   [1]  NO NOTA      — nomor nota
 *   [2]  BAHAN AYAM   → cogs
 *   [3]  BAHAN PELENGKAP → cogs
 *   [4]  BAHAN ES     → cogs
 *   [5]  BAHAN MINUMAN → cogs
 *   [6]  BAHAN PEMBUNGKUS → cogs
 *   [7]  MINYAK GORENG → cogs
 *   [8]  GROCERIES/BUMBU → cogs
 *   [9]  BAHAN PEMBERSIH → utility
 *   [10] TRANSPORT    → utility
 *   [11] FOTO COPY/ATK → other
 *   [12] NO ACC       — skip
 *   [13] LAIN-LAIN    → other
 *   [14] KETERANGAN   — deskripsi
 *   [15] JUMLAH       — total amount
 */

import { getSheetRows, toDateString, toNumber, type RawSheet } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type LPKKItem = {
  expenseDate: string;
  categoryType: "cogs" | "utility" | "other";
  categoryLabel: string;
  description: string;
  amount: number;
  referenceNo?: string;
};

type ColDef = {
  index: number;
  label: string;
  type: "cogs" | "utility" | "other";
};

const CATEGORY_COLS: ColDef[] = [
  { index: 2,  label: "Bahan Ayam",         type: "cogs"    },
  { index: 3,  label: "Bahan Pelengkap",    type: "cogs"    },
  { index: 4,  label: "Bahan Es",           type: "cogs"    },
  { index: 5,  label: "Bahan Minuman",      type: "cogs"    },
  { index: 6,  label: "Bahan Pembungkus",   type: "cogs"    },
  { index: 7,  label: "Minyak Goreng",      type: "cogs"    },
  { index: 8,  label: "Groceries/Bumbu",    type: "cogs"    },
  { index: 9,  label: "Bahan Pembersih",    type: "utility" },
  { index: 10, label: "Transport",          type: "utility" },
  { index: 11, label: "Foto Copy/ATK",      type: "other"   },
  // index 12 = NO ACC, skip
  { index: 13, label: "Lain-lain",          type: "other"   },
];

const DATA_START_ROW = 9; // row index 9 = baris pertama data (0-based)

function isStopRow(row: RawSheet[0]): boolean {
  const firstCell = String(row[0] ?? "").toUpperCase();
  const secondCell = String(row[1] ?? "").toUpperCase();
  return (
    firstCell.includes("JUMLAH") ||
    firstCell.includes("TOTAL") ||
    secondCell.includes("JUMLAH") ||
    secondCell.includes("TOTAL")
  );
}

export function parseLPKK(wb: XLSX.WorkBook): LPKKItem[] {
  // Cari sheet dengan nama yang mengandung "LPKK"
  const sheetName = wb.SheetNames.find((n) => n.toUpperCase().includes("LPKK"));
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: LPKKItem[] = [];
  let lastDate: string | null = null;

  for (let i = DATA_START_ROW; i < rows.length; i++) {
    const row = rows[i];

    // Baris total/jumlah = stop
    if (isStopRow(row)) break;

    // Skip baris kosong
    const jumlah = toNumber(row[15]);
    if (jumlah === 0) {
      // Update lastDate jika ada
      const d = toDateString(row[0]);
      if (d) lastDate = d;
      continue;
    }

    // Update tanggal jika ada di kolom pertama
    const d = toDateString(row[0]);
    if (d) lastDate = d;
    if (!lastDate) continue;

    const description = String(row[14] ?? "").trim() || "—";
    const referenceNo = row[1] ? String(row[1]).trim() : undefined;

    // Cek setiap kolom kategori — jika ada nilai, buat item expense terpisah
    let hasSpecificCategory = false;
    for (const col of CATEGORY_COLS) {
      const amt = toNumber(row[col.index]);
      if (amt > 0) {
        result.push({
          expenseDate: lastDate,
          categoryType: col.type,
          categoryLabel: col.label,
          description,
          amount: amt,
          referenceNo,
        });
        hasSpecificCategory = true;
      }
    }

    // Jika tidak ada kolom spesifik tapi JUMLAH ada, masuk sebagai "other"
    if (!hasSpecificCategory && jumlah > 0) {
      result.push({
        expenseDate: lastDate,
        categoryType: "other",
        categoryLabel: "Lain-lain",
        description,
        amount: jumlah,
        referenceNo,
      });
    }
  }

  return result;
}
