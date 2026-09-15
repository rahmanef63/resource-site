// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-dashboard-shell-"));
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
  for (const dir of targets.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("dashboard-shell framework distribution", () => {
  it("keeps React default complete and selects native SvelteKit over the shared nav core", () => {
    const manifest = JSON.parse(
      readFileSync("packages/cli/lib/manifest.json", "utf8"),
    );
    const slice = manifest.slices.find(
      (entry: { slug: string }) => entry.slug === "dashboard-shell",
    );
    expect(slice.slicePath).toBe("frontend/slices/dashboard-shell");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/dashboard-shell-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: {
        npm: ["svelte@^5", "@sveltejs/kit@^2.12.0"],
        shadcn: [],
      },
    });

    const react = runCli(
      "add",
      "dashboard-shell",
      "--target",
      target(),
      "--dry-run",
    );
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/dashboard-shell →");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("vaul@^1.0.0");
    expect(react.stdout).toContain("drawer");
    expect(react.stdout).toContain("sidebar");

    const svelte = runCli(
      "add",
      "dashboard-shell",
      "--target",
      target(),
      "--framework",
      "sveltekit",
      "--dry-run",
    );
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/dashboard-shell-svelte →");
    expect(svelte.stdout).toContain("frontend/slices/dashboard-shell/lib/nav.ts →");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("@sveltejs/kit@^2.12.0");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("vaul");
    expect(svelte.stdout).not.toContain("npx shadcn@latest add");
  });
});
