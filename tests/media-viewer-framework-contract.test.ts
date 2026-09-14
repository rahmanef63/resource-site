// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { compile } from "svelte/compiler";

const targets: string[] = [];
const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

function target() {
  const dir = mkdtempSync(path.join(os.tmpdir(), "rr-media-viewer-"));
  targets.push(dir);
  return dir;
}

function runCli(...args: string[]) {
  return spawnSync(process.execPath, ["packages/cli/bin/cli.js", ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const dir of targets.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("media-viewer framework distribution", () => {
  it("keeps React default and selects native Svelte over shared media cores", () => {
    const slice = JSON.parse(read("frontend/slices/media-viewer/slice.json"));
    expect(slice.version).toBe("1.3.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/media-viewer-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5"], shadcn: [] },
    });
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([
      "frontend/slices/media-viewer/lib/host-core.ts",
      "frontend/slices/media-viewer/lib/media.ts",
      "frontend/slices/media-viewer/lib/remote.ts",
      "frontend/slices/media-viewer/lib/samples.ts",
      "frontend/slices/media-viewer/lib/tools.ts",
    ]);
    expect(slice.deps.sharedFiles).toContain("lib/shared/agentic/use-agent-tools.ts");
  });

  it("keeps React, Next, Lucide and shadcn runtime out of Svelte", () => {
    const dir = path.join(root, "frontend/slices/media-viewer-svelte/components");
    const svelte = readdirSync(dir)
      .filter((name) => name.endsWith(".svelte"))
      .map((name) => read(`frontend/slices/media-viewer-svelte/components/${name}`))
      .join("\n");
    const index = read("frontend/slices/media-viewer-svelte/index.ts");
    const tools = read("frontend/slices/media-viewer/lib/tools.ts");
    expect(`${svelte}\n${index}`).not.toContain('from "react"');
    expect(`${svelte}\n${index}`).not.toContain('from "next');
    expect(`${svelte}\n${index}`).not.toContain("lucide-react");
    expect(`${svelte}\n${index}`).not.toContain("@/components/ui/");
    expect(tools).not.toContain("shared/agentic");
    expect(tools).toContain("export const mediaViewerTools = {");
  });

  it("compiles every Svelte component for client and server without warnings", () => {
    const dir = path.join(root, "frontend/slices/media-viewer-svelte/components");
    for (const name of readdirSync(dir).filter((entry) => entry.endsWith(".svelte"))) {
      const filename = path.join(dir, name);
      const source = readFileSync(filename, "utf8");
      expect(compile(source, { filename, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(source, { filename, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("selects truthful dependencies in CLI dry-runs", () => {
    const react = runCli("add", "media-viewer", "--target", target(), "--dry-run");
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("frontend/slices/media-viewer →");
    expect(react.stdout).toContain("lucide-react");
    expect(react.stdout).toContain("shadcn: button badge separator tooltip slider");
    expect(react.stdout).toContain("lib/shared/agentic/use-agent-tools.ts →");

    const svelte = runCli("add", "media-viewer", "--target", target(), "--framework", "sveltekit", "--dry-run");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/media-viewer-svelte →");
    expect(svelte.stdout).toContain("frontend/slices/media-viewer/lib/host-core.ts →");
    expect(svelte.stdout).toContain("frontend/slices/media-viewer/lib/tools.ts →");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("lib/shared/agentic/");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
