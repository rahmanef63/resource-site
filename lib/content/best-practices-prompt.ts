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
        const badge = r.tier ? `[${r.tier}] ` : "";
        const lines = [`- **${badge}${r.title}** — ${r.rule}`];
        if (r.why) lines.push(`  - Why: ${r.why}`);
        return lines.join("\n");
      })
      .join("\n");
    const tier = section.tier ? ` (${section.tier})` : "";
    const intro = section.intro ? `\n${section.intro}\n` : "";
    return `## ${section.title}${tier}${intro}\n${rules}`;
  }).join("\n\n");

  return `You are coding inside a project that follows Rahman Resources (rr) conventions. Honor every rule below for every file you write or edit.

Every rule carries a tier — **P0** (security & data integrity, never violate), **P1** (architecture, violate only with a \`// TODO(rr): …\` marker + commit-body note), **P2** (style, tooling-enforced). When two rules conflict, the higher tier wins. When you can't ask the user mid-task: take the recommended option, mark \`// TODO(rr): confirm — chose X over Y because …\`, and continue. Never silently guess. If a P0 conflicts with the task itself, STOP and report — do not route around P0.

# rr conventions (single source of truth)

${sections}

---

# Agent protocol

1. BEFORE writing code: scan whether the change crosses a rule; follow it even if unasked.
2. BEFORE adding a dependency: check the rr catalog (\`npx rr list\` or /slices) first.
3. BEFORE a new feature: does it belong in \`slices/<slug>/\` (+ \`convex/features/<slug>/\`)?
4. AFTER editing: \`npx tsc --noEmit\` + relevant \`npm run validate:*\` / \`audit:*\`.
5. When proposing changes, STATE which rules they honor — e.g. "Using \`requireAdmin\` per 'server-side authz'; indexed via \`.withIndex\` per 'no bare .collect()'."
6. Existing code violating a rule: point it out, fix ONLY if asked (scope-creep guard).
7. Blocked on a decision and can't ask: take the recommended option, mark \`// TODO(rr): …\`, list it in the commit body.
8. P0 conflict with the task itself: stop and report; do not route around P0.`;
}
