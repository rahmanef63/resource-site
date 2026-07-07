// glass-desktop — media batch 2 seed data (Build Plan §7, LOC-exempt seed).
// reaction-tray and device-audio are self-contained demos: reaction counts and
// device levels start here and evolve as local UI state (no shared STORAGE key).
// Fictional platforms only (Wavelength / Loop) — no external marks or naming.

/** lucide glyph keys for the eight reaction buttons. */
export type ReactionKey =
  | "heart"
  | "star"
  | "thumbs-up"
  | "zap"
  | "flame"
  | "sparkles"
  | "check"
  | "plus";

export interface ReactionSeed {
  key: ReactionKey;
  /** accessible name for the button. */
  label: string;
  /** starting tally, bumped one per click. */
  count: number;
  /** CSS custom-property reference for the glyph colour (decorative, not status). */
  accent: string;
}

export const reactionTray: ReactionSeed[] = [
  { key: "heart", label: "Love", count: 1284, accent: "var(--color-accent-coral)" },
  { key: "star", label: "Star", count: 642, accent: "var(--color-accent-amber)" },
  { key: "thumbs-up", label: "Like", count: 3120, accent: "var(--color-accent-blue)" },
  { key: "zap", label: "Spark", count: 208, accent: "var(--color-accent-amber)" },
  { key: "flame", label: "Fire", count: 917, accent: "var(--color-accent-coral)" },
  { key: "sparkles", label: "Shine", count: 456, accent: "var(--color-accent-violet)" },
  { key: "check", label: "Done", count: 74, accent: "var(--color-accent-green)" },
  { key: "plus", label: "Add", count: 12, accent: "var(--color-accent-blue)" },
];

/** lucide glyph keys for the output-device rows. */
export type DeviceKey = "laptop" | "buds" | "display";

export interface DeviceSeed {
  key: DeviceKey;
  label: string;
  /** current level 0-100, driven by the row's Slider. */
  level: number;
  /** CSS custom-property reference for the Slider range colour. */
  accent: string;
}

export const deviceAudio: DeviceSeed[] = [
  { key: "laptop", label: "Laptop", level: 59, accent: "var(--color-accent-blue)" },
  { key: "buds", label: "Buds", level: 81, accent: "var(--color-accent-violet)" },
  { key: "display", label: "Display", level: 74, accent: "var(--color-accent-green)" },
];
