import type { ChangelogBullet, ChangelogEntry } from "@/features/changelog-feed";
import { slices } from "@/lib/content/slices";
import { layouts } from "@/lib/content/layouts";

// Slugs that actually resolve to a detail page. A changelog bullet pointing at
// a slug NOT in these sets (renamed, merged, deleted, or not-yet-shipped — e.g.
// the WIP `notion` cluster) would 404; we strip its link and render plain text.
const SLICE_SLUGS = new Set(slices.map((s) => s.slug));
const LAYOUT_SLUGS = new Set(layouts.map((l) => l.slug));

function resolves(b: ChangelogBullet): boolean {
  if (typeof b === "string") return true;
  if (b.href) return true; // explicit/external href — trust it
  if (!b.slug) return true; // already plain text
  return b.kind === "template"
    ? LAYOUT_SLUGS.has(b.slug)
    : SLICE_SLUGS.has(b.slug);
}

function clean(b: ChangelogBullet): ChangelogBullet {
  if (resolves(b)) return b;
  return { text: typeof b === "string" ? b : b.text }; // drop the dead slug
}

/** Strip links to slugs that no longer exist in the catalog so changelog
 *  bullets never point at a 404. Keeps valid slugs (incl. ones that ship
 *  later) linked. */
export function sanitizeEntries(entries: ChangelogEntry[]): ChangelogEntry[] {
  return entries.map((e) => ({
    ...e,
    bullets: e.bullets?.map(clean),
    groups: e.groups?.map((g) => ({ ...g, bullets: g.bullets.map(clean) })),
  }));
}
