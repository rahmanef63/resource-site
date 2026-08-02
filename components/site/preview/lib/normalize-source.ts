import type { PreviewView } from "@/lib/preview-presets";
import type { PreviewSource, PreviewSurfaceMode } from "../types";
import { getDemoUrl } from "@/lib/content/template-subdomains";

/** Loose input shape — anything with a previewPath becomes a
 *  PreviewSource. Lets us pass SliceEntry/LayoutEntry directly. */
type PartialPreviewSource = {
  slug?: string;
  previewPath?: string | null;
  adminPreviewPath?: string | null;
  defaultSurface?: PreviewSurfaceMode;
  defaultView?: PreviewView;
  defaultZoom?: number;
  title?: string;
};

/** Convert a catalog entry (Slice/Layout) into a normalized
 *  PreviewSource. Returns null if no public preview path.
 *
 *  BR-wave — when `slug` matches a demo subdomain mapping (see
 *  lib/content/template-subdomains.ts), enriches the source with
 *  publicExternalUrl + adminExternalUrl so "Open in new tab" lands
 *  on the canonical demo subdomain instead of the internal
 *  /preview/<slug>/... path. */
export function normalizePreviewSource(input: PartialPreviewSource): PreviewSource | null {
  if (!input.previewPath) return null;
  const demoUrl = input.slug ? getDemoUrl(input.slug) : null;
  return {
    publicPath: input.previewPath,
    adminPath: input.adminPreviewPath ?? undefined,
    publicExternalUrl: demoUrl ? `${demoUrl}/` : undefined,
    adminExternalUrl: demoUrl && input.adminPreviewPath ? `${demoUrl}/admin` : undefined,
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
