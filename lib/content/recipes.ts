// Recipes registry — DEPRECATED. All recipes migrated to lib/content/slices.ts
// (Phase 3 of docs/REFACTOR-PLAN.md, 2026-05-12).
//
// Kept as empty array + type for back-compat with existing imports
// (sitemap, llms.txt, sidebar, command-palette, admin export, hero,
// knowledge API). Routes redirect /recipes/<slug> → /slices/<slug>.
//
// REMOVE in Phase 6 after CI structural-check lands.

export type RecipeEntry = {
  slug: string;
  title: string;
  description: string;
  source: string;
  repoPath: string;
  files: string[];
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
};

export const recipes: RecipeEntry[] = [];

export function getRecipe(_slug: string): RecipeEntry | null {
  return null;
}
