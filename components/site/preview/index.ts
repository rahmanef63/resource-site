/**
 * Live-preview module barrel.
 *
 * Consumers should import from `@/components/site/preview` rather than
 * reaching into per-file paths — keeps the surface SSOT and lets us
 * refactor internals freely.
 *
 *   import {
 *     PreviewIframe, PreviewSource, PREVIEW_DEFAULTS,
 *     normalizePreviewSource, usePreviewState,
 *   } from "@/components/site/preview";
 */

export * from "./types";
export * from "./config";
export * from "./preview-iframe";
export * from "./hooks/use-iframe-lazy-load";
export * from "./hooks/use-iframe-loaded";
export * from "./hooks/use-preview-state";
export * from "./lib/normalize-source";
export * from "./lib/canvas-size";
export * from "./manifest-builder";
