// Slugs hidden from public catalogs (slices, layouts, sitemap, llms.txt,
// build picker). Maintained via /admin/registry + /admin/layouts hide toggles
// — export the file from there and commit. `isHidden(slug)` is the canonical
// filter; call it on any list of slugs surfaced publicly.
export const hiddenSlugs: readonly string[] = [] as const;

export function isHidden(slug: string): boolean {
  return hiddenSlugs.includes(slug);
}
