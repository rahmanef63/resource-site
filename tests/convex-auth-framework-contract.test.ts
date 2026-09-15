// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/convex-auth/slice.json"), "utf8"));

function filesUnder(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}

function dryRun(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args, "--dry-run"], {
    cwd: root,
    encoding: "utf8",
  });
}

describe("convex-auth framework distribution", () => {
  it("keeps React default and declares the native Svelte distribution", () => {
    expect(slice.version).toBe("0.5.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/convex-auth-svelte");
    expect(slice.deps.npm).toContain("lucide-react@^0.400.0");
    expect(slice.deps.npm).toContain("@convex-dev/auth@^0.0.95");
  });

  it("routes React auth actions through the shared flow core", () => {
    const hook = readFileSync(join(root, "frontend/slices/convex-auth/hooks/index.ts"), "utf8");
    const core = readFileSync(join(root, "frontend/slices/convex-auth/lib/flow-core.ts"), "utf8");
    expect(hook).toContain('from "@convex-dev/auth/react"');
    expect(hook).toContain("createAuthFlow");
    expect(core).toContain("signInWithPassword");
    expect(core).toContain('form.set("flow", "signUp")');
  });

  it("keeps every Svelte surface renderer-clean and compiler-clean", () => {
    const dir = join(root, "frontend/slices/convex-auth-svelte");
    const svelteFiles = filesUnder(dir, ".svelte");
    const source = svelteFiles.concat(filesUnder(dir, ".ts")).map((file) => readFileSync(file, "utf8")).join("\n");
    for (const token of ['from "react"', "lucide-react", '@/components/ui/', 'from "next/', "@convex-dev/auth/react"]) {
      expect(source).not.toContain(token);
    }
    expect(svelteFiles.length).toBe(5);
    for (const file of svelteFiles) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) {
        expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
      }
    }
  });

  it("selects truthful framework-specific CLI dependencies", () => {
    const react = dryRun("add", "convex-auth", "--target", "/tmp/rr-convex-auth-react-dry");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/convex-auth → frontend/slices/convex-auth");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).not.toContain("svelte@^5");

    const svelte = dryRun("add", "convex-auth", "--target", "/tmp/rr-convex-auth-svelte-dry", "--framework", "sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/convex-auth-svelte → frontend/slices/convex-auth-svelte");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("@convex-dev/auth@^0.0.95");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
