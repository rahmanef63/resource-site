// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/user-management/slice.json"), "utf8"));

function filesUnder(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}
function dryRun(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args, "--dry-run"], { cwd: root, encoding: "utf8" });
}

describe("user-management framework distribution", () => {
  it("keeps React default and points source metadata at the real backend", () => {
    expect(slice.version).toBe("0.8.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/user-management-svelte");
    expect(slice.convex.rootPaths).toEqual(["convex/features/user_management"]);
    expect(slice.deps.npm).toContain("lucide-react@^0.400.0");
  });

  it("keeps native Svelte renderer-clean and compiler-clean", () => {
    const dir = join(root, "frontend/slices/user-management-svelte");
    const files = filesUnder(dir, ".svelte");
    const source = files.concat(filesUnder(dir, ".ts")).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(files.length).toBe(14);
    for (const token of ['from "react"', "lucide-react", "@/components/ui/", 'from "next', "useMembersView"]) expect(source).not.toContain(token);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
    }
  });

  it("selects truthful CLI dependencies and portable closure", () => {
    const react = dryRun("add", "user-management", "--target", "/tmp/rr-um-react-dry");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/user-management → frontend/slices/user-management");
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).not.toContain("frontend/slices/user-management-svelte");

    const svelte = dryRun("add", "user-management", "--target", "/tmp/rr-um-svelte-dry", "--framework", "sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/user-management-svelte → frontend/slices/user-management-svelte");
    expect(svelte.stdout).toContain("npm: svelte@^5");
    expect(svelte.stdout).toContain("convex/features/user_management → convex/features/user_management");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
  });

  it("narrows shared agent tools to framework-neutral modules", () => {
    const tools = readFileSync(join(root, "frontend/slices/user-management/lib/tools.ts"), "utf8");
    expect(tools).toContain('@/shared/agentic/define');
    expect(tools).toContain('@/shared/agentic/schema');
    expect(tools).not.toContain('from "@/shared/agentic"');
  });
});
