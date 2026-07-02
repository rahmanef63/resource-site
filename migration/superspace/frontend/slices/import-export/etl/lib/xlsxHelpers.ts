import * as XLSX from "xlsx";

export type RawSheet = (string | number | Date | null | boolean)[][];

/**
 * Parse file Excel menjadi map sheet_name → 2D array of values.
 */
export async function parseExcelFile(file: File): Promise<XLSX.WorkBook> {
  const buffer = await file.arrayBuffer();
  return XLSX.read(buffer, { type: "buffer", cellDates: true });
}

/**
 * Ambil sheet sebagai 2D array. Row & col index mulai dari 0.
 */
export function getSheetRows(wb: XLSX.WorkBook, sheetName: string): RawSheet {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  // raw: true → numeric cells langsung jadi JS number (60000 bukan "60,000")
  // cellDates: true di XLSX.read() sudah handle Date object
  return XLSX.utils.sheet_to_json<(string | number | Date | null | boolean)[]>(
    sheet,
    { header: 1, defval: null, raw: true }
  ) as RawSheet;
}

/**
 * Temukan sheet dengan nama yang mengandung keyword (case-insensitive).
 */
export function findSheetName(wb: XLSX.WorkBook, keyword: string): string | null {
  return wb.SheetNames.find((n) =>
    n.toUpperCase().includes(keyword.toUpperCase())
  ) ?? null;
}

/**
 * Parse tanggal dari berbagai format ke string "YYYY-MM-DD".
 * Mendukung Date object, string Excel, dll.
 */
export function toDateString(value: unknown): string | null {
  if (!value) return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.toLocaleDateString("en-CA"); // YYYY-MM-DD
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    // Coba parse berbagai format
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-CA");
    }
  }

  if (typeof value === "number") {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      const y = date.y;
      const m = String(date.m).padStart(2, "0");
      const d = String(date.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }

  return null;
}

/**
 * Parse angka dari berbagai format string ke number.
 *
 * Dengan raw: true, cell numerik sudah jadi JS number — fungsi ini hanya
 * dipakai untuk cell yang memang berisi teks berformat angka.
 *
 * Format yang didukung:
 *   Indonesian:  "60.000"       → 60000
 *                "1.234.567"    → 1234567
 *                "60.000,50"    → 60000.5
 *   US/mixed:    "60,000"       → 60000
 *                "60,000.50"    → 60000.5
 *   Plain:       "60000"        → 60000
 */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (typeof value === "boolean") return 0;
  if (typeof value === "string") {
    const s = value.trim().replace(/\s/g, "").replace(/Rp\.?/gi, "");
    if (!s) return 0;

    const hasDot   = s.includes(".");
    const hasComma = s.includes(",");

    if (hasDot && hasComma) {
      // Ada keduanya — tentukan mana desimal berdasarkan posisi terakhir
      // "60.000,50"  → koma terakhir = desimal (Indonesian)
      // "60,000.50"  → titik terakhir = desimal (US)
      const lastDot   = s.lastIndexOf(".");
      const lastComma = s.lastIndexOf(",");
      if (lastComma > lastDot) {
        // Indonesian: titik = ribuan, koma = desimal
        return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
      } else {
        // US: koma = ribuan, titik = desimal
        return parseFloat(s.replace(/,/g, "")) || 0;
      }
    }

    if (hasDot && !hasComma) {
      // Hanya titik — cek apakah ribuan atau desimal
      // Ribuan jika: semua bagian setelah titik punya tepat 3 digit
      // "60.000"   → ["60","000"]       → 3 digit → ribuan → 60000
      // "1.234.567"→ ["1","234","567"]  → 3 digit → ribuan → 1234567
      // "60.5"     → ["60","5"]         → 1 digit → desimal → 60.5
      const digits = s.replace(/[^0-9.]/g, "");
      const parts  = digits.split(".");
      const allThree = parts.slice(1).every((p) => p.length === 3);
      if (allThree && parts.length > 1) {
        return parseFloat(digits.replace(/\./g, "")) || 0;
      }
      return parseFloat(digits) || 0;
    }

    if (hasComma && !hasDot) {
      // Hanya koma — Indonesian (koma = desimal) atau US (koma = ribuan)?
      // "60,000" → bagian setelah koma = 3 digit → ribuan (US)
      // "60,5"   → bagian setelah koma < 3 digit → desimal (Indonesian)
      const digits = s.replace(/[^0-9,]/g, "");
      const parts  = digits.split(",");
      if (parts.length === 2 && parts[1].length === 3) {
        // Ribuan (koma = ribuan separator)
        return parseFloat(digits.replace(/,/g, "")) || 0;
      }
      // Desimal
      return parseFloat(digits.replace(",", ".")) || 0;
    }

    // Tidak ada titik/koma — hapus karakter non-numerik
    return parseFloat(s.replace(/[^0-9-]/g, "")) || 0;
  }
  return 0;
}
