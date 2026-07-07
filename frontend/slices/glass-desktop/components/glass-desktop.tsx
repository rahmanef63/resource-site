"use client";

import type { ReactNode } from "react";
import type { LayoutStore } from "../types";

export interface GlassDesktopProps {
  /** Which space is active on first paint. */
  initialSpace?: 0 | 1;
  /** Layout persistence adapter (defaults to the localStorage adapter, T6). */
  store?: LayoutStore;
  /** Brand shown in the menu bar. Portability prop — no hardcoded consumer brand. */
  brand?: { name: string; glyph?: ReactNode };
}

/**
 * Lucent Desktop — the full interactive glass desktop surface.
 * SCAFFOLD (T1): renders a placeholder canvas full-bleed. The widget engine
 * (T6), drag/config (T7), chrome (T3–T5) and widgets (T9–T13) land next.
 */
export function GlassDesktop({ brand = { name: "Lucent" } }: GlassDesktopProps) {
  return (
    <div
      data-slice="glass-desktop"
      className="relative grid h-dvh place-items-center overflow-hidden"
      style={{ background: "var(--color-canvas, oklch(16% 0.015 260))", color: "var(--color-ink-mid, oklch(97% 0.005 260 / 0.6))" }}
    >
      <div className="text-center">
        <div className="text-2xl font-semibold" style={{ color: "var(--color-ink-hi, oklch(97% 0.005 260 / 0.95))" }}>
          {brand.name} Desktop
        </div>
        <p className="mt-2 text-sm">Widget canvas — scaffold. Engine + widgets land next.</p>
      </div>
    </div>
  );
}
