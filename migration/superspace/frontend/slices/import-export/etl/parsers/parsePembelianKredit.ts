/**
 * Parser sheet "PEMBELIAN KREDIT" — pembelian kredit dari supplier.
 *
 * Struktur (index 0-based):
 *   Row 9–10: header
 *   Row 11+: data
 *     Col 0: TANGGAL (sparse, carry-forward)
 *     Col 1: NAMA SUPLIER (sparse)
 *     Col 2: NAMA BAHAN
 *     Col 3: NOMOR FAKTUR
 *     Col 4: JUMLAH (qty/unit)
 *     Col 5: HARGA (unit price)
 *     Col 6: TOTAL
 *     Col 9: TANGGAL JATUH TEMPO
 */

import { getSheetRows, toDateString, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type CreditPurchaseItem = {
  purchaseDate: string;
  supplierName: string;
  itemName: string;
  invoiceNo?: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
  dueDate?: string;
};

const DATA_START = 11; // row 12 (setelah 2 baris header)

export function parsePembelianKredit(wb: XLSX.WorkBook): CreditPurchaseItem[] {
  const sheetName = wb.SheetNames.find((n) =>
    n.toUpperCase().includes("KREDIT") || n.toUpperCase().includes("PEMBELIAN KREDIT")
  );
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: CreditPurchaseItem[] = [];

  let lastDate = "";
  let lastSupplier = "";

  for (let i = DATA_START; i < rows.length; i++) {
    const row = rows[i];

    // Stop di baris total/jumlah
    const label = String(row[1] ?? row[2] ?? "").toUpperCase();
    if (label.includes("TOTAL") || label.includes("JUMLAH")) break;

    // Carry-forward tanggal & supplier
    const d = toDateString(row[0]);
    if (d) lastDate = d;
    const s = String(row[1] ?? "").trim();
    if (s && !s.match(/^[\d.]+$/)) lastSupplier = s;

    const itemName = String(row[2] ?? "").trim();
    if (!itemName || !lastDate) continue;

    const qty         = toNumber(row[4]);
    const unitPrice   = toNumber(row[5]);
    const totalAmount = toNumber(row[6]);
    if (totalAmount <= 0 && qty <= 0) continue;

    const invoiceNo = row[3] ? String(row[3]).trim() : undefined;
    const dueDate   = toDateString(row[9]) ?? undefined;

    result.push({
      purchaseDate: lastDate,
      supplierName: lastSupplier || "Unknown",
      itemName,
      invoiceNo: invoiceNo || undefined,
      qty,
      unitPrice,
      totalAmount: totalAmount || qty * unitPrice,
      dueDate,
    });
  }

  return result;
}
