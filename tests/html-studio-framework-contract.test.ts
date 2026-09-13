// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-html-studio-"));
  targets.push(dir);
  return dir;
}
function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], { cwd: process.cwd(), encoding: "utf8" });
}
afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("html-studio framework distribution", () => {
  it("keeps React default and selects native Svelte over the shared sandbox/document core", () => {
    const manifest = JSON.parse(readFileSync("packages/cli/lib/manifest.json", "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "html-studio");
    expect(slice.slicePath).toBe("frontend/slices/html-studio");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.sharedFiles).toEqual(["frontend/slices/html-studio/lib/core.ts"]);
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/html-studio-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [], sharedFiles: ["frontend/slices/html-studio/lib/core.ts"] },
    });

    const react = runCli("add", "html-studio", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/html-studio →");
    expect(react.stdout).toContain("frontend/slices/html-studio/lib/core.ts →");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("shadcn: button input textarea scroll-area");

    const svelte = runCli("add", "html-studio", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/html-studio-svelte →");
    expect(svelte.stdout).toContain("frontend/slices/html-studio/lib/core.ts →");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
