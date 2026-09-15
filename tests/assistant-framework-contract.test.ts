// @vitest-environment node
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";
import { automationPrompt, buildWireMessages } from "../frontend/slices/assistant/lib/chat-core";
import { PRESET_AGENTS, PRESET_AUTOMATIONS } from "../frontend/slices/assistant/lib/presets";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const slice = JSON.parse(read("frontend/slices/assistant/slice.json"));

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
  ["packages/cli/bin/cli.js", "add", "assistant", ...(framework ? ["--framework", framework] : []), "--target", "/tmp/rr-assistant-test", "--dry-run"],
  { cwd: root, encoding: "utf8" },
);

describe("assistant framework distribution", () => {
  it("keeps React default and selects native Svelte over the shared agent/store core", () => {
    expect(slice.version).toBe("1.2.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"]).toMatchObject({
      path: "frontend/slices/assistant-svelte",
      aliases: ["svelte", "sveltekit"],
      deps: { npm: ["svelte@^5", "@lucide/svelte@^1.46.0"], shadcn: [] },
    });
    expect(slice.deps.sharedFiles).toEqual([
      "lib/shared/agentic/types.ts",
      "lib/shared/agentic/host.ts",
      "lib/shared/agentic/agent-loop.ts",
      "lib/shared/agentic/prompt.ts",
      "lib/shared/agentic/registry.ts",
      "lib/shared/agentic/global-host.ts",
    ]);
  });

  it("keeps React/Next/shadcn/use-agent-tools out of Svelte and portable cores", () => {
    const files = [
      ...svelteFiles(join(root, "frontend/slices/assistant-svelte")),
      join(root, "frontend/slices/assistant-svelte/index.ts"),
      join(root, "frontend/slices/assistant/lib/agentic-host.ts"),
      join(root, "frontend/slices/assistant/lib/chat-core.ts"),
      join(root, "frontend/slices/assistant/lib/store-core.ts"),
      join(root, "frontend/slices/assistant/lib/stream-core.ts"),
      join(root, "frontend/slices/assistant/lib/tools.ts"),
    ];
    const joined = files.map((file) => readFileSync(file, "utf8")).join("\n");
    for (const bad of ['from "react"', 'from "next', "@/components/ui/", "lucide-react", "use-agent-tools", "useAgentTools"]) {
      expect(joined).not.toContain(bad);
    }
  });

  it("compiles every Svelte surface client+server without warnings", () => {
    for (const filename of svelteFiles(join(root, "frontend/slices/assistant-svelte"))) {
      const source = readFileSync(filename, "utf8");
      expect(compile(source, { filename, generate: "client", dev: false }).warnings).toEqual([]);
      expect(compile(source, { filename, generate: "server", dev: false }).warnings).toEqual([]);
    }
  });

  it("shares persona/history and automation prompt semantics", () => {
    const agent = PRESET_AGENTS[0];
    const wire = buildWireMessages(agent, [{ id: "1", role: "assistant", text: "Earlier" }], "Hello");
    expect(wire[0]).toEqual({ role: "user", text: `[System — you are ${agent.name}] ${agent.persona}` });
    expect(wire.at(-1)).toEqual({ role: "user", text: "Hello" });
    expect(automationPrompt(PRESET_AUTOMATIONS[0])).toContain('Run the automation “Daily Setup”');
  });

  it("selects truthful CLI dependencies and agentic closure per framework", () => {
    const react = dryRun();
    expect(react.status).toBe(0);
    expect(react.stdout).toContain("lucide-react@^0.400.0");
    expect(react.stdout).toContain("shadcn:");
    expect(react.stdout).toContain("lib/shared/agentic/agent-loop.ts →");
    expect(react.stdout).not.toContain("use-agent-tools.ts →");

    const svelte = dryRun("sveltekit");
    expect(svelte.status).toBe(0);
    expect(svelte.stdout).toContain("frontend/slices/assistant-svelte → frontend/slices/assistant-svelte");
    expect(svelte.stdout).toContain("svelte@^5");
    expect(svelte.stdout).toContain("@lucide/svelte@^1.46.0");
    expect(svelte.stdout).toContain("frontend/slices/assistant/lib/store-core.ts →");
    expect(svelte.stdout).toContain("lib/shared/agentic/agent-loop.ts →");
    expect(svelte.stdout).not.toContain("lucide-react");
    expect(svelte.stdout).not.toContain("use-agent-tools.ts");
    expect(svelte.stdout).not.toContain("shadcn:");
  });
});
