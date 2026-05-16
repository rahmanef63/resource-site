import type { PreviewView } from "@/lib/preview-presets";
import type { PreviewSource, PreviewSurfaceMode } from "../types";

/** Loose input shape — anything with a previewPath becomes a
 *  PreviewSource. Lets us pass SliceEntry/LayoutEntry directly. */
type PartialPreviewSource = {
  previewPath?: string | null;
  adminPreviewPath?: string | null;
  defaultSurface?: PreviewSurfaceMode;
  defaultView?: PreviewView;
  defaultZoom?: number;
  title?: string;
};

/** Convert a catalog entry (Slice/Layout) into a normalized
 *  PreviewSource. Returns null if no public preview path. */
export function normalizePreviewSource(input: PartialPreviewSource): PreviewSource | null {
  if (!input.previewPath) return null;
  return {
    publicPath: input.previewPath,
    adminPath: input.adminPreviewPath ?? undefined,
    defaultSurface: input.defaultSurface,
    defaultView: input.defaultView,
    defaultZoom: input.defaultZoom,
    title: input.title,
  };
}

/** Pick the active iframe path given a normalized source + selected
 *  surface. Falls back to publicPath when admin requested but absent. */
export function activePreviewPath(
  source: PreviewSource,
  surface: PreviewSurfaceMode = source.defaultSurface ?? "public",
): string {
  if (surface === "admin" && source.adminPath) return source.adminPath;
  return source.publicPath;
}

/** Does the source have a second surface? */
export function hasDualSurface(source: PreviewSource): boolean {
  return !!source.adminPath;
}
