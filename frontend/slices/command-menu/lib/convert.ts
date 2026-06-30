// Unit conversion for the palette's "= <result> <unit>" result row.
// Mirrors calc.ts: a pure parser that returns null for non-conversions so plain
// search text ("files") stays a normal search instead of surfacing a junk row.
//
// Supported units (SMALL static table — NOT a full unit library):
//   length: mm, cm, m, km, in, ft, mi
//   mass:   g, kg, lb, oz
//   temp:   c, f, k   (offset formulas, not a bare factor)
// Convert only WITHIN a dimension; cross-dimension (km → kg) returns null.
//
// ponytail: ceiling is these literal factors — no aliases ("kilometre"/"miles"),
// no plurals, no compound units, no scientific input. A command-palette helper,
// not a unit library. Bump only when someone actually types a missing unit.

// length factors → meters
const LENGTH: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000,
  in: 0.0254, ft: 0.3048, mi: 1609.344,
};
// mass factors → grams
const MASS: Record<string, number> = {
  g: 1, kg: 1000, lb: 453.592, oz: 28.3495,
};
// temperature is offset-based, so it gets formulas instead of a factor table.
const TEMP_LABEL: Record<string, string> = { c: "°C", f: "°F", k: "K" };

function toCelsius(v: number, u: string): number {
  if (u === "c") return v;
  if (u === "f") return (v - 32) * (5 / 9);
  return v - 273.15; // k
}
function fromCelsius(c: number, u: string): number {
  if (u === "c") return c;
  if (u === "f") return c * (9 / 5) + 32;
  return c + 273.15; // k
}

// ~4 significant digits, trailing zeros dropped ("32.00" → "32", "6.2137" → "6.214").
// Number() round-trips the toPrecision string back to a clean numeric literal.
function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const v = n === 0 ? 0 : n; // normalise -0
  return String(Number(v.toPrecision(4)));
}

// Format only a FINITE result; a conversion that overflows to Infinity (a 300+
// digit pasted number) stays a normal search instead of a "= 0 <unit>" junk row.
function fin(n: number, unit: string): string | null {
  return Number.isFinite(n) ? `${fmt(n)} ${unit}` : null;
}

// "<number> <fromUnit> to|in <toUnit>" — case-insensitive, extra spaces tolerated.
// "in" doubles as a unit (inches) and the connector word; the regex resolves it.
const RE = /^\s*(-?\d*\.?\d+)\s+([a-z]+)\s+(?:to|in)\s+([a-z]+)\s*$/i;

/** Convert a unit expression to "<value> <unit>", or null if it is not a valid conversion. */
export function convert(input: string): string | null {
  const m = RE.exec(input);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const from = m[2].toLowerCase();
  const to = m[3].toLowerCase();

  if (from in LENGTH && to in LENGTH) return fin((n * LENGTH[from]) / LENGTH[to], to);
  if (from in MASS && to in MASS) return fin((n * MASS[from]) / MASS[to], to);
  if (from in TEMP_LABEL && to in TEMP_LABEL) return fin(fromCelsius(toCelsius(n, from), to), TEMP_LABEL[to]);
  return null; // cross-dimension (km → kg) or unknown unit
}
