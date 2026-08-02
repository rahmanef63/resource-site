import aliases from "./slice-aliases.json";

/** Superseded slug → umbrella slice that absorbed it (UX wave U3).
 *
 *  The seven landing-page section slices were merged into
 *  `landing-sections` as variants; their slugs stay installable
 *  (CLI resolves through `manifest.aliases`, generated from the
 *  same JSON) and their detail URLs redirect. SSOT:
 *  lib/content/slice-aliases.json — read by both this module and
 *  packages/cli/scripts/gen-manifest.mjs. */
export const SLUG_ALIASES: Record<string, string> = aliases;

export function resolveSlugAlias(slug: string): string | undefined {
  return SLUG_ALIASES[slug];
}
