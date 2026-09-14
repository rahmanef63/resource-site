// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const walk = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const file = join(dir, name);
  return statSync(file).isDirectory() ? walk(file) : [file];
});
const run = (...args: string[]) => spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], { cwd: root, encoding: "utf8" });

describe("code-editor framework distribution", () => {
  it("keeps React default and selects native Svelte over shared editor/FS semantics", () => {
    const slice = JSON.parse(read("frontend/slices/code-editor/slice.json"));
    expect(slice.version).toBe("1.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/code-editor-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toContain(
      "frontend/slices/code-editor/lib/editor-core.ts",
    );
    expect(slice.deps.sharedFiles).toContain("lib/shared/agentic/use-agent-tools.ts");
  });

  it("keeps Svelte free of React, Lucide, shadcn and agent-runtime leakage", () => {
    const files = walk(join(root, "frontend/slices/code-editor-svelte"));
    const text = files.filter((f) => /\.(svelte|ts)$/.test(f)).map((f) => readFileSync(f, "utf8")).join("\n");
    for (const token of ['from "react"', 'from "next', "lucide-react", "@/components/ui/", "shared/agentic"]) {
      expect(text).not.toContain(token);
    }
    expect(read("frontend/slices/code-editor/lib/tools.ts")).not.toContain("shared/agentic");
    expect(read("frontend/slices/code-editor/app.tsx")).toContain('@/shared/agentic/use-agent-tools');
  });

  it("compiles every Svelte surface client+server without warnings", () => {
    for (const file of walk(join(root, "frontend/slices/code-editor-svelte")).filter((f) => f.endsWith(".svelte"))) {
      const source = readFileSync(file, "utf8");
      expect(compile(source, { filename: file, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(source, { filename: file, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("selects truthful CLI dependencies per framework", () => {
    const react = run("add", "code-editor", "--target", "/tmp/rr-code-editor-react-dry", "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("npm: lucide-react@^0.400.0");
    expect(react.stdout).toContain("shadcn:");
    expect(react.stdout).toContain("lib/shared/agentic/use-agent-tools.ts");

    const svelte = run("add", "code-editor", "--framework", "sveltekit", "--target", "/tmp/rr-code-editor-svelte-dry", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("npm: svelte@^5");
    expect(svelte.stdout).toContain("frontend/slices/code-editor/lib/editor-core.ts");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("shadcn:");
    expect(svelte.stdout).not.toContain("shared/agentic");
  });
});
