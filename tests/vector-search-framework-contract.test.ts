// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-vector-search-"));
  targets.push(dir);
  return dir;
}
function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: process.cwd(), encoding: "utf8",
  });
}
afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("vector-search framework distribution", () => {
  it("uses one truthful framework-neutral adapter contract for React default and explicit SvelteKit", () => {
    const manifest = JSON.parse(readFileSync("packages/cli/lib/manifest.json", "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "vector-search");
    expect(slice.slicePath).toBe("frontend/slices/vector-search");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.convexPaths ?? []).toEqual([]);
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/vector-search",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: [], shadcn: [] },
    });

    const react = runCli("add", "vector-search", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/vector-search →");
    expect(react.stdout).not.toContain("convex/features/search");
    expect(react.stdout).not.toContain("OPENAI_API_KEY");
    expect(react.stdout).not.toContain("@convex-dev/vector-search");

    const svelte = runCli("add", "vector-search", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/vector-search →");
    expect(svelte.stdout).not.toContain("svelte@^5");
    expect(svelte.stdout).not.toContain("react@");
    expect(svelte.stdout).not.toContain("next@");
    expect(svelte.stdout).not.toContain("npx shadcn@latest add");
  });

  it("removes the React placeholder and keeps the shipped TypeScript source framework-neutral", () => {
    expect(existsSync("frontend/slices/vector-search/components/search-page.tsx")).toBe(false);
    const source = ["config.ts", "index.ts", "lib/tools.ts"]
      .map((file) => readFileSync(`frontend/slices/vector-search/${file}`, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("defineFeature");
    expect(source).not.toContain('from "@/shared/agentic"');
    expect(source).toContain('from "@/shared/agentic/define"');
    expect(source).toContain('from "@/shared/agentic/schema"');
  });
});
