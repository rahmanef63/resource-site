/**
 * Variant-preview runtime contract (VP wave).
 *
 * Every slice that declares a `previews` block in its slice.json ships a
 * sibling `preview.tsx` whose default export satisfies {@link SlicePreviewModule}.
 * The builder mounts these widgets via the generated registry
 * (lib/preview/registry.gen.ts) — one dynamic import per slug, code-split,
 * client-only. See docs/SLICE-PREVIEW-SPEC.md.
 */

import type * as React from "react";

/** Selected variant: axis prop → chosen enum value (kind "variants"), or
 *  `{ scenario: "<id>" }` (kind "scenarios"). preview.tsx maps these strings
 *  to real component props — the builder and the AI never pass raw props. */
export type VariantSelection = Record<string, string>;

export interface SlicePreviewProps {
  variant: VariantSelection;
}

/** Default export of a slice's preview.tsx: component name → demo widget. */
export type SlicePreviewModule = Record<
  string,
  React.ComponentType<SlicePreviewProps>
>;

// ── Declared metadata (mirrors the slice.json `previews` block) ───────────

export interface PreviewAxis {
  prop: string;
  values: string[];
  default?: string;
  description?: string;
}

export interface PreviewScenario {
  id: string;
  title?: string;
  description?: string;
}

export interface SlicePreviewDecl {
  component: string;
  kind: "variants" | "scenarios";
  axes?: PreviewAxis[];
  scenarios?: PreviewScenario[];
  seed?: string;
}

/** One slice's entry in lib/preview/preview-meta.gen.json. */
export interface SlicePreviewMeta {
  slug: string;
  title: string;
  category: string;
  previews: SlicePreviewDecl[];
}
