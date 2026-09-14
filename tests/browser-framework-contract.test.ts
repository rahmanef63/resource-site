// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/browser/slice.json"), "utf8"));

function filesUnder(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}
function dryRun(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args, "--dry-run"], { cwd: root, encoding: "utf8" });
}

describe("browser framework distribution", () => {
  it("keeps React default and registers native SvelteKit", () => {
    expect(slice.version).toBe("1.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/browser-svelte");
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.npm).toEqual(["svelte@^5"]);
    expect(slice.deps.npm).toEqual(["lucide-react@^0.400.0"]);
    expect(slice.deps.sharedFiles).toHaveLength(7);
    expect(slice.contract.requires.deps).toEqual([]);
  });

  it("keeps transport/session/tool cores renderer-neutral", () => {
    const names = ["host-core.ts", "screencast-core.ts", "session-core.ts", "storage-core.ts", "tools.ts", "url.ts"];
    const source = names.map((name) => readFileSync(join(root, "frontend/slices/browser/lib", name), "utf8")).join("\n");
    for (const token of ['from "react"', "lucide-react", "@/components/ui/", "@/shared/agentic"]) expect(source).not.toContain(token);
    expect(readFileSync(join(root, "frontend/slices/browser/app.tsx"), "utf8")).toContain("@/shared/agentic/use-agent-tools");
  });

  it("compiles every Svelte surface without renderer leakage", () => {
    const dir = join(root, "frontend/slices/browser-svelte");
    const files = filesUnder(dir, ".svelte");
    const source = files.concat(filesUnder(dir, ".ts")).map((file) => readFileSync(file, "utf8")).join("\n");
    for (const token of ['from "react"', "lucide-react", "@/components/ui/", "@/shared/agentic", 'from "next']) expect(source).not.toContain(token);
    expect(files).toHaveLength(5);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) {
        expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
      }
    }
  });

  it("selects truthful CLI dependencies for React and Svelte", () => {
    const react = dryRun("add", "browser", "--target", "/tmp/rr-browser-react-dry");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("frontend/slices/browser → frontend/slices/browser");

    const svelte = dryRun("add", "browser", "--target", "/tmp/rr-browser-svelte-dry", "--framework", "sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/browser-svelte → frontend/slices/browser-svelte");
    expect(svelte.stdout).toContain("npm: svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
