import { describe, expect, it } from "vitest";
import { buildBestPracticesPrompt, bestPracticesForSelection } from "@/lib/content/best-practices-prompt";
import { BEST_PRACTICE_TECHS } from "@/lib/content/best-practice-techs";

describe("best-practice technology profiles", () => {
  it("keeps Next-only guidance free of Svelte and Convex-only rules", () => {
    const prompt = buildBestPracticesPrompt({ frontend: "nextjs", convex: false });
    expect(prompt).toContain(`Next.js ${BEST_PRACTICE_TECHS.nextjs.version}`);
    expect(prompt).toContain("proxy.ts not middleware.ts");
    expect(prompt).toContain("ROOT `slices/<slug>/`");
    expect(prompt).toContain("dynamic `[slug]` route");
    expect(prompt).not.toContain("Runes for all new reactivity");
    expect(prompt).not.toContain("Validators on every public function");
    expect(prompt).not.toContain("convex-svelte");
  });

  it("builds Svelte + Convex from shared rules without leaking Next-only syntax", () => {
    const prompt = buildBestPracticesPrompt({ frontend: "svelte", convex: true });
    expect(prompt).toContain(`Svelte ${BEST_PRACTICE_TECHS.svelte.version}`);
    expect(prompt).toContain(`Convex ${BEST_PRACTICE_TECHS.convex.version}`);
    expect(prompt).toContain("Svelte 5 Runes");
    expect(prompt).toContain("convex-svelte");
    expect(prompt).toContain("Bun only");
    expect(prompt).toContain("Validators on every public function");
    expect(prompt).not.toContain("proxy.ts not middleware.ts");
    expect(prompt).not.toContain("NEXT_PUBLIC_ only for non-sensitive values");
  });

  it("filters docs with the same applicability logic as prompts", () => {
    const svelte = bestPracticesForSelection({ frontend: "svelte", convex: false });
    const ids = svelte.map((section) => section.id);
    expect(ids).toContain("svelte-app");
    expect(ids).toContain("dynamic-pages");
    expect(ids).not.toContain("next-app");
    expect(ids).not.toContain("convex");
  });
});
