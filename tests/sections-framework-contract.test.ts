// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/sections/slice.json"), "utf8"));

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

describe("sections framework distribution", () => {
  it("fixes the canonical source path and keeps React default", () => {
    expect(slice.version).toBe("0.5.0");
    expect(slice.frontend.slicePath).toBe("frontend/slices/sections");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/sections-svelte");
    expect(JSON.stringify(slice)).not.toContain("frontend/slices/landing-sections");
  });

  it("keeps the React distribution self-contained from template-shared and Next Link", () => {
    const source = filesUnder(join(root, "frontend/slices/sections"), ".tsx")
      .concat(filesUnder(join(root, "frontend/slices/sections"), ".ts"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(source).not.toContain("@/components/templates/_shared");
    expect(source).not.toContain('from "next/link"');
    expect(source).not.toContain("@/lib/shared/features/defineFeature");
    expect(slice.deps.npm).toEqual(["lucide-react@^0.400.0", "embla-carousel-autoplay@^8.6.0"]);
  });

  it("keeps Svelte renderer-clean and compiles every surface without warnings", () => {
    const dir = join(root, "frontend/slices/sections-svelte");
    const files = filesUnder(dir, ".svelte");
    const source = files.concat(filesUnder(dir, ".ts")).map((file) => readFileSync(file, "utf8")).join("\n");
    for (const token of ['from "react"', "lucide-react", "@/components/ui/", "embla-carousel", 'from "next', "templates/_shared"]) {
      expect(source).not.toContain(token);
    }
    expect(files.length).toBe(10);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) {
        expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
      }
    }
  });

  it("selects truthful CLI dependencies for React and Svelte", () => {
    const react = dryRun("add", "sections", "--target", "/tmp/rr-sections-react-dry");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/sections → frontend/slices/sections");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("embla-carousel-autoplay@^8.6.0");
    expect(react.stdout).not.toContain("next@^15");

    const svelte = dryRun("add", "sections", "--target", "/tmp/rr-sections-svelte-dry", "--framework", "sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/sections-svelte → frontend/slices/sections-svelte");
    expect(svelte.stdout).toContain("npm: svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("embla-carousel");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
