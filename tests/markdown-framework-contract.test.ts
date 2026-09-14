// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/markdown/slice.json"), "utf8"));

function filesUnder(dir: string, suffixes: string[]): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffixes) : suffixes.some((suffix) => path.endsWith(suffix)) ? [path] : [];
  });
}

function dryRun(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args, "--dry-run"], {
    cwd: root,
    encoding: "utf8",
  });
}

describe("markdown framework distribution", () => {
  it("keeps React default and registers native SvelteKit", () => {
    expect(slice.version).toBe("0.4.0");
    expect(slice.frontend.slicePath).toBe("frontend/slices/markdown");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/markdown-svelte");
  });

  it("keeps React clean-install portable without changing its renderer deps", () => {
    const source = filesUnder(join(root, "frontend/slices/markdown"), [".ts", ".tsx"])
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    for (const token of ['from "next/', 'import("next/', "@/lib/shared/features/defineFeature", "@/lib/utils"]) {
      expect(source).not.toContain(token);
    }
    expect(slice.deps.npm).toEqual([
      "katex@^0.16",
      "mermaid@^11",
      "recharts@^3",
      "lucide-react@^0.400.0",
    ]);
  });

  it("keeps Svelte renderer-clean and compiles every surface without warnings", () => {
    const dir = join(root, "frontend/slices/markdown-svelte");
    const svelteFiles = filesUnder(dir, [".svelte"]);
    const source = filesUnder(dir, [".svelte", ".ts"]).map((file) => readFileSync(file, "utf8")).join("\n");
    for (const token of ['from "react"', "lucide-react", "recharts", "@/components/ui/", 'from "next/', "@/lib/utils"]) {
      expect(source).not.toContain(token);
    }
    expect(svelteFiles.length).toBe(12);
    for (const file of svelteFiles) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) {
        expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
      }
    }
  });

  it("selects truthful CLI dependencies for React and Svelte", () => {
    const react = dryRun("add", "markdown", "--target", "/tmp/rr-markdown-react-dry");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/markdown → frontend/slices/markdown");
    expect(react.stdout).toContain("katex@^0.16");
    expect(react.stdout).toContain("mermaid@^11");
    expect(react.stdout).toContain("recharts@^3");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).not.toContain("next@");

    const svelte = dryRun("add", "markdown", "--target", "/tmp/rr-markdown-svelte-dry", "--framework", "sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/markdown-svelte → frontend/slices/markdown-svelte");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("katex@^0.16");
    expect(svelte.stdout).toContain("mermaid@^11");
    expect(svelte.stdout).not.toContain("recharts");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
