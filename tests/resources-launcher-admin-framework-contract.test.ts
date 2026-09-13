// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-resources-launcher-"));
  targets.push(dir);
  return dir;
}
function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}
afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("resources-launcher-admin framework distribution", () => {
  it("keeps React default and selects native Svelte over the shared resource core", () => {
    const manifest = JSON.parse(readFileSync("packages/cli/lib/manifest.json", "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "resources-launcher-admin");
    expect(slice.slicePath).toBe("frontend/slices/resources-launcher-admin");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.sharedFiles).toEqual(["frontend/slices/resources-launcher-admin/lib/core.ts"]);
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/resources-launcher-admin-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [], sharedFiles: ["frontend/slices/resources-launcher-admin/lib/core.ts"] },
    });

    const react = runCli("add", "resources-launcher-admin", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/resources-launcher-admin →");
    expect(react.stdout).toContain("frontend/slices/resources-launcher-admin/lib/core.ts →");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("shadcn: button input label scroll-area native-select");

    const svelte = runCli("add", "resources-launcher-admin", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/resources-launcher-admin-svelte →");
    expect(svelte.stdout).toContain("frontend/slices/resources-launcher-admin/lib/core.ts →");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
