// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const slice = JSON.parse(read("frontend/slices/icon-picker/slice.json"));

function svelteFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) out.push(...svelteFiles(file));
    else if (name.endsWith(".svelte")) out.push(file);
  }
  return out;
}

const dryRun = (framework?: string) => spawnSync(
  process.execPath,
  ["packages/cli/bin/cli.js", "add", "icon-picker", ...(framework ? ["--framework", framework] : []), "--target", "/tmp/rr-icon-picker-test", "--dry-run"],
  { cwd: root, encoding: "utf8" },
);

describe("icon-picker framework distribution", () => {
  it("keeps React default and selects native Svelte over shared picker cores", () => {
    expect(slice.version).toBe("0.6.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/icon-picker-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: {
        npm: ["svelte@^5", "@lucide/svelte@^1.46.0", "phosphor-svelte@^3.1.0"],
        shadcn: [],
      },
    });
  });

  it("keeps React/Next/shadcn/agent runtime out of Svelte and shared cores", () => {
    const files = [
      ...svelteFiles(join(root, "frontend/slices/icon-picker-svelte")),
      join(root, "frontend/slices/icon-picker-svelte/index.ts"),
      join(root, "frontend/slices/icon-picker-svelte/lib/lucide-icons.ts"),
      join(root, "frontend/slices/icon-picker-svelte/lib/phosphor-icons.ts"),
    ];
    const joined = files.map((file) => readFileSync(file, "utf8")).join("\n");
    for (const bad of ['from "react"', 'from "next', "@/components/ui/", "lucide-react", "@phosphor-icons/react", "shared/agentic"]) {
      expect(joined).not.toContain(bad);
    }
    expect(read("frontend/slices/icon-picker/lib/picker-handlers.ts")).not.toContain('from "react"');
    expect(read("frontend/slices/icon-picker/lib/tools.ts")).not.toContain("shared/agentic");
    expect(read("frontend/slices/icon-picker/lib/recents-core.ts")).not.toContain('from "react"');
    expect(read("frontend/slices/icon-picker/lib/style-core.ts")).not.toContain('from "react"');
  });

  it("compiles every Svelte surface client+server without warnings", () => {
    for (const filename of svelteFiles(join(root, "frontend/slices/icon-picker-svelte"))) {
      const source = readFileSync(filename, "utf8");
      expect(compile(source, { filename, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(source, { filename, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("selects truthful CLI dependencies per framework", () => {
    const react = dryRun();
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("@phosphor-icons/react@^2.1.10");
    expect(react.stdout).toContain("shadcn: popover dialog button input scroll-area tabs");

    const svelte = dryRun("sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/icon-picker-svelte → frontend/slices/icon-picker-svelte");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("@lucide/svelte@^1.46.0");
    expect(svelte.stdout).toContain("phosphor-svelte@^3.1.0");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("@phosphor-icons/react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
