// @vitest-environment node
import { expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

/** User-facing sources that tell readers how to install slices.
 *  `npx rr` resolves on npm to an unrelated package (jprichardson/rr) and
 *  fails with "could not determine executable to run" — the real bins are
 *  rahman-resources / resources / rr, and only the scoped name is safe to
 *  type after `npx`. History (docs/**, lib/content/changelog/**) is exempt. */
const SOURCES = [
  "lib/agent-prompt.ts",
  "lib/slice-agent-prompt.ts",
  "lib/content/slices.ts",
  "lib/content/best-practices.ts",
  "lib/preview/ai-tools.ts",
  "lib/templates/configs.ts",
  "components/site/features-grid.tsx",
  "components/templates/_shared/admin-panel/AdminFeatureCard.tsx",
  "components/templates/_shared/headless/onboarding-steps.tsx",
  "components/templates/_shared/headless/site-setup-wizard.tsx",
  "app/llms.txt/route.ts",
  "app/admin/registry/page.tsx",
  "app/preview/slices/payment/page.tsx",
];

it("never tells users to run npx rr", () => {
  for (const file of SOURCES) {
    expect(existsSync(file), `${file} missing — update the source list`).toBe(true);
    const text = readFileSync(file, "utf8");
    expect(text.match(/\bnpx rr\b/g) ?? [], `${file} still hints npx rr`).toEqual([]);
  }
});

it("resolves every slice previewPath to a real preview route", () => {
  const catalog = readFileSync("lib/content/slices.ts", "utf8");
  const paths = [...catalog.matchAll(/previewPath:\s*"([^"]+)"/g)].map((m) => m[1]);
  expect(paths.length).toBeGreaterThan(10);
  for (const path of paths) {
    expect(path.startsWith("/preview/"), `${path} is not a /preview route`).toBe(true);
    const route = `app${path}/page.tsx`;
    expect(existsSync(route), `${path} has no ${route}`).toBe(true);
  }
});
