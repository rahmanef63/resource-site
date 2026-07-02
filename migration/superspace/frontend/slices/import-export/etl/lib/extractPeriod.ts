/**
 * Parse weekly-report filename into period bounds.
 *
 * Expected pattern: "<DD>-<DD> <MON> <YYYY>" anywhere in name (case-insensitive).
 * Examples:
 *   "NEW LAP 24-30 MAR 2026.xlsx"  → { start: "2026-03-24", end: "2026-03-30" }
 *   "Weekly 1-7 Jan 2025.xlsx"      → { start: "2025-01-01", end: "2025-01-07" }
 */
export function extractPeriod(fileName: string): { start: string; end: string } {
  const name = fileName.toUpperCase();
  const monthMap: Record<string, string> = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MEI: "05", MAY: "05",
    JUN: "06", JUL: "07", AGU: "08", AUG: "08", SEP: "09",
    OKT: "10", OCT: "10", NOV: "11", DES: "12", DEC: "12",
  };
  const match = name.match(/(\d+)-(\d+)\s+([A-Z]+)\s+(\d{4})/);
  if (!match) return { start: "", end: "" };
  const [, d1, d2, mon, year] = match;
  const m = monthMap[mon] ?? "01";
  return {
    start: `${year}-${m}-${d1.padStart(2, "0")}`,
    end: `${year}-${m}-${d2.padStart(2, "0")}`,
  };
}
