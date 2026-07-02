/**
 * Parser sheet "VENDOR" (Pembelian & Stok Bahan Mingguan)
 *
 * Sheet VENDOR terdiri dari 3 tabel (lembar):
 *
 *   LEMBAR 1 (rows ~8-81) — Bahan baku utama:
 *     Row 8:  Section "AYAM" (header di col3, atau item starts)
 *     Row 25: Section "PELENGKAP" — item# resets to 1, vertical P-E-L-E-N-G-K-A-P (rows 26-34)
 *     Row 43: "BAHAN ROTI" (sub-label in col3 with item#19) — masih PELENGKAP
 *     Row 45: Section "BAHAN ES" (label di col1, item#1)
 *     Row 50: Section "MINUMAN" — item# resets to 1, vertical M-I-N-U-M-A-N (rows 58-64)
 *     Row 81: "TOTAL LEMBAR 1"
 *
 *   LEMBAR 2 (rows ~93-174):
 *     Row 93:  Section "PEMBUNGKUS" — item#1, vertical P-E-M-B-U-N-G-K-U-S (rows 101-110)
 *     Row 131: "TOTAL"
 *     Row 132: Section "MINYAK" (col1 label, item#1-2)
 *     Row 134: Section "BUMBU" — item# resets to 1, vertical G-R-O-C-E-R-I-E-S (rows 145-153)
 *             BUT BUMBU and GROCERIES are combined — section is actually named "BUMBU & GROCERIES"
 *     Row 174: "TOTAL LEMBAR KE 2"
 *
 *   LEMBAR 3 (rows ~190-248):
 *     Row 190: Section "LAIN-LAIN" (tanpa label, misc items)
 *     Row 201: Section "OTHERS" (col1 label) — operasional/administratif
 *
 * Mekanisme:
 *   - Vertical letters (P-E-L-E-N-G-K-A-P) accompany item rows
 *   - When vertical letters resolve to a section, retroactively update items from the last item# reset
 *   - "VENDOR REPORT" in col1 marks table boundaries
 *   - Administrative rows at bottom are filtered out
 */

import { getSheetRows, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type VendorPurchaseItem = {
  commodityName: string;
  section: string;
  openingQty: number;
  openingValue: number;
  purchaseQty: number;
  purchaseValue: number;
  usageQty: number;
  usageValue: number;
  closingQty: number;
  closingValue: number;
  prevWeekValue: number;
};

/**
 * Known section keywords. The key is what we look for; the value is the normalized name.
 */
const SECTION_KEYWORDS: [string, string][] = [
  ["AYAM", "AYAM"],
  ["PELENGKAP", "PELENGKAP"],
  ["BAHAN ES", "BAHAN ES"],
  ["MINUMAN", "MINUMAN"],
  ["PEMBUNGKUS", "PEMBUNGKUS"],
  ["MINYAK", "MINYAK"],
  ["BUMBU", "BUMBU"],
  ["GROCERIES", "GROCERIES"],
  ["LAIN-LAIN", "LAIN-LAIN"],
  ["OTHERS", "OTHERS"],
];

function matchSection(text: string): string | null {
  const upper = text.toUpperCase().trim();
  for (const [keyword, name] of SECTION_KEYWORDS) {
    if (upper.includes(keyword)) return name;
  }
  return null;
}

/** Check if this is an administrative/summary row that should be excluded */
const ADMIN_PATTERNS = [
  "SETOR BANK", "SETOR OWNER", "TF VIA", "ADMIN OVO", "ADMIN QRIS",
  "GAJI STAFF", "LISTRIK", "TELEPON", "LAIN - LAIN", "KIRIM LAPORAN",
  "PAJAK RESTO", "IURAN KEMAN", "BUDGET MEETING", "BUDGET SAMPAH",
  "PELUNASAN HUTANG", "INSENTIVE", "PROMO DIMUKA", "PROMO",
  "THR", "BPJS", "PERBAIKAN", "PDAM", "PRA-OPENING", "JAMINAN BOTOL",
  "ASSET RENOV", "ASSET RENOVASI", "ASSET RESTO", "ASSET DAPUR",
  "TRANSFER IN", "TRANSFER OUT", "TO. CATTERING", "TO. VOUCHER",
  "SUB TOTAL", "TOTAL PEM", "TOTAL  PENJ",
];

function isAdminItem(name: string): boolean {
  const upper = name.toUpperCase();
  return ADMIN_PATTERNS.some(p => upper.includes(p));
}

export function parseVendor(wb: XLSX.WorkBook): VendorPurchaseItem[] {
  const sheetName = wb.SheetNames.find((n) => n.toUpperCase() === "VENDOR");
  if (!sheetName) return [];

  const rows = getSheetRows(wb, sheetName);
  const result: VendorPurchaseItem[] = [];

  // Detect column positions from header rows (rows 4-7)
  let colPrevWeekRp = 4;
  let colOpeningRp = 6;
  let colOpeningUnit = 7;
  let colTotalPurchaseRp = 34;
  let colTotalPurchaseUnit = 35;
  let colClosingRp = 36;
  let colClosingUnit = 37;
  let colUsageRp = 38;
  let colUsageUnit = 39;

  for (let i = 4; i <= 7; i++) {
    const row = rows[i] ?? [];
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] ?? "").toUpperCase().trim();
      if (cell.includes("PEMAKAIAN") && cell.includes("LALU")) { colPrevWeekRp = c; }
      if (cell.includes("PERSEDIAAN") && cell.includes("AWAL")) { colOpeningRp = c; colOpeningUnit = c + 1; }
      if (cell === "TOTAL" && i <= 5) {
        const nextCells = row.slice(c, c + 3).map(v => String(v ?? "").toUpperCase());
        if (nextCells.some(nc => nc.includes("PEMBELIAN"))) {
          colTotalPurchaseRp = c;
          colTotalPurchaseUnit = c + 1;
        }
      }
      if (cell.includes("PERSEDIAAN") && cell.includes("AKHIR")) { colClosingRp = c; colClosingUnit = c + 1; }
      if (cell.includes("PEMAKAIAN") && cell.includes("INI")) { colUsageRp = c; colUsageUnit = c + 1; }
    }
  }

  // ── State tracking ──
  let currentSection = "UMUM";
  let verticalLetters = "";
  let verticalLastRow = -1;
  let lembarCount = 0; // 0=lembar1, 1=lembar2, 2=lembar3
  let lastItemNum = 0; // Track item numbering to detect resets

  // When vertical letters resolve a section, we may need to retroactively fix items
  // that were added since the last item# reset
  let pendingSectionStart = -1; // index in result[] where pending section items start

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const col1Raw = String(row[1] ?? "").trim();
    const col2Raw = row[2];
    const col3 = String(row[3] ?? "").trim();
    const col1Upper = col1Raw.toUpperCase();
    const col3Upper = col3.toUpperCase();
    const col2Str = String(col2Raw ?? "").trim();

    // ── "TOTAL" rows mark section/table boundaries ──
    if (col3Upper.startsWith("TOTAL") || col3Upper.startsWith("SUB TOTAL")) {
      // Flush vertical accumulator
      if (verticalLetters.length > 2) {
        const sec = matchSection(verticalLetters);
        if (sec) {
          currentSection = sec;
          applyRetroactiveSection(result, pendingSectionStart, sec);
        }
      }
      verticalLetters = "";
      verticalLastRow = -1;
      lastItemNum = 0;
      continue;
    }

    // ── "VENDOR REPORT" marks a new table/lembar ──
    if (col1Upper.includes("VENDOR REPORT")) {
      lembarCount++;
      if (lembarCount === 1) {
        currentSection = "PEMBUNGKUS";
      } else {
        currentSection = "LAIN-LAIN";
      }
      verticalLetters = "";
      verticalLastRow = -1;
      lastItemNum = 0;
      pendingSectionStart = result.length;
      continue;
    }

    // Skip header/metadata rows
    if (col1Upper === "TGL FAKTUR" || col1Upper === "HARI" ||
        col3Upper === "KETERANGAN BAHAN" || col2Str === "NO") continue;

    // Skip "+" / "-" transfer rows
    if (col2Str === "+" || col2Str === "-") continue;

    // ── Detect explicit section label in col1 (full word) ──
    if (col1Upper.length > 2 &&
        !col1Upper.includes("NB") && !col1Upper.includes("VENDOR") &&
        !col1Upper.includes("TGL") && !col1Upper.includes("HARI") &&
        !col1Upper.includes("BUDGET") && !col1Upper.includes("SUB TOTAL") &&
        !col1Upper.includes("PEMBELIAN")) {
      const sec = matchSection(col1Upper);
      if (sec) {
        currentSection = sec;
        pendingSectionStart = result.length;
        // Don't skip — there may be item data on this same row
      }
    }

    // ── Detect vertical spelling in col1 ──
    if (col1Upper.length === 1 && /^[A-Z]$/.test(col1Upper)) {
      if (verticalLastRow === -1 || i - verticalLastRow <= 2) {
        if (verticalLetters === "") verticalLastRow = i;
        verticalLetters += col1Upper;
        verticalLastRow = i;
      } else {
        // Gap too large — flush and restart
        if (verticalLetters.length > 2) {
          const sec = matchSection(verticalLetters);
          if (sec) {
            currentSection = sec;
            applyRetroactiveSection(result, pendingSectionStart, sec);
          }
        }
        verticalLetters = col1Upper;
        verticalLastRow = i;
      }
      // Check if accumulated letters NOW resolve to a section
      const sec = matchSection(verticalLetters);
      if (sec) {
        currentSection = sec;
        applyRetroactiveSection(result, pendingSectionStart, sec);
      }
    } else if (!(col1Upper.length === 1 && /^[A-Z]$/i.test(col1Upper))) {
      // Non-letter in col1 → flush accumulator
      if (verticalLetters.length > 2) {
        const sec = matchSection(verticalLetters);
        if (sec) {
          currentSection = sec;
          applyRetroactiveSection(result, pendingSectionStart, sec);
        }
      }
      verticalLetters = "";
      verticalLastRow = -1;
    }

    // ── Detect section header in col3 (no item number) ──
    if (col3Upper && (col2Raw === null || col2Raw === "" || col2Raw === undefined)) {
      const sec = matchSection(col3Upper);
      if (sec) {
        currentSection = sec;
        pendingSectionStart = result.length;
        continue;
      }
      // Unknown text without item# → skip
      continue;
    }

    // ── Item rows ──
    if (!col3 || col3 === "0") continue;

    // Detect item number and check for resets
    const itemNum = toNumber(col2Raw);
    if (itemNum === 1 && lastItemNum > 1) {
      // Item numbering reset → new section boundary
      // Mark pending start for retroactive section assignment
      pendingSectionStart = result.length;
    }
    if (itemNum > 0) lastItemNum = itemNum;

    // Skip admin items
    if (isAdminItem(col3)) continue;

    // Extract values
    const prevWeekValue = toNumber(row[colPrevWeekRp]);
    const openingValue = toNumber(row[colOpeningRp]);
    const openingUnit = toNumber(row[colOpeningUnit]);
    const purchaseValue = toNumber(row[colTotalPurchaseRp]);
    const purchaseUnit = toNumber(row[colTotalPurchaseUnit]);
    const closingValue = toNumber(row[colClosingRp]);
    const closingUnit = toNumber(row[colClosingUnit]);
    const usageValue = toNumber(row[colUsageRp]);
    const usageUnit = toNumber(row[colUsageUnit]);

    // Skip rows with all zero values
    if (prevWeekValue === 0 && openingValue === 0 && purchaseValue === 0 &&
        closingValue === 0 && usageValue === 0) continue;

    result.push({
      commodityName: col3,
      section: currentSection,
      openingQty: openingUnit,
      openingValue,
      purchaseQty: purchaseUnit,
      purchaseValue,
      usageQty: usageUnit,
      usageValue,
      closingQty: closingUnit,
      closingValue,
      prevWeekValue,
    });
  }

  return result;
}

/**
 * Retroactively update the section of items added since `startIdx`.
 * This is needed because vertical letters resolve AFTER some items are already parsed.
 */
function applyRetroactiveSection(result: VendorPurchaseItem[], startIdx: number, section: string): void {
  if (startIdx < 0) return;
  for (let i = startIdx; i < result.length; i++) {
    result[i].section = section;
  }
}
