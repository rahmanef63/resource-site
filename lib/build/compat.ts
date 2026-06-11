// Template × Slice compatibility — derivation layer.
//
// As of Phase 4 (REFACTOR-PLAN.md, 2026-05-12), compat data lives INSIDE
// each slice's `compat` field in lib/content/slices.ts (single source of
// truth). This file only re-exports types + provides helpers for build-UI
// consumers (build-shell, slice-picker, feature-picker, command-output).
//
//   native       — slice is part of template's default stack (already wired)
//   recommended  — slice pairs especially well; encourage selection
//   warn         — works, but needs manual wiring / extra config
//   incompatible — pair conflicts (e.g. clashing auth strategies)

import { slices as sliceCatalog, type CompatStatus, type SliceCompatEntry } from "@/lib/content/slices";
import { layouts } from "@/lib/content/layouts";

export type { CompatStatus, SliceCompatEntry as CompatEntry } from "@/lib/content/slices";

// Lazy-derived matrix: template-slug → slice-slug → entry.
let _matrixCache: Record<string, Record<string, SliceCompatEntry>> | null = null;
function deriveMatrix() {
  if (_matrixCache) return _matrixCache;
  const m: Record<string, Record<string, SliceCompatEntry>> = {};
  for (const s of sliceCatalog) {
    const t = s.compat?.templates;
    if (!t) continue;
    for (const [tpl, entry] of Object.entries(t)) {
      (m[tpl] ??= {})[s.slug] = entry;
    }
  }
  _matrixCache = m;
  return m;
}

export function getCompat(templateSlug: string | null, sliceSlug: string): SliceCompatEntry | null {
  if (!templateSlug) return null;
  return deriveMatrix()[templateSlug]?.[sliceSlug] ?? null;
}

export type SliceCompat = {
  conflicts?: string[];
  enhances?: string[];
};

// Slice × Slice peer/conflict — derived from each slice's `compat` field.
export const SLICE_COMPAT: Record<string, SliceCompat> = (() => {
  const out: Record<string, SliceCompat> = {};
  for (const s of sliceCatalog) {
    const c = s.compat;
    if (!c) continue;
    const conflicts = c.conflicts;
    const enhances = c.enhances;
    if (!conflicts && !enhances) continue;
    out[s.slug] = { ...(conflicts && { conflicts }), ...(enhances && { enhances }) };
  }
  return out;
})();

export type CompatWarning = {
  /** Slice slug. (Field name kept as `featureSlug` for back-compat with consumers.) */
  featureSlug: string;
  /** Slice title. (Field name kept for back-compat.) */
  featureTitle: string;
  templateSlug: string;
  templateTitle: string;
  status: CompatStatus;
  note?: string;
  /** What the user should DO about it — warnings without a path forward just stall the builder. */
  action: string;
};

const ACTION_BY_STATUS: Partial<Record<CompatStatus, string>> = {
  incompatible: "Drop this slice or pick a different template — the pair won't work together.",
  warn: "Still emitted — wire it manually after scaffolding (see the slice page for steps).",
};

/** Collect actionable warnings for current selection — incompatible + warn only. */
export function collectWarnings(templateSlug: string | null, selectedSlices: string[]): CompatWarning[] {
  if (!templateSlug) return [];
  const tpl = layouts.find((l) => l.slug === templateSlug);
  if (!tpl) return [];

  const out: CompatWarning[] = [];
  for (const slug of selectedSlices) {
    const c = getCompat(templateSlug, slug);
    if (!c || (c.status !== "warn" && c.status !== "incompatible")) continue;
    const s = sliceCatalog.find((x) => x.slug === slug);
    if (!s) continue;
    out.push({
      featureSlug: slug,
      featureTitle: s.title,
      templateSlug,
      templateTitle: tpl.title,
      status: c.status,
      note: c.note,
      action: ACTION_BY_STATUS[c.status] ?? "",
    });
  }
  return out;
}
