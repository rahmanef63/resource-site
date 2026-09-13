// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const manifestPath = "packages/cli/lib/manifest.json";
const originalManifest = readFileSync(manifestPath, "utf8");
const tempDirs: string[] = [];

function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function installFrameworkFixture() {
  const manifest = JSON.parse(originalManifest);
  manifest.slices.push({
    slug: "framework-fixture",
    title: "Framework fixture",
    category: "ui",
    kind: "ui",
    version: "1.0.0",
    description: "Fixture for framework distribution selection.",
    source: "test",
    slicePath: "frontend/slices/framework-fixture",
    frameworks: {
      "react-next": { path: "frontend/slices/framework-fixture" },
      "svelte-sveltekit": {
        path: "frontend/slices/framework-fixture-svelte",
        deps: {
          npm: ["svelte@^5"],
          sharedFiles: ["lib/shared/theme-presets/apply.ts"],
        },
      },
    },
    defaultFramework: "react-next",
    convexPaths: [],
    npm: ["react@^19"],
    sharedFiles: ["lib/shared/agentic/index.ts"],
    shadcn: [],
    env: [],
    peers: [],
    providers: [],
    tags: [],
    agentRecipe: "",
  });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

afterEach(() => {
  writeFileSync(manifestPath, originalManifest);
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("framework-aware slice distribution", () => {
  it("generates legacy React/Next framework metadata without changing slicePath", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "ai-core");

    expect(slice.slicePath).toBe("frontend/slices/ai-core");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toMatchObject({
      "react-next": { path: "frontend/slices/ai-core" },
    });
  });

  it("keeps full-width-toggle on React by default and selects its SvelteKit source deterministically", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "full-width-toggle");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/full-width-toggle");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/full-width-toggle" },
      "svelte-sveltekit": {
        path: "frontend/slices/full-width-toggle-svelte",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: ["svelte@^5"], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "full-width-toggle", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/full-width-toggle →");
    expect(defaultResult.stdout).toContain("lucide-react");
    expect(defaultResult.stdout).toContain("shadcn: button");

    const svelteResult = runCli("add", "full-width-toggle", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/full-width-toggle-svelte →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add button");
  });

  it("keeps feedback-states on React by default and selects its SvelteKit source deterministically", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "feedback-states");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/feedback-states");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/feedback-states" },
      "svelte-sveltekit": {
        path: "frontend/slices/feedback-states-svelte",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: ["svelte@^5"], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "feedback-states", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/feedback-states →");

    const svelteResult = runCli("add", "feedback-states", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/feedback-states-svelte →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add button");
  });

  it("keeps start-here on React by default and selects its SvelteKit source deterministically", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "start-here");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/start-here");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/start-here" },
      "svelte-sveltekit": {
        path: "frontend/slices/start-here-svelte",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: ["svelte@^5"], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "start-here", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/start-here →");
    expect(defaultResult.stdout).toContain("lucide-react");

    const svelteResult = runCli("add", "start-here", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/start-here-svelte →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add button");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add scroll-area");
  });

  it("keeps seo on the shared service source for explicit SvelteKit without invented UI deps", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "seo");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/seo");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/seo" },
      "svelte-sveltekit": {
        path: "frontend/slices/seo",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: [], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "seo", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/seo →");

    const svelteResult = runCli("add", "seo", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/seo →");
    expect(svelteResult.stdout).not.toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps audit-log on one framework-neutral backend source for explicit SvelteKit", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "audit-log");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/audit-log");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/audit-log" },
      "svelte-sveltekit": {
        path: "frontend/slices/audit-log",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: [], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "audit-log", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/audit-log →");

    const svelteResult = runCli("add", "audit-log", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/audit-log →");
    expect(svelteResult.stdout).not.toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("react");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps rate-limit on one framework-neutral backend source for explicit SvelteKit", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "rate-limit");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/rate-limit");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.convexPaths).toEqual(["convex/features/rate_limit"]);
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/rate-limit" },
      "svelte-sveltekit": {
        path: "frontend/slices/rate-limit",
        aliases: ["svelte", "sveltekit"],
      },
    });

    const defaultResult = runCli("add", "rate-limit", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/rate-limit →");
    expect(defaultResult.stdout).toContain("convex/features/rate_limit →");
    expect(defaultResult.stdout).toContain("convex@^1.16.0");

    const svelteResult = runCli("add", "rate-limit", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/rate-limit →");
    expect(svelteResult.stdout).toContain("convex/features/rate_limit →");
    expect(svelteResult.stdout).toContain("convex@^1.16.0");
    expect(svelteResult.stdout).not.toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("react");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps marketing-chrome on React by default and selects its native SvelteKit distribution over shared chrome semantics", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "marketing-chrome");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/marketing-chrome");
    expect(slice.defaultFramework).toBe("react-next");
    const svelte = slice.frameworks["svelte-sveltekit"];
    expect(svelte.path).toBe("frontend/slices/marketing-chrome-svelte");
    expect(svelte.aliases).toEqual(["svelte", "sveltekit"]);
    expect(svelte.deps.npm).toEqual(["svelte@^5"]);
    expect(svelte.deps.shadcn).toEqual([]);
    expect(svelte.deps.sharedFiles).toEqual([
      "frontend/slices/marketing-chrome/lib/core.ts",
      "frontend/slices/marketing-chrome/lib/tools.ts",
    ]);

    const defaultResult = runCli("add", "marketing-chrome", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/marketing-chrome →");
    expect(slice.npm).toContain("lucide-react@^0.400.0");
    expect(defaultResult.stdout).toContain("shadcn: button sheet separator");

    const svelteResult = runCli("add", "marketing-chrome", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/marketing-chrome-svelte →");
    expect(svelteResult.stdout).toContain("frontend/slices/marketing-chrome/lib/core.ts →");
    expect(svelteResult.stdout).toContain("frontend/slices/marketing-chrome/lib/tools.ts →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("shadcn: button");
    expect(svelteResult.stdout).not.toContain("react@^18");
    expect(svelteResult.stdout).not.toContain("next@^15");
  });

  it("keeps rbac-roles on React by default and selects its native SvelteKit distribution over the same RBAC engine", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "rbac-roles");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/rbac-roles");
    expect(slice.defaultFramework).toBe("react-next");
    const svelte = slice.frameworks["svelte-sveltekit"];
    expect(svelte.path).toBe("frontend/slices/rbac-roles-svelte");
    expect(svelte.aliases).toEqual(["svelte", "sveltekit"]);
    expect(svelte.deps.npm).toEqual(["svelte@^5"]);
    expect(svelte.deps.shadcn).toEqual([]);
    expect(svelte.deps.sharedFiles).toEqual([
      "frontend/slices/rbac-roles/lib/permissions.ts",
      "frontend/slices/rbac-roles/lib/roles.ts",
      "frontend/slices/rbac-roles/lib/check.ts",
      "frontend/slices/rbac-roles/lib/permission-catalog.ts",
      "frontend/slices/rbac-roles/lib/api.ts",
      "frontend/slices/rbac-roles/lib/tools.ts",
    ]);

    const defaultResult = runCli("add", "rbac-roles", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/rbac-roles →");
    expect(defaultResult.stdout).toContain("convex/features/rbac_roles → convex/features/rbac_roles");
    expect(defaultResult.stdout).toContain("shadcn: badge checkbox label");

    const svelteResult = runCli("add", "rbac-roles", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/rbac-roles-svelte →");
    expect(svelteResult.stdout).toContain("convex/features/rbac_roles → convex/features/rbac_roles");
    expect(svelteResult.stdout).toContain("frontend/slices/rbac-roles/lib/api.ts →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("shadcn: badge");
    expect(svelteResult.stdout).not.toContain("react");
    expect(svelteResult.stdout).not.toContain("next");
  });

  it("keeps ai-core on React by default and selects its native SvelteKit distribution over shared portable cores", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "ai-core");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/ai-core");
    expect(slice.defaultFramework).toBe("react-next");
    const svelte = slice.frameworks["svelte-sveltekit"];
    expect(svelte.path).toBe("frontend/slices/ai-core-svelte");
    expect(svelte.aliases).toEqual(["svelte", "sveltekit"]);
    expect(svelte.deps.npm).toEqual(["svelte@^5"]);
    expect(svelte.deps.shadcn).toEqual([]);
    expect(svelte.deps.sharedFiles).toEqual([
      "frontend/slices/ai-core/lib/format.ts",
      "frontend/slices/ai-core/lib/error-core.ts",
      "frontend/slices/ai-core/lib/theme.ts",
    ]);

    const defaultResult = runCli("add", "ai-core", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/ai-core →");
    expect(defaultResult.stdout).toContain("lucide-react");

    const svelteResult = runCli("add", "ai-core", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/ai-core-svelte →");
    expect(svelteResult.stdout).toContain("frontend/slices/ai-core/lib/error-core.ts →");
    expect(svelteResult.stdout).toContain("frontend/slices/ai-core/lib/theme.ts →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("react@^18");
    expect(svelteResult.stdout).not.toContain("next@^15");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps activity on React by default and selects its native SvelteKit distribution with the same Convex backend", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "activity");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/activity");
    expect(slice.defaultFramework).toBe("react-next");
    const svelte = slice.frameworks["svelte-sveltekit"];
    expect(svelte.path).toBe("frontend/slices/activity-svelte");
    expect(svelte.aliases).toEqual(["svelte", "sveltekit"]);
    expect(svelte.deps.npm).toEqual(["svelte@^5", "convex@^1.17"]);
    expect(svelte.deps.shadcn).toEqual([]);
    expect(svelte.deps.sharedFiles).toEqual([
      "frontend/slices/activity/config.ts",
      "frontend/slices/activity/lib/types.ts",
      "frontend/slices/activity/lib/format.ts",
      "frontend/slices/activity/lib/grouping.ts",
      "frontend/slices/activity/lib/defaults.ts",
      "frontend/slices/activity/lib/stats.ts",
      "frontend/slices/activity/lib/tools.ts",
    ]);

    const defaultResult = runCli("add", "activity", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/activity →");
    expect(defaultResult.stdout).toContain("convex/features/activity →");
    expect(defaultResult.stdout).toContain("lucide-react");
    expect(defaultResult.stdout).toContain("next@^15");

    const svelteResult = runCli("add", "activity", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/activity-svelte →");
    expect(svelteResult.stdout).toContain("convex/features/activity →");
    expect(svelteResult.stdout).toContain("frontend/slices/activity/lib/stats.ts →");
    expect(svelteResult.stdout).toContain("frontend/slices/activity/lib/tools.ts →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).toContain("convex@^1.17");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("next@^15");
    expect(svelteResult.stdout).not.toContain("react@^18");
  });

  it("keeps content-loops on React by default and selects its native SvelteKit distribution", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "content-loops");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/content-loops");
    expect(slice.defaultFramework).toBe("react-next");
    const svelte = slice.frameworks["svelte-sveltekit"];
    expect(svelte.path).toBe("frontend/slices/content-loops-svelte");
    expect(svelte.aliases).toEqual(["svelte", "sveltekit"]);
    expect(svelte.deps.npm).toEqual(["svelte@^5"]);
    expect(svelte.deps.shadcn).toEqual([]);
    expect(svelte.deps.sharedFiles).toEqual([
      "frontend/slices/content-loops/lib/types.ts",
      "frontend/slices/content-loops/lib/registry.ts",
      "frontend/slices/content-loops/lib/mock-source.ts",
      "frontend/slices/content-loops/lib/pagination.ts",
      "frontend/slices/content-loops/lib/variants.ts",
    ]);

    const defaultResult = runCli("add", "content-loops", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/content-loops →");
    expect(defaultResult.stdout).toContain("shadcn: button");

    const svelteResult = runCli("add", "content-loops", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/content-loops-svelte →");
    expect(svelteResult.stdout).toContain("frontend/slices/content-loops/lib/pagination.ts →");
    expect(svelteResult.stdout).toContain("frontend/slices/content-loops/lib/variants.ts →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
    expect(svelteResult.stdout).not.toContain("react");
  });

  it("keeps quicklinks on React by default and selects its native SvelteKit distribution", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "quicklinks");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/quicklinks");
    expect(slice.defaultFramework).toBe("react-next");
    const svelte = slice.frameworks["svelte-sveltekit"];
    expect(svelte.path).toBe("frontend/slices/quicklinks-svelte");
    expect(svelte.aliases).toEqual(["svelte", "sveltekit"]);
    expect(svelte.deps.npm).toEqual(["svelte@^5"]);
    expect(svelte.deps.shadcn).toEqual([]);
    expect(svelte.deps.sharedFiles).toEqual(["frontend/slices/quicklinks/lib/core.ts"]);

    const defaultResult = runCli("add", "quicklinks", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/quicklinks →");
    expect(defaultResult.stdout).toContain("lucide-react");

    const svelteResult = runCli("add", "quicklinks", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/quicklinks-svelte →");
    expect(svelteResult.stdout).toContain("frontend/slices/quicklinks/lib/core.ts →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps publisher-clean-html on React by default and shares its core with SvelteKit", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "publisher-clean-html");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/publisher-clean-html");
    expect(slice.defaultFramework).toBe("react-next");
    const svelte = slice.frameworks["svelte-sveltekit"];
    expect(svelte.path).toBe("frontend/slices/publisher-clean-html-svelte");
    expect(svelte.aliases).toEqual(["svelte", "sveltekit"]);
    expect(svelte.deps.npm).toEqual(["svelte@^5"]);
    expect(svelte.deps.shadcn).toEqual([]);
    expect(svelte.deps.sharedFiles).toHaveLength(16);
    expect(svelte.deps.sharedFiles.every((file: string) => file.startsWith("frontend/slices/publisher-clean-html/lib/"))).toBe(true);

    const defaultResult = runCli("add", "publisher-clean-html", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/publisher-clean-html →");
    expect(defaultResult.stdout).not.toContain("svelte@^5");

    const svelteResult = runCli("add", "publisher-clean-html", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/publisher-clean-html-svelte →");
    expect(svelteResult.stdout).toContain("frontend/slices/publisher-clean-html/lib/publish-page.ts →");
    expect(svelteResult.stdout).toContain("frontend/slices/publisher-clean-html/lib/sanitize/runtime.ts →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps broadcast-channel-sync on React by default and selects its Svelte store distribution", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "broadcast-channel-sync");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/broadcast-channel-sync");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/broadcast-channel-sync" },
      "svelte-sveltekit": {
        path: "frontend/slices/broadcast-channel-sync-svelte",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: [], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "broadcast-channel-sync", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/broadcast-channel-sync →");

    const svelteResult = runCli("add", "broadcast-channel-sync", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/broadcast-channel-sync-svelte →");
    expect(svelteResult.stdout).not.toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("react");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps testimonials on one framework-neutral backend source for explicit SvelteKit", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "testimonials");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/testimonials");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.convexPaths).toEqual(["convex/features/testimonials"]);
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/testimonials" },
      "svelte-sveltekit": { path: "frontend/slices/testimonials", aliases: ["svelte", "sveltekit"] },
    });

    const defaultResult = runCli("add", "testimonials", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/testimonials →");
    expect(defaultResult.stdout).toContain("convex/features/testimonials →");
    expect(defaultResult.stdout).toContain("convex@^1.16.0");

    const svelteResult = runCli("add", "testimonials", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/testimonials →");
    expect(svelteResult.stdout).toContain("convex/features/testimonials →");
    expect(svelteResult.stdout).toContain("convex@^1.16.0");
    expect(svelteResult.stdout).not.toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("react");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps services on one framework-neutral backend source for explicit SvelteKit", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "services");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/services");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.convexPaths).toEqual(["convex/features/services"]);
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/services" },
      "svelte-sveltekit": {
        path: "frontend/slices/services",
        aliases: ["svelte", "sveltekit"],
      },
    });

    const defaultResult = runCli("add", "services", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/services →");
    expect(defaultResult.stdout).toContain("convex/features/services →");
    expect(defaultResult.stdout).toContain("convex@^1.16.0");

    const svelteResult = runCli("add", "services", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/services →");
    expect(svelteResult.stdout).toContain("convex/features/services →");
    expect(svelteResult.stdout).toContain("convex@^1.16.0");
    expect(svelteResult.stdout).not.toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("react");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps booking on React by default and selects its real SvelteKit UI distribution", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "booking");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/booking");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/booking" },
      "svelte-sveltekit": {
        path: "frontend/slices/booking-svelte",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: ["svelte@^5"], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "booking", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/booking →");
    expect(defaultResult.stdout).toContain("lucide-react");

    const svelteResult = runCli("add", "booking", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/booking-svelte →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps selection on React by default and selects its SvelteKit source deterministically", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "selection");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/selection");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/selection" },
      "svelte-sveltekit": {
        path: "frontend/slices/selection-svelte",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: ["svelte@^5"], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "selection", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/selection →");

    const svelteResult = runCli("add", "selection", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/selection-svelte →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("react-dom");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("keeps file-upload on the real React source by default and selects its SvelteKit source deterministically", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "file-upload");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/file-upload");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/file-upload" },
      "svelte-sveltekit": {
        path: "frontend/slices/file-upload-svelte",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: ["svelte@^5"], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "file-upload", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/file-upload →");
    expect(defaultResult.stdout).toContain("lucide-react");

    const svelteResult = runCli("add", "file-upload", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/file-upload-svelte →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("lucide-react");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add");
  });

  it("uses the default framework path and forwards an explicit framework through add", () => {
    installFrameworkFixture();
    const target = mkTarget();

    const defaultResult = runCli("add", "framework-fixture", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/framework-fixture →");
    expect(defaultResult.stdout).toContain("lib/shared/agentic/index.ts →");
    expect(defaultResult.stdout).not.toContain("lib/shared/theme-presets/apply.ts →");

    const explicitResult = runCli("add", "framework-fixture", "--target", target, "--framework", "svelte-sveltekit", "--dry-run");
    expect(explicitResult.status).toBe(0);
    expect(explicitResult.stdout).toContain("frontend/slices/framework-fixture-svelte →");
    expect(explicitResult.stdout).toContain("lib/shared/theme-presets/apply.ts →");
    expect(explicitResult.stdout).not.toContain("lib/shared/agentic/index.ts →");
    expect(explicitResult.stdout).toContain("svelte@^5");
  });

  it("rejects an explicitly unsupported framework and lists the available choices", () => {
    installFrameworkFixture();
    const result = runCli("lift", "rahman:framework-fixture", "--framework", "solid-start", "--dry-run");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('does not support framework "solid-start"');
    expect(result.stderr).toContain("react-next, svelte-sveltekit");
  });

  it("rejects invalid framework defaults, duplicate aliases, and missing declared paths", () => {
    const dir = path.join(process.cwd(), ".tmp-framework-validation");
    mkdirSync(dir, { recursive: true });
    tempDirs.push(dir);
    const slicePath = path.join(dir, "slice.json");
    writeFileSync(slicePath, JSON.stringify({
      slug: "framework-validation",
      version: "1.0.0",
      category: "ui",
      title: "Framework validation",
      description: "Framework validation fixture.",
      namespace: "@/features/framework-validation",
      frontend: {
        slicePath: "frontend/slices/ai-core",
        defaultFramework: "not-declared",
        frameworks: {
          "react-next": { path: "frontend/slices/ai-core", aliases: ["web"] },
          "svelte-sveltekit": {
            path: "frontend/slices/missing-svelte",
            aliases: ["web"],
            deps: { sharedFiles: ["lib/shared/missing-framework-file.ts"] },
          },
        },
      },
      deps: {},
    }, null, 2));

    const result = spawnSync(process.execPath, ["packages/cli/scripts/validate-slice.mjs", slicePath], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('defaultFramework "not-declared" is not declared');
    expect(result.stderr).toContain('duplicate framework alias "web"');
    expect(result.stderr).toContain("missing on disk: frontend/slices/missing-svelte");
    expect(result.stderr).toContain("deps.sharedFiles path missing on disk: lib/shared/missing-framework-file.ts");
  });
});

function mkTarget() {
  const dir = path.join(os.tmpdir(), `rr-framework-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
