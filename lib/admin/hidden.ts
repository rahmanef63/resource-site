export const HIDDEN_KEY = "catalog-hidden";

export function emitHiddenTs(slugs: readonly string[]): string {
  const body = slugs
    .slice()
    .sort()
    .map((s) => `  ${JSON.stringify(s)},`)
    .join("\n");
  return `// Auto-generated from /admin/* hide toggles. Slugs listed here are hidden
// from public catalogs (slices, layouts, sitemap, llms.txt, build picker).
// Commit this file and wire isHidden(slug) into consumers.
export const hiddenSlugs: readonly string[] = [
${body}
] as const;

export function isHidden(slug: string): boolean {
  return hiddenSlugs.includes(slug);
}
`;
}
