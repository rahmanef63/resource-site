// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-ai-router-"));
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

describe("ai-router framework distribution", () => {
  it("keeps React default and selects native Svelte over the same backend/core", () => {
    const manifest = JSON.parse(readFileSync("packages/cli/lib/manifest.json", "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "ai-router");
    expect(slice.slicePath).toBe("frontend/slices/ai-router");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.convexPaths).toEqual(["convex/features/ai"]);
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/ai-router-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: {
        npm: ["svelte@^5", "convex@^1.17", "ai@^4.0.0", "@openrouter/ai-sdk-provider@^0.0.5"],
        shadcn: [],
      },
    });

    const react = runCli("add", "ai-router", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/ai-router →");
    expect(react.stdout).toContain("convex/features/ai →");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("shadcn: button card input");

    const svelte = runCli("add", "ai-router", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/ai-router-svelte →");
    expect(svelte.stdout).toContain("frontend/slices/ai-router/lib/core.ts →");
    expect(svelte.stdout).toContain("convex/features/ai →");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("convex@^1.17");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
