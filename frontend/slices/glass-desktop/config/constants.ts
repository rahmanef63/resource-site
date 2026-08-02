// glass-desktop — grid units, z-layers, storage keys (Build Plan §4 / §6.2).
import type { WidgetSize } from "../types";

/** One grid drives everything: column 150, row 71, gap 8. 2r+gap=150, 2c+gap=308. */
export const GRID = { cellW: 150, cellH: 71, gap: 8, cols: 8 } as const;

/** Cell span per size code (c = columns, r = rows). */
export const SIZE_CELLS: Record<WidgetSize, { c: number; r: number }> = {
  SP: { c: 1, r: 1 }, // small pill  150×71
  S: { c: 1, r: 2 }, //  square     150×150
  WP: { c: 2, r: 1 }, // wide pill   308×71
  W: { c: 2, r: 2 }, //  wide        308×150
  L: { c: 2, r: 4 }, //  large       308×308
};

/** Z-layer constants — nothing sets a raw z-index outside this map. */
export const Z = {
  wallpaper: 0,
  widget: 10,
  drag: 20,
  chrome: 40,
  overlay: 50,
  toast: 60,
} as const;

/** Chrome heights. */
export const MENUBAR_H = 36;
export const DOCK_H = 64;

/** Versioned localStorage keys — all owned by the storage adapter (§6.2). */
export const STORAGE = {
  layout: "rr:glass-desktop:v1:layout",
  space: "rr:glass-desktop:v1:space",
  toggles: "rr:glass-desktop:v1:toggles",
  tasks: "rr:glass-desktop:v1:tasks",
  timers: "rr:glass-desktop:v1:timers",
  media: "rr:glass-desktop:v1:media",
} as const;
