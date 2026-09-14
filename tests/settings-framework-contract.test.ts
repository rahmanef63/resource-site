// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { compile } from "svelte/compiler";

const targets: string[] = [];
const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-settings-"));
  targets.push(dir);
  return dir;
}

function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

function svelteSources(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) out.push(...svelteSources(file));
    else if (name.endsWith(".svelte")) out.push(file);
  }
  return out;
}

afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("settings framework distribution", () => {
  it("keeps React default and selects native Svelte over portable adapter cores", () => {
    const slice = JSON.parse(read("frontend/slices/settings/slice.json"));
    expect(slice.version).toBe("1.2.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/settings-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([
      "frontend/slices/settings/variants/account/lib/adapter.ts",
      "frontend/slices/settings/variants/account/lib/core.ts",
      "frontend/slices/settings/variants/account/lib/nav-core.ts",
      "frontend/slices/settings/variants/account/lib/tools.ts",
      "frontend/slices/settings/variants/appearance/lib/types.ts",
    ]);
  });

  it("keeps React, Next, Lucide, shadcn and agent runtime out of Svelte", () => {
    const dir = path.join(root, "frontend/slices/settings-svelte");
    const joined = [
      ...svelteSources(dir).map((file) => readFileSync(file, "utf8")),
      read("frontend/slices/settings-svelte/index.ts"),
      read("frontend/slices/settings-svelte/variants/account/index.ts"),
      read("frontend/slices/settings-svelte/variants/appearance/index.ts"),
    ].join("\n");
    for (const bad of [
      'from "react"',
      'from "next',
      "lucide-react",
      "@/components/ui/",
      "shared/agentic",
    ]) expect(joined).not.toContain(bad);
    expect(read("frontend/slices/settings/variants/account/lib/tools.ts")).not.toContain("shared/agentic");
  });

  it("compiles every Svelte account/appearance component client+server without warnings", () => {
    const dir = path.join(root, "frontend/slices/settings-svelte");
    for (const filename of svelteSources(dir)) {
      const source = readFileSync(filename, "utf8");
      expect(compile(source, { filename, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(source, { filename, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("preserves account and appearance variant routing for explicit SvelteKit", () => {
    for (const variant of ["account", "appearance"] as const) {
      const result = runCli(
        "add",
        "settings",
        variant,
        "--framework",
        "sveltekit",
        "--target",
        target(),
        "--dry-run",
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`frontend/slices/settings-svelte/variants/${variant} → frontend/slices/settings-svelte`);
      expect(result.stdout).toContain("svelte@^5");
      expect(result.stdout).toContain("frontend/slices/settings/variants/account/lib/adapter.ts →");
      expect(result.stdout).toContain("frontend/slices/settings/variants/appearance/lib/types.ts →");
      expect(result.stdout).not.toContain("lucide-react");
      expect(result.stdout).not.toContain("shared/agentic");
      expect(result.stdout).not.toContain("shadcn:");
    }
  });

  it("keeps existing React variant routing unchanged", () => {
    const account = runCli("add", "settings", "account", "--target", target(), "--dry-run");
    expect(account.status).toBe(0);
    expect(account.stdout).toContain("frontend/slices/settings/variants/account → frontend/slices/settings");
    expect(account.stdout).toContain("lucide-react@^0.400.0");
    expect(account.stdout).toContain("shadcn: alert-dialog avatar button card input label select separator skeleton switch textarea toggle-group");
  });
});
