/**
 * Parser sheet "TO - TI" — Transfer Out / Transfer In.
 *
 * Struktur: 6 section berdampingan horizontal di kolom offset 0, 5, 10, 15, 20, 25:
 *   Col 0:  TO / TI   PERKEDEL     (bahan perkedel)
 *   Col 5:  TO CATTERING STAFF     (produk untuk catering)
 *   Col 10: TO FREE UNDIAN GELEGAR (produk gratis promo)
 *   Col 15: TO / TI CHICKEN PATTY  (bahan patty)
 *   Col 20: TO / TI PERKEDEL MANUAL (manual perkedel)
 *   Col 25: TO CATTERING KHUSUS    (produk catering khusus)
 *
 * Layout tiap section:
 *   Row 0: Section title
 *   Row 4: Headers (NAMA BAHAN/PRODUCT, QTY, HARGA BELI/JUAL, TOTAL)
 *   Rows 5–~28: Actual transfer items (the "live" data area)
 *   Rows ~29+:  Reference formulas, instructions, rumus — SKIP
 *
 * Skip criteria:
 *   - Rows where TOTAL = 0 AND QTY = null/0  (template rows, nothing filled)
 *   - Numbered instruction rows ("1. TO/TI ...", "2. ...")
 *   - Known noise keywords: CATATAN, TOLONG, NB., RUMUS, LO UNTUK, PB LO, M LO
 *   - Item names that are "0", "(....)", or very long instruction sentences
 *   - Rows below the "SUB TOTAL" footer row of each section
 *
 * Category name cleanup: strip "TO / TI", "TO ", "TI " prefixes and extra spaces.
 */

import { getSheetRows, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type TransferItem = {
  direction: "out" | "in";
  category: string;
  itemName: string;
  qty: number;
  unit?: string;
  totalValue: number;
};

/** Determine direction: "out" or "in" from section title */
function classifyDirection(sectionTitle: string): "out" | "in" {
  const up = sectionTitle.toUpperCase();
  if (up.includes("TI") && !up.includes("TO")) return "in";
  return "out"; // "TO", "TO / TI", "TO FREE" are all treated as out
}

/** Clean section title → human-readable category name */
function extractCategory(raw: string): string {
  return raw
    .replace(/TO\s*\/\s*TI\s*/gi, "")  // "TO / TI   " → ""
    .replace(/^TO\s+/gi, "")            // "TO CATTERING" → "CATTERING"
    .replace(/^TI\s+/gi, "")            // "TI ..." → "..."
    .replace(/\s+/g, " ")              // collapse multiple spaces
    .trim() || "UMUM";
}

/** Known skip patterns for item names */
const SKIP_PATTERNS = [
  "SUB TOTAL", "TOTAL", "FOOD COST", "PARAF", "JADI", "BUAT BERAPA",
  "CATATAN", "TOLONG DIBACA", "NB.", "RUMUS", "LO UNTUK", "PB LO", "M LO",
  "DIISI MANUAL", "MENTOK YG", "MANUAL DI", "KALO TIDAK", "UNTUK ALL",
  "UNTUK ADMINISTRASI", "WAJIB", "ADMIN TELUR",
];

/** Returns true if item name should be skipped */
function shouldSkipName(name: string): boolean {
  if (!name || name === "0") return true;
  if (name.startsWith("(") && name.endsWith(")")) return true;

  const up = name.toUpperCase();

  // Numbered instruction lines: "1. TEXT", "2. TEXT", etc.
  if (/^\d+\.\s/.test(name)) return true;

  // Very long strings are instructions/notes, not item names
  if (name.length > 50) return true;

  for (const pat of SKIP_PATTERNS) {
    if (up.includes(pat)) return true;
  }
  return false;
}

function parseSideBySideSections(
  rows: (string | number | Date | null | boolean)[][]
): TransferItem[] {
  const result: TransferItem[] = [];

  const titleRow = rows[0] ?? [];
  const headerRow = rows[4] ?? [];

  // Find section start columns from row 0
  const sections: { col: number; title: string }[] = [];
  for (let c = 0; c < titleRow.length; c++) {
    const cell = String(titleRow[c] ?? "").trim();
    const upper = cell.toUpperCase();
    if (
      cell.length > 2 &&
      (upper.includes("TO") || upper.includes("TI") || upper.includes("FREE"))
    ) {
      sections.push({ col: c, title: cell });
    }
  }

  // Fallback: scan row 4 for "NAMA" columns
  if (sections.length === 0) {
    for (let c = 0; c < headerRow.length; c++) {
      const cell = String(headerRow[c] ?? "").toUpperCase().trim();
      if (cell.includes("NAMA")) {
        sections.push({ col: c, title: `Section ${sections.length + 1}` });
      }
    }
  }

  if (sections.length === 0) return result;

  for (const section of sections) {
    const { col, title } = section;
    const direction = classifyDirection(title);
    const category = extractCategory(title);

    let foundSubTotal = false;
    let highRowIndex = 0;

    // First pass: find the SUB TOTAL row index to know where items end
    for (let r = 5; r < rows.length; r++) {
      const row = rows[r];
      const name = String(row[col] ?? "").trim().toUpperCase();
      if (name.includes("SUB TOTAL")) {
        highRowIndex = r;
        break;
      }
    }
    // Also detect a PARAF or blank boundary
    if (!highRowIndex) {
      for (let r = 5; r < rows.length; r++) {
        const row = rows[r];
        const name = String(row[col] ?? "").trim().toUpperCase();
        if (name.includes("PARAF") || name.includes("FOOD COST") || name.includes("JADI")) {
          highRowIndex = r;
          break;
        }
      }
    }
    // Absolute cutoff: never go past row 30 for item data (formula/instruction area after)
    if (!highRowIndex || highRowIndex > 30) highRowIndex = 30;

    for (let r = 5; r < highRowIndex; r++) {
      const row = rows[r];
      const name = String(row[col] ?? "").trim();
      if (!name) continue;
      if (shouldSkipName(name)) continue;

      const qtyRaw = row[col + 1];
      const priceRaw = row[col + 2];
      const totalRaw = row[col + 3];

      const qty = qtyRaw !== null && qtyRaw !== "" ? toNumber(qtyRaw) : null;
      const price = toNumber(priceRaw);
      const total = toNumber(totalRaw);

      // Skip template/reference rows: no qty filled AND total is 0
      if (qty === null && total === 0) continue;

      // Skip rows where everything is zero (nothing transferred)
      if ((qty === null || qty === 0) && total === 0) continue;

      const computedTotal = total > 0 ? total : (qty ?? 0) * price;

      result.push({
        direction,
        category,
        itemName: name,
        qty: qty ?? 0,
        totalValue: computedTotal,
      });
    }
  }

  return result;
}

export function parseTransferTOTI(wb: XLSX.WorkBook): TransferItem[] {
  const result: TransferItem[] = [];

  // Main "TO - TI" sheet
  const mainSheet = wb.SheetNames.find((n) => {
    const up = n.toUpperCase().replace(/\s+/g, " ").trim();
    return up === "TO - TI" || up === "TO-TI" || up === "TO TI";
  });

  if (mainSheet) {
    const rows = getSheetRows(wb, mainSheet);
    result.push(...parseSideBySideSections(rows));
  }

  // Also check standalone sheets (TO-TI PERKEDEL, TO CATTERING STAFF)
  // Note: These may duplicate data from the main sheet — only include if main sheet is missing
  if (result.length === 0) {
    const standaloneSheets = wb.SheetNames.filter((n) => {
      const up = n.toUpperCase().replace(/\s+/g, " ").trim();
      return (
        (up.includes("TO-TI") || up.includes("TO - TI") || up.includes("TO CATTERING")) &&
        up !== (mainSheet ?? "").toUpperCase().replace(/\s+/g, " ").trim()
      );
    });

    for (const sn of standaloneSheets) {
      const rows = getSheetRows(wb, sn);
      const items = parseSideBySideSections(rows);
      if (items.length > 0) {
        result.push(...items);
      } else {
        // Sequential fallback for simple single-section sheets
        const direction =
          sn.toUpperCase().includes("TI") && !sn.toUpperCase().includes("TO")
            ? ("in" as const)
            : ("out" as const);
        const category = extractCategory(sn);
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          const name = String(row[0] ?? row[1] ?? "").trim();
          if (!name || shouldSkipName(name)) continue;
          const qty = toNumber(row[1]) || toNumber(row[2]);
          const total = toNumber(row[3]) || toNumber(row[2]);
          if (qty === 0 && total === 0) continue;
          result.push({ direction, category, itemName: name, qty, totalValue: total });
        }
      }
    }
  }

  return result;
}
