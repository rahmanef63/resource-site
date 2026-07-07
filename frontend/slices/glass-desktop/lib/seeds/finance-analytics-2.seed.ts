// glass-desktop — seed copy for the "finance-analytics" batch widgets (Build
// Plan §7). LOC-exempt data module: every widget literal lives here so the TSX
// carries no copy. Semantic colouring resolves through TONES (the shared tones
// SSOT), never accent-* directly. Public tickers (AAPL) are factual; all brands
// and companies elsewhere in the slice are fictional.
import { TONES, type Tone } from "@/features/glass-desktop/lib/seeds/system-finance-analytics.seed";

/** Integer grouped with a narrow no-break space: 12500 → "12 500", 1284 → "1 284".
 *  en-GB grouping is deterministic (commas every 3), so server and client agree —
 *  we then swap the comma for the spec's thin space. */
export function group(n: number): string {
  return n.toLocaleString("en-GB").replace(/,/g, " ");
}

/** ticker-spark (W) — one public quote + a green trend Sparkline. */
export const tickerSparkSeed = {
  symbol: "AAPL",
  name: "Apple Inc.",
  price: 295.95,
  change: 3.29,
  changePct: 1.12,
  up: true,
  color: TONES.up,
  points: [281, 284, 283, 288, 286, 290, 289, 292, 291, 293, 292, 294, 293, 295, 294, 296],
} as const;

/** currency-convert (W) — editable base amount, fixed seed rate, live recompute. */
export const currencyConvertSeed = {
  amount: 500,
  from: "USD",
  to: "EUR",
  rate: 0.9247,
  fromLabel: "US Dollar",
  toLabel: "Euro",
} as const;

/** visitors-spark (WP) — headline visitor count + amber Sparkline + a Δ ring. */
export const visitorsSparkSeed = {
  count: 1284,
  label: "visitors",
  period: "last 7d",
  deltaPct: 18,
  deltaTone: "warn" as Tone,
  color: TONES.warn,
  points: [142, 168, 151, 189, 176, 205, 253],
} as const;

/** usage-meter (WP) — headline token volume + a request cap bar.
 *  The bar tints amber once utilisation crosses `warnAt` (via TONES). */
export const usageMeterSeed = {
  tokens: 1_200_000,
  tokenLabel: "tokens",
  period: "last 7d",
  cap: { used: 42_800, total: 89_200, unit: "req" },
  warnAt: 0.8,
} as const;

/** orders-summary (WP) — a fictional store's three headline funnel metrics. */
export const ordersSummarySeed = {
  store: "Northline Supply",
  rows: [
    { id: "clicks", label: "Clicks", value: 12_500 },
    { id: "leads", label: "Leads", value: 820 },
    { id: "sales", label: "Sales", value: 96 },
  ],
} as const;
