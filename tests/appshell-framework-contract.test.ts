// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");
const slice = JSON.parse(read("frontend/slices/appshell/slice.json"));
function walk(dir: string, suffix: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p, suffix) : p.endsWith(suffix) ? [p] : [];
  });
}
function dryRun(framework?: string) {
  const args = ["packages/cli/bin/cli.js", "add", "appshell", "--target", `/tmp/rr-appshell-${framework ?? "react"}-dry`, "--dry-run"];
  if (framework) args.push("--framework", framework);
  return spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
}

describe("appshell dual-framework contract", () => {
  it("keeps React default and declares the SvelteKit distribution", () => {
    expect(slice.version).toBe("1.7.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/appshell-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });
  });

  it("keeps all native Svelte surfaces renderer-clean and compiler-clean", () => {
    const dir = join(root, "frontend/slices/appshell-svelte");
    const files = walk(dir, ".svelte");
    const source = [...files, ...walk(dir, ".ts")].map((f) => readFileSync(f, "utf8")).join("\n");
    expect(files).toHaveLength(18);
    for (const bad of ['from "react"', 'from "next', "lucide-react", "@phosphor-icons/react", "@/components/ui/", "@dnd-kit", "vaul"]) expect(source).not.toContain(bad);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(compile(text, { filename: file, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(text, { filename: file, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("ships truthful OS and system-surface coverage", () => {
    const source = [
      read("frontend/slices/appshell-svelte/AppShell.svelte"),
      read("frontend/slices/appshell-svelte/shells/MacShell.svelte"),
      read("frontend/slices/appshell-svelte/shells/WindowsShell.svelte"),
      read("frontend/slices/appshell-svelte/shells/MobileShell.svelte"),
      read("frontend/slices/appshell-svelte/components/SystemSheets.svelte"),
    ].join("\n");
    for (const token of ["macos", "windows", "ios", "android", "Quick Look", "Clipboard", "Keyboard shortcuts", "Locked"]) expect(source).toContain(token);
    expect(read("frontend/slices/appshell-svelte/components/WindowFrame.svelte")).toContain("snapZoneAt");
  });

  it("keeps the shared Svelte closure framework-neutral", () => {
    const files: string[] = slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles;
    expect(files).toContain("frontend/slices/appshell/lib/types-core.ts");
    expect(files).toContain("frontend/slices/appshell/lib/store.ts");
    expect(files).toContain("frontend/slices/appshell/registry/chrome-kit.ts");
    expect(files).toContain("lib/shared/agentic/define.ts");
    for (const file of files.filter((f) => f.endsWith(".ts"))) {
      const text = read(file);
      expect(text, file).not.toMatch(/from\s+["']react["']/);
      expect(text, file).not.toContain("react/jsx-runtime");
    }
  });

  it("routes React and Svelte CLI installs to exact renderer dependencies", () => {
    const react = dryRun();
    expect(react.status, react.stderr).toBe(0);
    expect(react.stdout).toContain("frontend/slices/appshell → frontend/slices/appshell");
    expect(react.stdout).toContain("lucide-react");
    expect(react.stdout).toContain("vaul");
    expect(react.stdout).toContain("shadcn:");

    const svelte = dryRun("sveltekit");
    expect(svelte.status, svelte.stderr).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/appshell-svelte → frontend/slices/appshell-svelte");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("frontend/slices/appshell/lib/store.ts");
    expect(svelte.stdout).toContain("frontend/slices/appshell/lib/tools.ts");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("vaul");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
