// glass-desktop — seed data for the "system-finance-analytics" widget batch.
// Build Plan §7 (LOC-exempt seed). All widget copy/values live here so the TSX
// carries no literals. Semantic status resolves through TONES (the shared tones
// SSOT), never accent-* directly.
import type { RingGaugeProps } from "../../components/charts";

/** Status → accent CSS var. The single mapping for up/down/level colouring. */
export const TONES = {
  up: "var(--color-accent-green)",
  down: "var(--color-accent-coral)",
  neutral: "var(--color-ink-mid)",
  info: "var(--color-accent-blue)",
  warn: "var(--color-accent-amber)",
  focus: "var(--color-accent-violet)",
} as const;

export type Tone = keyof typeof TONES;

/** cpu-graph (W) — Sparkline of CPU load %, last N samples. */
export const cpuGraphSeed = {
  label: "CPU",
  unit: "%",
  color: TONES.info,
  current: 34,
  min: 4,
  max: 98,
  jitter: 10,
  points: [22, 28, 24, 31, 40, 36, 33, 45, 52, 41, 38, 34, 30, 37, 44, 34],
} as const;

/** ring-gauge (S) — one component, three metric variants (defaultProps.metric). */
export type RingMetric = "battery" | "memory" | "storage";

export const ringGaugeSeed: Record<
  RingMetric,
  { value: number; tone: Tone; label: string; caption: string }
> = {
  battery: { value: 82, tone: "up", label: "Battery", caption: "82%" },
  memory: { value: 61, tone: "info", label: "Memory", caption: "9.8 / 16 GB" },
  storage: { value: 74, tone: "warn", label: "Storage", caption: "372 / 512 GB" },
};

/** Shared ring geometry (S = 150×150 card). */
export const ringGauge = {
  size: 84,
  thickness: 8,
} satisfies Pick<RingGaugeProps, "size" | "thickness">;

/** quick-toggles (WP) — five persisted system toggles. */
export type ToggleId = "wifi" | "bt" | "focus" | "night" | "hotspot";

export const quickTogglesSeed: {
  id: ToggleId;
  label: string;
  glyph: string;
  tone: Tone;
  defaultOn: boolean;
}[] = [
  { id: "wifi", label: "Wi-Fi", glyph: "◗", tone: "info", defaultOn: true },
  { id: "bt", label: "Bluetooth", glyph: "✳", tone: "info", defaultOn: true },
  { id: "focus", label: "Focus", glyph: "◐", tone: "focus", defaultOn: false },
  { id: "night", label: "Night Shift", glyph: "☾", tone: "warn", defaultOn: false },
  { id: "hotspot", label: "Hotspot", glyph: "⟳", tone: "up", defaultOn: false },
];

/** Default toggle state map (persisted under STORAGE.toggles). */
export const quickTogglesDefault: Record<ToggleId, boolean> = {
  wifi: true,
  bt: true,
  focus: false,
  night: false,
  hotspot: false,
};

/** net-throughput (WP) — dual Sparkline (down + up), Mbps. */
export const netThroughputSeed = {
  down: {
    label: "↓",
    tone: "up" as Tone,
    current: 48.2,
    min: 0,
    max: 120,
    jitter: 14,
    points: [12, 18, 30, 44, 52, 61, 48, 40, 55, 68, 72, 60, 51, 44, 49, 48],
  },
  up: {
    label: "↑",
    tone: "info" as Tone,
    current: 7.4,
    min: 0,
    max: 30,
    jitter: 4,
    points: [4, 6, 5, 9, 11, 8, 6, 10, 13, 9, 7, 5, 8, 12, 9, 7],
  },
  unit: "Mbps",
} as const;

/** watchlist (W) — three tickers, +/- coloured via TONES. */
export const watchlistSeed: {
  symbol: string;
  price: number;
  changePct: number;
}[] = [
  { symbol: "AAPL", price: 229.87, changePct: 1.24 },
  { symbol: "MSFT", price: 462.35, changePct: -0.58 },
  { symbol: "NVDA", price: 138.91, changePct: 3.07 },
];

/** revenue-card (WP) — headline revenue + trend Sparkline. */
export const revenueCardSeed = {
  label: "Revenue",
  period: "Last 30 days",
  value: 128_450,
  currency: "USD",
  changePct: 12.6,
  tone: "up" as Tone,
  color: TONES.up,
  points: [40, 42, 39, 46, 50, 48, 55, 53, 60, 58, 64, 62, 70, 68, 75, 82],
} as const;

/** dot-heatmap (WP) — DotMatrix activity grid. */
export const dotHeatmapSeed = {
  label: "Activity",
  caption: "Commits · 26 wks",
  color: TONES.up,
  cols: 26,
  rows: 4,
  dot: 6,
  gap: 3,
} as const;
