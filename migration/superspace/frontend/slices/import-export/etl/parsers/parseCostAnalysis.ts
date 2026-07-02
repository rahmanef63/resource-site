/**
 * Parser sheet "COST ANALYSIS" — analisis stok per item.
 *
 * Struktur (index 0-based):
 *   Header row: kolom berisi Opening, Purchase, Usage/Pemakaian, Closing
 *   Masing-masing punya sub-kolom Qty dan Value (Rp)
 *   Data rows: satu baris per item bahan
 *   Variance = (opening + purchase - closing) - usage  (selisih)
 */

import { getSheetRows, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type CostAnalysisItem = {
  itemName: string;
  unit?: string;
  openingQty: number;
  openingValue: number;
  purchaseQty: number;
  purchaseValue: number;
  usageQty: number;
  usageValue: number;
  closingQty: number;
  closingValue: number;
  variance: number;
};

export function parseCostAnalysis(wb: XLSX.WorkBook): CostAnalysisItem[] {
  const sheetName = wb.SheetNames.find((n) =>
    n.toUpperCase().includes("COST ANALYSIS")
  );
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: CostAnalysisItem[] = [];

  // Find header row — look for "OPENING" or "AWAL" + "CLOSING" or "AKHIR"
  let headerRowIdx = -1;
  const cols = {
    name: 0,
    unit: -1,
    openingQty: -1, openingVal: -1,
    purchaseQty: -1, purchaseVal: -1,
    usageQty: -1, usageVal: -1,
    closingQty: -1, closingVal: -1,
    variance: -1,
  };

  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    const cells = row.map((c) => String(c ?? "").toUpperCase().trim());

    // Check for main header with section labels
    const hasOpening = cells.some((c) => c.includes("OPENING") || c.includes("AWAL"));
    const hasClosing = cells.some((c) => c.includes("CLOSING") || c.includes("AKHIR"));

    if (hasOpening && hasClosing) {
      headerRowIdx = i;

      // Try to map columns
      // Typical layout: Name | Unit | Open Qty | Open Val | Purch Qty | Purch Val | Usage Qty | Usage Val | Close Qty | Close Val | Variance
      let sectionIdx = 0; // 0=opening, 1=purchase, 2=usage, 3=closing
      for (let c = 0; c < cells.length; c++) {
        const cell = cells[c];
        if (cell.includes("NAMA") || cell.includes("ITEM") || cell.includes("BAHAN")) cols.name = c;
        else if (cell.includes("SATUAN") || cell.includes("UNIT")) cols.unit = c;
        else if (cell.includes("OPENING") || cell.includes("AWAL")) { sectionIdx = 0; cols.openingQty = c; }
        else if (cell.includes("BELI") || cell.includes("PEMBELIAN") || cell.includes("PURCHASE")) { sectionIdx = 1; cols.purchaseQty = c; }
        else if (cell.includes("PAKAI") || cell.includes("USAGE") || cell.includes("PEMAKAIAN")) { sectionIdx = 2; cols.usageQty = c; }
        else if (cell.includes("CLOSING") || cell.includes("AKHIR")) { sectionIdx = 3; cols.closingQty = c; }
        else if (cell.includes("VARIANCE") || cell.includes("SELISIH")) cols.variance = c;
      }
      break;
    }
  }

  // If we found the main header, check for sub-header row (Qty / Value pairs)
  if (headerRowIdx >= 0 && headerRowIdx + 1 < rows.length) {
    const subRow = rows[headerRowIdx + 1];
    if (subRow) {
      const subCells = subRow.map((c) => String(c ?? "").toUpperCase().trim());
      // Re-scan for Qty/Value columns in the sub-header
      let currentSection = "";
      for (let c = 0; c < subCells.length; c++) {
        const parentCell = String(rows[headerRowIdx][c] ?? "").toUpperCase().trim();
        if (parentCell.includes("OPENING") || parentCell.includes("AWAL")) currentSection = "opening";
        else if (parentCell.includes("BELI") || parentCell.includes("PURCHASE")) currentSection = "purchase";
        else if (parentCell.includes("PAKAI") || parentCell.includes("USAGE")) currentSection = "usage";
        else if (parentCell.includes("CLOSING") || parentCell.includes("AKHIR")) currentSection = "closing";

        const sub = subCells[c];
        if (sub.includes("QTY") || sub.includes("JUMLAH") || sub.includes("UNIT")) {
          if (currentSection === "opening") cols.openingQty = c;
          else if (currentSection === "purchase") cols.purchaseQty = c;
          else if (currentSection === "usage") cols.usageQty = c;
          else if (currentSection === "closing") cols.closingQty = c;
        }
        if (sub.includes("RP") || sub.includes("VALUE") || sub.includes("NILAI") || sub.includes("TOTAL")) {
          if (currentSection === "opening") cols.openingVal = c;
          else if (currentSection === "purchase") cols.purchaseVal = c;
          else if (currentSection === "usage") cols.usageVal = c;
          else if (currentSection === "closing") cols.closingVal = c;
        }
      }
      headerRowIdx += 1; // data starts after sub-header
    }
  }

  if (headerRowIdx < 0) {
    // Fallback: try to parse with assumed column positions
    headerRowIdx = findFirstDataRow(rows);
    if (headerRowIdx < 0) return [];
    // Assume: 0=No, 1=Name, 2=Unit, 3=OpenQty, 4=OpenVal, 5=PurchQty, 6=PurchVal, 7=UseQty, 8=UseVal, 9=CloseQty, 10=CloseVal, 11=Variance
    cols.name = 1; cols.unit = 2;
    cols.openingQty = 3; cols.openingVal = 4;
    cols.purchaseQty = 5; cols.purchaseVal = 6;
    cols.usageQty = 7; cols.usageVal = 8;
    cols.closingQty = 9; cols.closingVal = 10;
    cols.variance = 11;
  }

  // If val columns not found, assume they follow qty columns
  if (cols.openingVal < 0 && cols.openingQty >= 0) cols.openingVal = cols.openingQty + 1;
  if (cols.purchaseVal < 0 && cols.purchaseQty >= 0) cols.purchaseVal = cols.purchaseQty + 1;
  if (cols.usageVal < 0 && cols.usageQty >= 0) cols.usageVal = cols.usageQty + 1;
  if (cols.closingVal < 0 && cols.closingQty >= 0) cols.closingVal = cols.closingQty + 1;

  // Parse data rows
  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const label = String(row[cols.name] ?? row[0] ?? "").trim();
    if (!label) continue;

    const upper = label.toUpperCase();
    if (upper.includes("TOTAL") || upper.includes("JUMLAH")) break;

    const openingQty = toNumber(row[cols.openingQty]);
    const openingValue = toNumber(row[cols.openingVal]);
    const purchaseQty = toNumber(row[cols.purchaseQty]);
    const purchaseValue = toNumber(row[cols.purchaseVal]);
    const usageQty = toNumber(row[cols.usageQty]);
    const usageValue = toNumber(row[cols.usageVal]);
    const closingQty = toNumber(row[cols.closingQty]);
    const closingValue = toNumber(row[cols.closingVal]);
    const variance = cols.variance >= 0
      ? toNumber(row[cols.variance])
      : (openingValue + purchaseValue - usageValue - closingValue);

    if (openingQty === 0 && purchaseQty === 0 && usageQty === 0 && closingQty === 0) continue;

    const unit = cols.unit >= 0 ? String(row[cols.unit] ?? "").trim() : undefined;

    result.push({
      itemName: label,
      unit: unit || undefined,
      openingQty, openingValue,
      purchaseQty, purchaseValue,
      usageQty, usageValue,
      closingQty, closingValue,
      variance,
    });
  }

  return result;
}

function findFirstDataRow(rows: (string | number | Date | null | boolean)[][]): number {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const firstNum = toNumber(row[0]);
    if (firstNum === 1 && String(row[1] ?? "").trim().length > 2) {
      return i - 1; // return the row before data as "header"
    }
  }
  return -1;
}
