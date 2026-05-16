// Build the one-shot prompt that AI clients (Claude / ChatGPT / Cursor)
// paste at the top of their session to follow rr conventions seamlessly.
//
// Derived from the same BEST_PRACTICES source so docs + prompt stay in
// lockstep — edit one, both refresh.

import { BEST_PRACTICES } from "./best-practices";

export function buildBestPracticesPrompt(): string {
  const sections = BEST_PRACTICES.map((section) => {
    const rules = section.rules
      .map((r) => {
        const lines = [`- **${r.title}** — ${r.rule}`];
        if (r.why) lines.push(`  - Why: ${r.why}`);
        return lines.join("\n");
      })
      .join("\n");
    const intro = section.intro ? `\n${section.intro}\n` : "";
    return `## ${section.title}${intro}\n${rules}`;
  }).join("\n\n");

  return `You are coding inside a project that follows Rahman Resources (rr) conventions. Honor every rule below for every file you write or edit. When in doubt, ask before deviating.

# rr conventions (single source of truth)

${sections}

---

# How to apply

- BEFORE writing code: scan whether the change crosses a rule. If yes, follow the rule even if the user didn't mention it.
- BEFORE introducing a dependency: check whether an rr slice covers it (\`npx rr list slices\` or the catalog at /slices).
- BEFORE adding a new feature: check if it should be a vertical slice under \`frontend/slices/<slug>/\` + \`convex/features/<slug>/\` per the structure rules.
- AFTER editing: run \`npx tsc --noEmit\` and any project-local \`npm run validate:*\` before committing.

# Output format

When you propose a change, state which rules it honors. Example: "I'm using \`requireAdmin\` from \`convex/_shared/auth\` per the 'Server-side authz on every mutation' rule, and indexing the query via \`.withIndex\` per 'No bare .collect()'."

If you find existing code that violates a rule, point it out — but only fix it if the user asks, since the diff may surface scope-creep.`;
}
