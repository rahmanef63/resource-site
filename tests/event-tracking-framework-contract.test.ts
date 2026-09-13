// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-event-tracking-"));
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

describe("event-tracking framework distribution", () => {
  it("uses one framework-neutral source for React default and explicit SvelteKit", () => {
    const manifest = JSON.parse(readFileSync("packages/cli/lib/manifest.json", "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "event-tracking");
    expect(slice.slicePath).toBe("frontend/slices/event-tracking");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/event-tracking",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: [], shadcn: [] },
    });

    const react = runCli("add", "event-tracking", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/event-tracking →");

    const svelte = runCli("add", "event-tracking", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/event-tracking →");
    expect(svelte.stdout).not.toContain("svelte@^5");
    expect(svelte.stdout).not.toContain("react@");
    expect(svelte.stdout).not.toContain("next@");
    expect(svelte.stdout).not.toContain("npx shadcn@latest add");
  });
});
