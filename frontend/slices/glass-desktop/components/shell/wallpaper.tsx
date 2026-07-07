// glass-desktop — "Dusk Field" wallpaper (Build Plan §5 / Appendix A).
// Pure CSS, zero image assets: the exact layered radial-gradient stack from
// Appendix A over a bottom vignette, sitting on the canvas token. Presentational
// and static, so it renders on the server (no "use client", no hooks). The oklch
// stops below are the copy-authoritative wallpaper values — they have no theme
// token, and the base surface still resolves through var(--color-canvas).
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** The Dusk Field gradient stack, top layer first, base surface last. */
const DUSK_FIELD = [
  "radial-gradient(90% 80% at 18% 12%, oklch(38% 0.09 265 / 0.55), transparent 60%)",
  "radial-gradient(70% 60% at 82% 20%, oklch(30% 0.10 320 / 0.35), transparent 55%)",
  "radial-gradient(80% 70% at 70% 95%, oklch(26% 0.08 210 / 0.45), transparent 60%)",
  // bottom vignette — darkens the lower third so the dock/chrome reads clearly
  "linear-gradient(180deg, transparent 55%, oklch(0% 0 0 / 0.30))",
  "var(--color-canvas)",
].join(",");

export interface WallpaperProps {
  className?: string;
  style?: CSSProperties;
}

/**
 * Full-bleed Dusk Field backdrop. Meant to sit at the z-0 layer of the shell
 * (the desktop-shell positions it absolute inset-0). Decorative → aria-hidden.
 */
export function Wallpaper({ className, style }: WallpaperProps) {
  return (
    <div
      aria-hidden="true"
      data-slice-part="wallpaper"
      className={cn("absolute inset-0", className)}
      style={{ background: DUSK_FIELD, ...style }}
    />
  );
}
