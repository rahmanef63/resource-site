// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const targets: string[] = [];
function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-image-picker-"));
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

describe("image-picker framework distribution", () => {
  it("keeps React default complete and selects native Svelte over portable image semantics", () => {
    const manifest = JSON.parse(readFileSync("packages/cli/lib/manifest.json", "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "image-picker");
    expect(slice.slicePath).toBe("frontend/slices/image-picker");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.sharedFiles).toEqual(["components/shared/ui/FilePicker.tsx"]);
    expect(slice.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/image-picker-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });

    const react = runCli("add", "image-picker", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/image-picker →");
    expect(react.stdout).toContain("components/shared/ui/FilePicker.tsx →");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("shadcn: dialog button input");

    const svelte = runCli("add", "image-picker", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/image-picker-svelte →");
    expect(svelte.stdout).toContain("frontend/slices/image-picker/lib/core.ts →");
    expect(svelte.stdout).toContain("frontend/slices/image-picker/lib/imageStyle.ts →");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).not.toContain("components/shared/ui/FilePicker.tsx");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
