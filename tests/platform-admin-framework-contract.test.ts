// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-platform-admin-"));
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

describe("platform-admin framework distribution", () => {
  it("uses one framework-neutral source for React default and explicit SvelteKit", () => {
    const manifest = JSON.parse(readFileSync("packages/cli/lib/manifest.json", "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "platform-admin");
    expect(slice.slicePath).toBe("frontend/slices/platform-admin");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/platform-admin",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: [], shadcn: [] },
    });

    const react = runCli("add", "platform-admin", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/platform-admin →");

    const svelte = runCli("add", "platform-admin", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/platform-admin →");
    expect(svelte.stdout).not.toMatch(/(svelte@\^5|react@|next@|npx shadcn@latest add)/);
    expect(svelte.stdout).not.toContain("convex/features/platform-admin");
  });
});
