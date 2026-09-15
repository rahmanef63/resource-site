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
function target() { const dir = mkdtempSync(path.join(os.tmpdir(), "rr-file-explorer-")); targets.push(dir); return dir; }
function runCli(...args: string[]) { return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], { cwd: root, encoding: "utf8" }); }
function svelteSources(dir: string): string[] { return readdirSync(dir).flatMap((name) => { const file = path.join(dir, name); return statSync(file).isDirectory() ? svelteSources(file) : name.endsWith(".svelte") ? [file] : []; }); }
afterEach(() => { for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true }); });

describe("file-explorer framework distribution", () => {
  it("keeps React default and selects native Svelte over portable filesystem cores", () => {
    const slice = JSON.parse(read("frontend/slices/file-explorer/slice.json"));
    expect(slice.version).toBe("1.7.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({ path: "frontend/slices/file-explorer-svelte", aliases: ["svelte", "sveltekit"], deps: { npm: ["svelte@^5"], shadcn: [] } });
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain("frontend/slices/file-explorer/lib/ops-core.ts");
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain("frontend/slices/file-explorer/adapter/mock.ts");
  });

  it("keeps React UI/agent runtime out of Svelte and narrows React registration", () => {
    const dir = path.join(root, "frontend/slices/file-explorer-svelte");
    const joined = [...svelteSources(dir).map((f) => readFileSync(f, "utf8")), read("frontend/slices/file-explorer-svelte/index.ts")].join("\n");
    for (const bad of ['from "react"', 'from "next', "lucide-react", "@/components/ui/", "shared/agentic", "shared/ui/FilePicker"]) expect(joined).not.toContain(bad);
    expect(read("frontend/slices/file-explorer/components/explorer-view.tsx")).toContain('from "@/shared/agentic/use-agent-tools"');
    expect(read("frontend/slices/file-explorer/lib/tools.ts")).not.toContain('from "@/shared/agentic');
  });

  it("compiles every Svelte surface client+server without warnings", () => {
    for (const filename of svelteSources(path.join(root, "frontend/slices/file-explorer-svelte"))) {
      const source = readFileSync(filename, "utf8");
      expect(compile(source, { filename, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(source, { filename, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("selects truthful CLI dependencies for React and Svelte", () => {
    const react = runCli("add", "file-explorer", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("components/shared/ui/FilePicker.tsx →");
    expect(react.stdout).toContain("lib/shared/agentic/use-agent-tools.ts →");
    expect(react.stdout).toContain("shadcn: button input scroll-area separator dropdown-menu sheet dialog");

    const svelte = runCli("add", "file-explorer", "--framework", "sveltekit", "--target", target(), "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/file-explorer-svelte → frontend/slices/file-explorer-svelte");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("frontend/slices/file-explorer/lib/history-core.ts →");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shared/agentic");
    expect(svelte.stdout).not.toContain("shared/ui/FilePicker");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
