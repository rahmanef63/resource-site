import type { PreviewPreset } from "@/lib/preview-presets";
import { PREVIEW_DEFAULTS } from "../config";

/** Derived dimensions for the PreviewCanvas device shell. Single
 *  formula — used by both the bare canvas and the chrome wrapper that
 *  needs to size its surrounding card. */
export function canvasDimensions(preset: PreviewPreset, zoom: number) {
  const width = Math.round(preset.width * zoom);
  const height = Math.round(preset.height * zoom);
  return {
    width,
    height,
    chromeHeight: PREVIEW_DEFAULTS.chromeHeightPx,
    /** Width + padding × 2 — usable for outer container max-width. */
    outerWidth: width + PREVIEW_DEFAULTS.canvasPaddingPx * 2,
    /** Height + chrome — for vertical sizing. */
    totalHeight: height + PREVIEW_DEFAULTS.chromeHeightPx,
  } as const;
}

/** Clamp a zoom value to the configured slider range. */
export function clampZoom(z: number): number {
  return Math.max(PREVIEW_DEFAULTS.minZoom, Math.min(PREVIEW_DEFAULTS.maxZoom, z));
}
