// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/pages-cms/slice.json"), "utf8"));

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

describe("pages-cms framework distribution", () => {
  it("keeps React default and registers native SvelteKit", () => {
    expect(slice.version).toBe("0.2.0");
    expect(slice.frontend.slicePath).toBe("frontend/slices/pages-cms");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/pages-cms-svelte");
  });

  it("closes the React clean-install portability gaps", () => {
    const source = filesUnder(join(root, "frontend/slices/pages-cms"), ".tsx")
      .concat(filesUnder(join(root, "frontend/slices/pages-cms"), ".ts"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    for (const token of ['from "next/', "@/lib/shared/features/defineFeature", "@/lib/utils"]) {
      expect(source).not.toContain(token);
    }
    expect(slice.deps.npm).toEqual(["lucide-react@^0.400.0"]);
  });

  it("keeps Svelte renderer-clean and compiles every surface without warnings", () => {
    const dir = join(root, "frontend/slices/pages-cms-svelte");
    const files = filesUnder(dir, ".svelte");
    const source = files.concat(filesUnder(dir, ".ts")).map((file) => readFileSync(file, "utf8")).join("\n");
    for (const token of ['from "react"', "lucide-react", "@/components/ui/", 'from "next/', "@/lib/utils"]) {
      expect(source).not.toContain(token);
    }
    expect(files.length).toBe(12);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) {
        expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
      }
    }
  });

  it("selects truthful CLI dependencies for React and Svelte", () => {
    const react = dryRun("add", "pages-cms", "--target", "/tmp/rr-pages-cms-react-dry");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/pages-cms → frontend/slices/pages-cms");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).not.toContain("next@");

    const svelte = dryRun("add", "pages-cms", "--target", "/tmp/rr-pages-cms-svelte-dry", "--framework", "sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/pages-cms-svelte → frontend/slices/pages-cms-svelte");
    expect(svelte.stdout).toContain("npm: svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
