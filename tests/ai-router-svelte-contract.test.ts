// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("ai-router Svelte distribution", () => {
  it("keeps Svelte UI and shared core free of React/Next/Lucide/shadcn coupling", () => {
    const source = [
      "frontend/slices/ai-router-svelte/components/ChatFab.svelte",
      "frontend/slices/ai-router-svelte/index.ts",
      "frontend/slices/ai-router/config.ts",
      "frontend/slices/ai-router/lib/core.ts",
      "frontend/slices/ai-router/lib/tools.ts",
    ].map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
    expect(source).not.toContain("defineFeature");
  });

  it("uses Svelte 5 reactive primitives without effect-driven chat state", () => {
    const source = readFileSync("frontend/slices/ai-router-svelte/components/ChatFab.svelte", "utf8");
    expect(source).toContain("$props()");
    expect(source).toContain("$derived(");
    expect(source).toContain("{#each messages as message (message.id)}");
    expect(source).toContain("routePrompt(route");
    expect(source).not.toContain("$effect(");
  });

  it("matches the real authenticated Convex backend contract", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/ai-router/slice.json", "utf8"));
    const action = readFileSync("convex/features/ai/action.ts", "utf8");
    const schema = readFileSync("convex/features/ai/_schema.ts", "utf8");
    expect(slice.contract.provides.convex.tables).toEqual(["aiUsage"]);
    expect(slice.contract.provides.convex.tables).toEqual(["aiUsage"]);
    expect(action).toContain("ctx.auth.getUserIdentity()");
    expect(action.indexOf("ctx.auth.getUserIdentity()")).toBeLessThan(action.indexOf("OPENROUTER_API_KEY"));
    expect(schema).toContain("aiUsage: defineTable");
    expect(schema).not.toContain("ai_router_calls");
  });
});
