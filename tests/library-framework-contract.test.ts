// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-library-"));
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

describe("library framework distribution", () => {
  it("keeps React/Next default and selects native Svelte over the same Convex backend/core", () => {
    const manifest = JSON.parse(readFileSync("packages/cli/lib/manifest.json", "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "library");
    expect(slice.slicePath).toBe("frontend/slices/library");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.convexPaths).toEqual(["convex/features/library"]);
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/library-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5", "convex@^1.17"], shadcn: [] },
    });

    const react = runCli("add", "library", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/library →");
    expect(react.stdout).toContain("convex/features/library →");
    expect(react.stdout).toContain("convex@^1.17");
    expect(react.stdout).toContain("next@^15");
    expect(react.stdout).toContain("react@^18");

    const svelte = runCli("add", "library", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/library-svelte →");
    expect(svelte.stdout).toContain("frontend/slices/library/lib/core.ts →");
    expect(svelte.stdout).toContain("convex/features/library →");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("convex@^1.17");
    expect(svelte.stdout).not.toContain("next@^15");
    expect(svelte.stdout).not.toContain("react@^18");
  });
});
