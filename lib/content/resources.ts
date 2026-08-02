// Unified resource registry — DERIVED layer over slices + layouts.
// Operasi Mise M3-BN (2026-05-20).
//
// Why this exists: site, /api/knowledge, MCP server, and bundle builder
// all need to enumerate "everything installable" across multiple
// underlying registries (Tier-3 slices, website templates, smaller
// layouts). Before this file, each surface re-rolled its own concat
// logic. Now: single source, additive-only, no breaking change.
//
// IMPORTANT — this is derived. Do not hand-edit entries; edit the
// upstream registry (`slices.ts` or `layouts.ts`) and resources.ts
// follows automatically.

import {
  slices,
  type SliceEntry,
  type ResourceType,
  type Domain,
  type Maturity,
} from "./slices";
import { layouts, type LayoutEntry } from "./layouts";

/** Where this resource came from in the source-of-truth registries.
 *
 *   slice    — `lib/content/slices.ts` entry (Tier-3 vertical slice)
 *   template — `lib/content/layouts.ts` entry with category "website-template"
 *   layout   — `lib/content/layouts.ts` entry with any other category
 *              (marketing / dashboard / cms / template)
 */
export type ResourceSource = "slice" | "template" | "layout";

/** Minimum surface every resource exposes. Each surface (site, API,
 *  MCP) decides which extra fields to enrich with by re-querying the
 *  source registry via `getResource(slug).slice` / `.layout`. */
export type Resource = {
  source: ResourceSource;
  slug: string;
  title: string;
  description: string;
  /** Slice category (ai/auth/…) or layout category (marketing/…).
   *  Always a string; consumer maps to its own taxonomy. */
  category: string;
  tags: string[];
  /** Catalog detail page URL on the site. */
  href: string;
  /** Live preview iframe URL, if the resource ships one. */
  previewPath?: string;
  /** Plain copy-paste install command. */
  install?: string;
  /** M5-BP — public taxonomy fields. Optional. Defaults: maturity
   *  falls back to `"stable"` when omitted; resourceType + domain
   *  stay undefined until the upstream slice/layout is tagged. */
  resourceType?: ResourceType;
  domain?: Domain;
  maturity: Maturity;
};

function sliceToResource(s: SliceEntry): Resource {
  return {
    source: "slice",
    slug: s.slug,
    title: s.title,
    description: s.description,
    category: s.category,
    tags: s.tags ?? [],
    href: `/slices/${s.slug}`,
    previewPath: s.previewPath,
    install: s.install ?? `npx rahman-resources add ${s.slug}`,
    resourceType: s.resourceType,
    domain: s.domain,
    maturity: s.maturity ?? "stable",
  };
}

function layoutToResource(l: LayoutEntry): Resource {
  const isTemplate = l.category === "website-template";
  return {
    source: isTemplate ? "template" : "layout",
    slug: l.slug,
    title: l.title,
    description: l.description,
    category: l.category,
    tags: l.tags ?? [],
    href: isTemplate ? `/templates/${l.slug}` : `/layouts/${l.slug}`,
    previewPath: l.previewPath,
    install: `npx rahman-resources add ${l.slug}`,
    // Layouts inherit "stable" until extended with maturity field.
    maturity: "stable",
  };
}

/** Derived unified list — every installable resource in one array. */
export const resources: Resource[] = [
  ...slices.map(sliceToResource),
  ...layouts.map(layoutToResource),
];

/** Lookup by slug. Slug collisions across registries are not expected
 *  (slice slugs are domain-flavored e.g. `convex-auth`; layout slugs
 *  are template-flavored e.g. `personal-brand-os`). If a collision
 *  ever occurs, the slice wins (registered first). */
export function getResource(slug: string): Resource | null {
  return resources.find((r) => r.slug === slug) ?? null;
}

export function getResourcesBySource(source: ResourceSource): Resource[] {
  return resources.filter((r) => r.source === source);
}

export function getResourcesByCategory(category: string): Resource[] {
  return resources.filter((r) => r.category === category);
}

/** Counts per source — used by /api/knowledge + homepage stat row. */
export function resourceCounts() {
  return {
    total: resources.length,
    slice: resources.filter((r) => r.source === "slice").length,
    template: resources.filter((r) => r.source === "template").length,
    layout: resources.filter((r) => r.source === "layout").length,
  };
}
