// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/app-store/slice.json"), "utf8"));

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

describe("app-store framework distribution", () => {
  it("keeps React default and declares the native Svelte distribution", () => {
    expect(slice.version).toBe("1.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/app-store-svelte");
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.npm).toEqual(["svelte@^5"]);
    expect(slice.deps.npm).toEqual(["lucide-react@^0.400.0"]);
    expect(slice.deps.sharedFiles).toHaveLength(7);
  });

  it("keeps portable cores free of React/Lucide/agent runtime imports", () => {
    const names = ["apps-core.ts", "enabled-core.ts", "exec-core.ts", "glyph-core.ts", "runtime-core.ts", "system-catalog-core.ts", "tools.ts"];
    const source = names.map((name) => readFileSync(join(root, "frontend/slices/app-store/lib", name), "utf8")).join("\n");
    for (const token of ['from "react"', "lucide-react", "@/shared/agentic", "@/components/ui/"]) {
      expect(source).not.toContain(token);
    }
    expect(readFileSync(join(root, "frontend/slices/app-store/app.tsx"), "utf8")).toContain(
      '@/shared/agentic/use-agent-tools',
    );
  });

  it("compiles every Svelte surface without warnings or renderer leakage", () => {
    const dir = join(root, "frontend/slices/app-store-svelte");
    const files = filesUnder(dir, ".svelte");
    const source = files.concat(filesUnder(dir, ".ts")).map((file) => readFileSync(file, "utf8")).join("\n");
    for (const token of ['from "react"', "lucide-react", "@/components/ui/", "@/shared/agentic", 'from "next']) {
      expect(source).not.toContain(token);
    }
    expect(files).toHaveLength(4);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) {
        expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
      }
    }
  });

  it("selects truthful CLI dependencies for React and Svelte", () => {
    const react = dryRun("add", "app-store", "--target", "/tmp/rr-app-store-react-dry");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("frontend/slices/app-store → frontend/slices/app-store");

    const svelte = dryRun("add", "app-store", "--target", "/tmp/rr-app-store-svelte-dry", "--framework", "sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/app-store-svelte → frontend/slices/app-store-svelte");
    expect(svelte.stdout).toContain("npm: svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
