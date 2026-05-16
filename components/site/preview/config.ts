/**
 * Live-preview module — defaults SSOT.
 *
 * Every magic number that used to live inline in preview-frame /
 * iframe-thumbnail / live-preview-button now sits here. Override per
 * call site by passing the matching prop.
 */

import type { PreviewView } from "@/lib/preview-presets";

export const PREVIEW_DEFAULTS = {
  /** Initial viewport preset id. */
  view: "desktop" as PreviewView,
  /** Initial zoom when not specified. */
  zoom: 0.6,
  /** Initial zoom for "compact" contexts (detail-page card body). */
  compactZoom: 1,
  /** Zoom slider bounds. */
  minZoom: 0.4,
  maxZoom: 1.5,
  zoomStep: 0.05,

  /** Thumbnail scale — iframe rendered at full size then transform-scaled. */
  thumbnailScale: 0.4,
  /** Aspect ratio token (Tailwind class fragment). */
  thumbnailAspect: "16/10",
  /** IntersectionObserver root margin for thumbnail lazy load. */
  thumbnailRootMargin: "200px 0px",

  /** Dialog (live-preview overlay) sizing. */
  dialogMaxWidthPx: 960,
  dialogViewportWidthVw: 96,
  dialogViewportHeightSvh: 92,

  /** Padding around the device shell in PreviewCanvas. */
  canvasPaddingPx: 24,
  /** Chrome height (toolbar) — added to canvas height calc. */
  chromeHeightPx: 56,
} as const;

/** localStorage key prefix for persisted view/zoom across sessions.
 *  Append a per-surface suffix (e.g. `${PREFIX}slices/comments`). */
export const PREVIEW_STORAGE_PREFIX = "rr-preview:";

/** Storage key builder. */
export function previewStorageKey(scope: string): string {
  return `${PREVIEW_STORAGE_PREFIX}${scope}`;
}
