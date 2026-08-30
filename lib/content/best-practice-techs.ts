// Current best-practice technology profiles used by /best-practice and its
// generated AI prompt. Keep version facts and official docs in ONE place.
//
// Versions were verified against the npm registry on 2026-08-31. They are a
// dated snapshot, not an evergreen claim; refresh this file when the docs are
// reviewed again.

export type BestPracticeTechId = "nextjs" | "svelte" | "convex";
export type FrontendTechId = "nextjs" | "svelte";

export type BestPracticeSelection = {
  frontend: FrontendTechId;
  convex: boolean;
};

export type BestPracticeTech = {
  id: BestPracticeTechId;
  label: string;
  version: string;
  summary: string;
  companions: readonly string[];
  docs: readonly { label: string; url: string }[];
};

export const BEST_PRACTICE_DOCS_REVIEWED = "2026-08-31";

export const BEST_PRACTICE_TECHS: Record<BestPracticeTechId, BestPracticeTech> = {
  nextjs: {
    id: "nextjs",
    label: "Next.js",
    version: "16.3.3",
    summary: "App Router + React Server Components + Cache Components",
    companions: ["React 19.2.8", "React DOM 19.2.8", "Tailwind CSS 4.3.3"],
    docs: [
      { label: "Next.js docs", url: "https://nextjs.org/docs" },
      { label: "Next.js 16.3", url: "https://nextjs.org/blog/next-16-3" },
    ],
  },
  svelte: {
    id: "svelte",
    label: "Svelte",
    version: "5.57.0",
    summary: "Svelte 5 Runes + SvelteKit",
    companions: [
      "SvelteKit 2.70.3",
      "shadcn-svelte 1.5.1",
      "Tailwind CSS 4.3.3",
      "Vite 8.2.2",
      "TypeScript 6.0.3 (latest SvelteKit-compatible)",
    ],
    docs: [
      { label: "Svelte AI docs", url: "https://svelte.dev/docs/ai/overview" },
      { label: "Svelte Runes", url: "https://svelte.dev/docs/svelte/what-are-runes" },
      { label: "SvelteKit docs", url: "https://svelte.dev/docs/kit" },
      { label: "shadcn-svelte", url: "https://www.shadcn-svelte.com/docs/installation/sveltekit" },
    ],
  },
  convex: {
    id: "convex",
    label: "Convex",
    version: "1.45.0",
    summary: "Reactive backend; framework adapter follows the selected frontend",
    companions: ["convex-svelte 0.14.0 when Svelte is active"],
    docs: [
      { label: "Convex docs", url: "https://docs.convex.dev/" },
      { label: "Convex + Svelte", url: "https://docs.convex.dev/quickstart/svelte" },
    ],
  },
};

export const DEFAULT_BEST_PRACTICE_SELECTION: BestPracticeSelection = {
  frontend: "nextjs",
  convex: true,
};

export function activeBestPracticeTechs(selection: BestPracticeSelection): BestPracticeTechId[] {
  return selection.convex ? [selection.frontend, "convex"] : [selection.frontend];
}

export function bestPracticeSelectionKey(selection: BestPracticeSelection): string {
  return `${selection.frontend}${selection.convex ? "+convex" : ""}`;
}

export function appliesToSelection(
  appliesTo: readonly BestPracticeTechId[] | undefined,
  selection: BestPracticeSelection,
): boolean {
  if (!appliesTo?.length) return true;
  const active = new Set(activeBestPracticeTechs(selection));
  return appliesTo.every((id) => active.has(id));
}
