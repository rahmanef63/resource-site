// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const manifestPath = "packages/cli/lib/manifest.json";
const originalManifest = readFileSync(manifestPath, "utf8");
const tempDirs: string[] = [];

function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

function installFrameworkFixture() {
  const manifest = JSON.parse(originalManifest);
  manifest.slices.push({
    slug: "framework-fixture",
    title: "Framework fixture",
    category: "ui",
    kind: "ui",
    version: "1.0.0",
    description: "Fixture for framework distribution selection.",
    source: "test",
    slicePath: "frontend/slices/framework-fixture",
    frameworks: {
      "react-next": { path: "frontend/slices/framework-fixture" },
      "svelte-sveltekit": {
        path: "frontend/slices/framework-fixture-svelte",
        deps: { npm: ["svelte@^5"] },
      },
    },
    defaultFramework: "react-next",
    convexPaths: [],
    npm: ["react@^19"],
    shadcn: [],
    env: [],
    peers: [],
    providers: [],
    tags: [],
    agentRecipe: "",
  });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

afterEach(() => {
  writeFileSync(manifestPath, originalManifest);
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("framework-aware slice distribution", () => {
  it("generates legacy React/Next framework metadata without changing slicePath", () => {
    execFileSync(process.execPath, ["packages/cli/scripts/gen-manifest.mjs"], { stdio: "pipe" });
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "ai-core");

    expect(slice.slicePath).toBe("frontend/slices/ai-core");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/ai-core" },
    });
  });

  it("keeps feedback-states on React by default and selects its SvelteKit source deterministically", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const slice = manifest.slices.find((entry: { slug: string }) => entry.slug === "feedback-states");
    const target = mkTarget();

    expect(slice.slicePath).toBe("frontend/slices/feedback-states");
    expect(slice.defaultFramework).toBe("react-next");
    expect(slice.frameworks).toEqual({
      "react-next": { path: "frontend/slices/feedback-states" },
      "svelte-sveltekit": {
        path: "frontend/slices/feedback-states-svelte",
        aliases: ["svelte", "sveltekit"],
        deps: { npm: ["svelte@^5"], shadcn: [] },
      },
    });

    const defaultResult = runCli("add", "feedback-states", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/feedback-states →");

    const svelteResult = runCli("add", "feedback-states", "--target", target, "--framework", "sveltekit", "--dry-run");
    expect(svelteResult.status).toBe(0);
    expect(svelteResult.stdout).toContain("frontend/slices/feedback-states-svelte →");
    expect(svelteResult.stdout).toContain("svelte@^5");
    expect(svelteResult.stdout).not.toContain("npx shadcn@latest add button");
  });

  it("uses the default framework path and forwards an explicit framework through add", () => {
    installFrameworkFixture();
    const target = mkTarget();

    const defaultResult = runCli("add", "framework-fixture", "--target", target, "--dry-run");
    expect(defaultResult.status).toBe(0);
    expect(defaultResult.stdout).toContain("frontend/slices/framework-fixture →");

    const explicitResult = runCli("add", "framework-fixture", "--target", target, "--framework", "svelte-sveltekit", "--dry-run");
    expect(explicitResult.status).toBe(0);
    expect(explicitResult.stdout).toContain("frontend/slices/framework-fixture-svelte →");
    expect(explicitResult.stdout).toContain("svelte@^5");
  });

  it("rejects an explicitly unsupported framework and lists the available choices", () => {
    installFrameworkFixture();
    const result = runCli("lift", "rahman:framework-fixture", "--framework", "solid-start", "--dry-run");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('does not support framework "solid-start"');
    expect(result.stderr).toContain("react-next, svelte-sveltekit");
  });

  it("rejects invalid framework defaults, duplicate aliases, and missing declared paths", () => {
    const dir = path.join(process.cwd(), ".tmp-framework-validation");
    mkdirSync(dir, { recursive: true });
    tempDirs.push(dir);
    const slicePath = path.join(dir, "slice.json");
    writeFileSync(slicePath, JSON.stringify({
      slug: "framework-validation",
      version: "1.0.0",
      category: "ui",
      title: "Framework validation",
      description: "Framework validation fixture.",
      namespace: "@/features/framework-validation",
      frontend: {
        slicePath: "frontend/slices/ai-core",
        defaultFramework: "not-declared",
        frameworks: {
          "react-next": { path: "frontend/slices/ai-core", aliases: ["web"] },
          "svelte-sveltekit": { path: "frontend/slices/missing-svelte", aliases: ["web"] },
        },
      },
      deps: {},
    }, null, 2));

    const result = spawnSync(process.execPath, ["packages/cli/scripts/validate-slice.mjs", slicePath], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('defaultFramework "not-declared" is not declared');
    expect(result.stderr).toContain('duplicate framework alias "web"');
    expect(result.stderr).toContain("missing on disk: frontend/slices/missing-svelte");
  });
});

function mkTarget() {
  const dir = path.join(os.tmpdir(), `rr-framework-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  tempDirs.push(dir);
  return dir;
}
