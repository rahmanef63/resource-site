import { describe, it, expect } from "vitest";
import {
  acts,
  ACT_SLUGS,
  actForSlug,
  isKeyGated,
  KEY_GATED_SLUGS,
  type ActId,
} from "@/lib/content/tour";
import { slices } from "@/lib/content/slices";
import { isHidden } from "@/lib/content/hidden-slugs";
import type { SliceCategory } from "@/lib/shared/features/defineFeature";

// Tour coverage — asserts the Act partition stays TOTAL + DISJOINT against the
// live catalog, so catalog drift (a new/renamed/removed slice) fails CI loudly
// instead of silently dropping a slice from /tour. Wired into the audit gate
// next to audit:slices.

const ACT_IDS: ActId[] = [
  "marketing",
  "os-appshell",
  "media",
  "ai",
  "content",
  "platform",
];

const ALL_CATEGORIES: SliceCategory[] = [
  "ai",
  "auth",
  "data",
  "integrations",
  "content",
  "ui",
  "os",
  "infra",
];

const visibleSlices = slices.filter((s) => !isHidden(s.slug));
const visibleSet = new Set(visibleSlices.map((s) => s.slug));
const curatedSlugs = Object.values(ACT_SLUGS).flat();

describe("tour Act registry", () => {
  it("has exactly six Acts with the expected stable ids", () => {
    expect(acts.length).toBe(6);
    expect(acts.map((a) => a.id)).toEqual(ACT_IDS);
  });

  it("curated ACT_SLUGS has no duplicate slug across Acts", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const slug of curatedSlugs) {
      if (seen.has(slug)) dupes.push(slug);
      seen.add(slug);
    }
    expect(dupes).toEqual([]);
  });

  it("every curated slug exists in the live catalog (no ghosts)", () => {
    const ghosts = curatedSlugs.filter((slug) => !visibleSet.has(slug));
    expect(ghosts).toEqual([]);
  });

  it("CATEGORY_FALLBACK covers all 8 SliceCategory values", () => {
    // actForSlug resolves to a defined Act for a fabricated slug in every
    // category — proving the fallback map is total (no category can orphan).
    for (const category of ALL_CATEGORIES) {
      const fake = {
        slug: `__nonexistent_${category}__`,
        category,
      } as Parameters<typeof actForSlug>[0];
      const id = actForSlug(fake);
      expect(ACT_IDS).toContain(id);
    }
  });

  it("every visible catalog slug lands in exactly one Act (no orphan, no dupe)", () => {
    const counts = new Map<string, number>();
    for (const act of acts) {
      for (const s of act.sliceSlugs) {
        counts.set(s.slug, (counts.get(s.slug) ?? 0) + 1);
      }
    }
    // total: every visible slug is placed
    const placedOnce = visibleSlices.filter((s) => counts.get(s.slug) === 1);
    expect(placedOnce.length).toBe(visibleSlices.length);
    // disjoint: no slug appears in more than one Act
    const multi = [...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k);
    expect(multi).toEqual([]);
    // no ghost slug in any Act
    const ghosts = [...counts.keys()].filter((slug) => !visibleSet.has(slug));
    expect(ghosts).toEqual([]);
  });

  it("the union of Act slice slugs equals the visible catalog set", () => {
    const placed = new Set(acts.flatMap((a) => a.sliceSlugs.map((s) => s.slug)));
    expect(placed.size).toBe(visibleSet.size);
    for (const slug of visibleSet) expect(placed.has(slug)).toBe(true);
  });

  it("every KEY_GATED catalog slug renders liveMount:false and no other slug does", () => {
    const placed = acts.flatMap((a) => a.sliceSlugs);
    for (const s of placed) {
      expect(s.liveMount).toBe(!isKeyGated(s.slug));
    }
    // every key-gated slug that is in the visible catalog is actually placed
    for (const slug of KEY_GATED_SLUGS) {
      if (!visibleSet.has(slug)) continue;
      const entry = placed.find((s) => s.slug === slug);
      expect(entry, `key-gated slug ${slug} must appear in an Act`).toBeDefined();
      expect(entry?.liveMount).toBe(false);
    }
    // no liveMount:false leaks for a non-key-gated slug
    const wrongGated = placed
      .filter((s) => !s.liveMount && !isKeyGated(s.slug))
      .map((s) => s.slug);
    expect(wrongGated).toEqual([]);
  });
});
