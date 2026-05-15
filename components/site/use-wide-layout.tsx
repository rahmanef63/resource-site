"use client";

import * as React from "react";
import { useFeatureManifest } from "./feature-context";

/**
 * Drop-in client component for server pages that want the DocsShell center
 * to render full-width (no max-w-3xl constraint). Useful for catalog grids
 * where horizontal real estate matters.
 *
 * Usage: render `<UseWideLayout />` somewhere in the page tree.
 */
export function UseWideLayout() {
  const manifest = React.useMemo(() => ({ wide: true }), []);
  useFeatureManifest(manifest);
  return null;
}
