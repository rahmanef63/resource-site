// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { compile } from "svelte/compiler";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const slice = JSON.parse(readFileSync(join(root, "frontend/slices/ai-workspace/slice.json"), "utf8"));

function filesUnder(dir: string, suffix: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path, suffix) : path.endsWith(suffix) ? [path] : [];
  });
}
function dryRun(variant: string | undefined, framework?: string) {
  const args = ["packages/cli/bin/cli.js", "add", "ai-workspace"];
  if (variant) args.push(variant);
  args.push("--target", `/tmp/rr-ai-workspace-${framework ?? "react"}-${variant ?? "all"}-dry`, "--dry-run");
  if (framework) args.push("--framework", framework);
  return spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
}
function expectClean(result: ReturnType<typeof dryRun>) {
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  expect(result.stdout).not.toContain("@ai-sdk/openai");
  expect(result.stdout).not.toContain("OPENAI_API_KEY");
  expect(result.stdout).not.toContain("GOOGLE_GENERATIVE_AI_API_KEY");
}

describe("ai-workspace framework + variant distribution", () => {
  it("keeps React default and declares native SvelteKit", () => {
    expect(slice.version).toBe("0.4.0");
    expect(slice.frontend.defaultFramework).toBe("react-next");
    expect(slice.frontend.frameworks["svelte-sveltekit"].path).toBe("frontend/slices/ai-workspace-svelte");
    expect(slice.deps.npm).toEqual(["lucide-react@^0.400.0"]);
    expect(slice.deps.env).toEqual([]);
  });

  it("keeps every Svelte surface renderer-clean and compiler-clean", () => {
    const dir = join(root, "frontend/slices/ai-workspace-svelte");
    const files = filesUnder(dir, ".svelte");
    const source = files.concat(filesUnder(dir, ".ts")).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(files.length).toBe(6);
    for (const token of ['from "react"', "lucide-react", "@/components/ui/", 'from "next', "@ai-sdk/"]) expect(source).not.toContain(token);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const generate of ["client", "server"] as const) expect(compile(text, { filename: file, generate, dev: true }).warnings).toEqual([]);
    }
  });

  it("gates React dependencies exactly per variant", () => {
    const chat = dryRun("chat"); expectClean(chat);
    expect(chat.stdout).toContain("frontend/slices/ai-workspace/variants/chat → frontend/slices/ai-workspace");
    expect(chat.stdout).toContain("convex/features/aiChat → convex/features/aiChat");
    expect(chat.stdout).toContain("lucide-react@^0.400.0");
    expect(chat.stdout).toContain("ai@^4.0.0");
    expect(chat.stdout).toContain("@ai-sdk/anthropic@^0.0.50");
    expect(chat.stdout).toContain("ANTHROPIC_API_KEY");

    for (const variant of ["studio", "agents"]) {
      const result = dryRun(variant); expectClean(result);
      expect(result.stdout).toContain(`frontend/slices/ai-workspace/variants/${variant} → frontend/slices/ai-workspace`);
      expect(result.stdout).toContain("lucide-react@^0.400.0");
      expect(result.stdout).not.toContain("convex/features/aiChat");
      expect(result.stdout).not.toContain("ai@^4.0.0");
      expect(result.stdout).not.toContain("@ai-sdk/anthropic");
      expect(result.stdout).not.toContain("ANTHROPIC_API_KEY");
    }
  });

  it("gates Svelte dependencies and portable closures exactly per variant", () => {
    const chat = dryRun("chat", "sveltekit"); expectClean(chat);
    expect(chat.stdout).toContain("frontend/slices/ai-workspace-svelte/variants/chat → frontend/slices/ai-workspace-svelte");
    expect(chat.stdout).toContain("frontend/slices/ai-workspace/variants/chat/core.ts");
    expect(chat.stdout).toContain("frontend/slices/ai-workspace/variants/chat/agentic-send.ts");
    expect(chat.stdout).toContain("lib/shared/agentic/agent-loop.ts");
    expect(chat.stdout).toContain("npm: svelte@^5 ai@^4.0.0 @ai-sdk/anthropic@^0.0.50");
    expect(chat.stdout).toContain("ANTHROPIC_API_KEY");
    expect(chat.stdout).not.toContain("lucide-react");
    expect(chat.stdout).not.toContain("shadcn:");

    const studio = dryRun("studio", "sveltekit"); expectClean(studio);
    for (const file of ["types.ts", "stub.ts", "tools.ts"]) expect(studio.stdout).toContain(`frontend/slices/ai-workspace/variants/studio/${file}`);
    expect(studio.stdout).toContain("lib/shared/agentic/define.ts");
    expect(studio.stdout).toContain("npm: svelte@^5");
    expect(studio.stdout).not.toContain("convex/features/aiChat");
    expect(studio.stdout).not.toContain("@ai-sdk/anthropic");
    expect(studio.stdout).not.toContain("ANTHROPIC_API_KEY");

    const agents = dryRun("agents", "sveltekit"); expectClean(agents);
    for (const file of ["types.ts", "runner.ts", "views/demo.ts"]) expect(agents.stdout).toContain(`frontend/slices/ai-workspace/variants/agents/${file}`);
    expect(agents.stdout).toContain("lib/shared/agentic/agent-loop.ts");
    expect(agents.stdout).toContain("npm: svelte@^5");
    expect(agents.stdout).not.toContain("convex/features/aiChat");
    expect(agents.stdout).not.toContain("@ai-sdk/anthropic");
    expect(agents.stdout).not.toContain("ANTHROPIC_API_KEY");
  });

  it("add-all receives the truthful union without unused providers", () => {
    for (const framework of [undefined, "sveltekit"] as const) {
      const result = dryRun(undefined, framework); expectClean(result);
      expect(result.stdout).toContain("convex/features/aiChat");
      expect(result.stdout).toContain("ai@^4.0.0");
      expect(result.stdout).toContain("@ai-sdk/anthropic@^0.0.50");
      expect(result.stdout).toContain("ANTHROPIC_API_KEY");
    }
  });
});
