// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";
import { widgetCatalog } from "../frontend/slices/glass-desktop/lib/widget-catalog";
import { widgetRegistry } from "../frontend/slices/glass-desktop/lib/widget-registry";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/glass-desktop/slice.json"), "utf8"));

function filesUnder(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}
function dryRun(framework?: string) {
  const args = ["packages/cli/bin/cli.js", "add", "glass-desktop", "--target", `/tmp/rr-gd-${framework ?? "react"}-dry`, "--dry-run"];
  if (framework) args.push("--framework", framework);
  return spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
}

describe("glass-desktop framework distribution", () => {
  it("is a truthful public UI slice with React default and native SvelteKit", () => {
    expect(slice.version).toBe("0.2.0");
    expect(slice.kind).toBe("ui");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/glass-desktop-svelte");
    expect(slice.deps.env).toEqual([]);
  });

  it("keeps all 47 descriptors identical between portable catalog and React registry", () => {
    expect(Object.keys(widgetCatalog)).toHaveLength(47);
    expect(Object.keys(widgetRegistry).sort()).toEqual(Object.keys(widgetCatalog).sort());
    for (const [id, descriptor] of Object.entries(widgetCatalog)) {
      expect(widgetRegistry[id]).toMatchObject(descriptor);
      expect(typeof widgetRegistry[id]?.component).toBe("function");
    }
  });

  it("keeps all eight Svelte surfaces renderer-clean and compiler-clean", () => {
    const dir = join(root, "frontend/slices/glass-desktop-svelte");
    const files = filesUnder(dir, ".svelte");
    const source = files.concat(filesUnder(dir, ".ts")).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(files).toHaveLength(8);
    for (const token of ['from "react"', "lucide-react", "@/components/ui/", 'from "next', "next/navigation"]) expect(source).not.toContain(token);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
    }
  });

  it("selects exact renderer dependencies and portable Svelte closure", () => {
    const react = dryRun();
    expect(react.status, `${react.stdout}\n${react.stderr}`).toBe(0);
    expect(react.stdout).toContain("frontend/slices/glass-desktop → frontend/slices/glass-desktop");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("sonner@^2.0.7");
    expect(react.stdout).toContain("shadcn: button checkbox dialog dropdown-menu input scroll-area slider toggle");
    expect(react.stdout).not.toContain("glass-desktop-svelte");

    const svelte = dryRun("sveltekit");
    expect(svelte.status, `${svelte.stdout}\n${svelte.stderr}`).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/glass-desktop-svelte → frontend/slices/glass-desktop-svelte");
    for (const file of ["types.ts", "config/constants.ts", "config/default-layout.seed.ts", "config/theme.css", "lib/widget-catalog.ts", "lib/widget-display.ts", "lib/layout-core.ts", "utils/grid.ts", "utils/storage.ts"]) {
      expect(svelte.stdout).toContain(`frontend/slices/glass-desktop/${file}`);
    }
    expect(svelte.stdout).toContain("npm: svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("sonner");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
