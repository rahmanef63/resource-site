// One-shot prompt builder for /best-practice. The doctrine, technology facts,
// docs links, and selector state stay separate so four profiles do not become
// four copy-pasted prompts.

import { BEST_PRACTICES, type BestPracticeSection } from "./best-practices";
import {
  BEST_PRACTICE_DOCS_REVIEWED,
  BEST_PRACTICE_TECHS,
  DEFAULT_BEST_PRACTICE_SELECTION,
  activeBestPracticeTechs,
  appliesToSelection,
  type BestPracticeSelection,
} from "./best-practice-techs";

export function bestPracticesForSelection(selection: BestPracticeSelection): BestPracticeSection[] {
  return BEST_PRACTICES.flatMap((section) => {
    if (!appliesToSelection(section.appliesTo, selection)) return [];
    const rules = section.rules.filter((rule) => appliesToSelection(rule.appliesTo, selection));
    return rules.length ? [{ ...section, rules }] : [];
  });
}

export function buildBestPracticesPrompt(
  selection: BestPracticeSelection = DEFAULT_BEST_PRACTICE_SELECTION,
): string {
  const active = activeBestPracticeTechs(selection).map((id) => BEST_PRACTICE_TECHS[id]);
  const profile = active
    .map((tech) => `${tech.label} ${tech.version}${tech.companions.length ? ` (${tech.companions.join(", ")})` : ""}`)
    .join(" + ");
  const docs = active
    .flatMap((tech) => tech.docs.map((doc) => `- ${doc.label}: ${doc.url}`))
    .join("\n");
  const sections = bestPracticesForSelection(selection).map(renderSection).join("\n\n");
  const packageProtocol = selection.frontend === "svelte"
    ? "Use Bun only: bun install / bun add / bunx / bun run. Do not create npm, pnpm, or yarn lockfiles."
    : "Respect the repository's committed package manager and lockfile; do not introduce a second package manager.";
  const svelteGuard = selection.frontend === "svelte"
    ? "\nSvelte guard: all new Svelte code uses Svelte 5 Runes and modern event/snippet syntax. No new `$:`, `export let`, `on:click`, `createEventDispatcher`, or `<slot>`."
    : "";
  const convexGuard = selection.convex
    ? "\nConvex guard: public functions validate args; user-owned writes authorize server-side; growing reads are indexed and bounded/paginated."
    : "";

  return `You are coding inside a project that follows Rahman Resources (rr) conventions. Honor every active rule below for every file you write or edit.

# Active technology profile

${profile}
Docs reviewed: ${BEST_PRACTICE_DOCS_REVIEWED}

Official references used by this profile:
${docs}

${packageProtocol}${svelteGuard}${convexGuard}

Architecture invariant: consumer feature code lives in ROOT \`slices/<slug>/\` vertical slices. Route/page files are thin adapters. Repeated page families use one dynamic \`[slug]\` route backed by a typed registry/data SSOT. Preserve DRY + SSOT; never create compatibility placeholder files just to keep obsolete imports alive.

Every rule carries a tier — **P0** (security & data integrity, never violate), **P1** (architecture, violate only with a \`// TODO(rr): …\` marker + commit-body note), **P2** (style, tooling-enforced). Higher tier wins. If a P0 conflicts with the task itself, STOP and report; do not route around it.

# rr conventions — filtered for this profile

${sections}

---

# Agent protocol

1. Before writing: read the active official docs above when an API or syntax may have changed.
2. Before adding a dependency: search existing shared primitives/slices and the rr catalog first.
3. New feature UI belongs in \`slices/<slug>/\`; framework routes only adapt params/data and render the barrel export.
4. Repeated pages: use one dynamic route + registry/data SSOT, then derive nav/breadcrumb/sitemap where applicable.
5. After editing: run the active framework type/check command, lint, relevant tests/audits, and production build.
6. Verify real behavior in a browser at mobile and desktop sizes; typecheck alone is not proof.
7. State which P0/P1 rules the implementation honors. Existing out-of-scope violations should be reported, not silently expanded into scope.
8. Never claim a deploy succeeded from an old alias response; verify the provider deployment state and exact source commit.`;
}

function renderSection(section: BestPracticeSection): string {
  const tier = section.tier ? ` (${section.tier})` : "";
  const intro = section.intro ? `\n${section.intro}\n` : "";
  const rules = section.rules.map((rule) => {
    const badge = rule.tier ? `[${rule.tier}] ` : "";
    const lines = [`- **${badge}${rule.title}** — ${rule.rule}`];
    if (rule.why) lines.push(`  - Why: ${rule.why}`);
    return lines.join("\n");
  }).join("\n");
  return `## ${section.title}${tier}${intro}\n${rules}`;
}
