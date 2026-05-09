// Slice registry — surfaces auto-discovered slices to the rest of the app.
//
// The actual list lives in `registry.generated.ts`, written by
// `scripts/features/generate-registry.ts` (Phase 1.2). Consumers only ever
// import from this file — the indirection keeps generated artifact details
// out of consumer imports.
//
// Adapted from superspace/frontend/shared/lib/features/registry.ts. Stripped
// of superspace-specific bundle/workspace concerns.

import type { SliceConfig, SliceCategory } from "./defineFeature";

export type RegisteredSlice = SliceConfig & {
  /** Resolved import path (e.g., "@/features/midtrans-payment/config"). */
  importPath: string;
  /** Slice's semver from slice.json. */
  version: string;
};

let _registry: RegisteredSlice[] | null = null;

/** Set the registry (called once at app boot by `registry.generated.ts`). */
export function _bootstrapRegistry(slices: RegisteredSlice[]) {
  _registry = slices;
}

/** Read-only registry accessor. Throws if called before bootstrap. */
export function getRegistry(): RegisteredSlice[] {
  if (_registry === null) {
    throw new Error(
      "[registry] not bootstrapped. Did you forget to import registry.generated.ts at app boot?",
    );
  }
  return _registry;
}

/** Look up a slice by slug. Returns null if missing. */
export function findSlice(slug: string): RegisteredSlice | null {
  return getRegistry().find((s) => s.slug === slug) ?? null;
}

/** All slices in a given category, sorted by nav.order then slug. */
export function slicesByCategory(category: SliceCategory): RegisteredSlice[] {
  return getRegistry()
    .filter((s) => s.category === category)
    .sort((a, b) => (a.nav?.order ?? 0) - (b.nav?.order ?? 0) || a.slug.localeCompare(b.slug));
}

/** Resolve a registered slice's nav entry. Returns null if no nav. */
export function navEntries(): Array<RegisteredSlice & { nav: NonNullable<RegisteredSlice["nav"]> }> {
  return getRegistry()
    .filter((s): s is RegisteredSlice & { nav: NonNullable<RegisteredSlice["nav"]> } => !!s.nav)
    .sort((a, b) => (a.nav.order ?? 0) - (b.nav.order ?? 0));
}
