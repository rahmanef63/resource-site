// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { compile } from "svelte/compiler";

const root = process.cwd();
const targets: string[] = [];
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

function filesUnder(dir: string, suffix?: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name);
    if (statSync(file).isDirectory()) out.push(...filesUnder(file, suffix));
    else if (!suffix || name.endsWith(suffix)) out.push(file);
  }
  return out;
}

function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-design-studio-"));
  targets.push(dir);
  return dir;
}

function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("design studio framework distribution", () => {
  it("keeps React default and declares Svelte over exact portable cores", () => {
    const slice = JSON.parse(read("frontend/slices/design-studio/slice.json"));
    expect(slice.version).toBe("1.1.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/design-studio-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([
      "frontend/slices/design-studio/config.ts",
      "frontend/slices/design-studio/lib/filters.ts",
      "frontend/slices/design-studio/lib/host-core.ts",
      "frontend/slices/design-studio/lib/masks.ts",
      "frontend/slices/design-studio/lib/model-core.ts",
      "frontend/slices/design-studio/lib/samples.ts",
      "frontend/slices/design-studio/lib/scene-core.ts",
      "frontend/slices/design-studio/lib/serialize.ts",
      "frontend/slices/design-studio/lib/studio-core.ts",
    ]);
  });

  it("keeps Svelte renderer-clean and compiles every surface client+server", () => {
    const dir = path.join(root, "frontend/slices/design-studio-svelte");
    const source = filesUnder(dir)
      .filter((file) => /\.(svelte|ts)$/.test(file))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    for (const bad of ['from "react"', 'from "next', "lucide-react", "@/components/ui/", "shared/agentic"]) {
      expect(source).not.toContain(bad);
    }
    for (const filename of filesUnder(dir, ".svelte")) {
      const text = readFileSync(filename, "utf8");
      expect(compile(text, { filename, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(text, { filename, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("makes React hooks thin wrappers over shared observable stores", () => {
    expect(read("frontend/slices/design-studio/lib/use-studio.ts")).toContain("createStudioStore");
    expect(read("frontend/slices/design-studio/lib/use-scene.ts")).toContain("createSceneStore");
    expect(read("frontend/slices/design-studio/lib/model.ts")).toContain('export * from "./model-core"');
    expect(read("frontend/slices/design-studio/lib/host.ts")).toContain('export * from "./host-core"');
  });

  it("selects truthful CLI dependencies for React and Svelte", () => {
    const react = runCli("add", "design-studio", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/design-studio → frontend/slices/design-studio");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("shadcn:");
    expect(react.stdout).not.toContain("svelte@^5");

    const svelte = runCli("add", "design-studio", "--framework", "sveltekit", "--target", target(), "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/design-studio-svelte → frontend/slices/design-studio-svelte");
    expect(svelte.stdout).toContain("frontend/slices/design-studio/lib/studio-core.ts");
    expect(svelte.stdout).toContain("frontend/slices/design-studio/lib/model-core.ts");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
