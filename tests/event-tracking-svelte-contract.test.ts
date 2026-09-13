// @vitest-environment node
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const files = [
  "frontend/slices/event-tracking/config.ts",
  "frontend/slices/event-tracking/index.ts",
  "frontend/slices/event-tracking/lib/tools.ts",
];

describe("event-tracking Svelte-facing contract", () => {
  it("stays framework-neutral instead of inventing a renderer", () => {
    const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("@/components/ui/");
    expect(source).not.toContain("@/lib/shared/features/defineFeature");
    expect(source).not.toContain('from "@/shared/agentic"');
    expect(source).toContain('from "@/shared/agentic/define"');
    expect(source).toContain('from "@/shared/agentic/schema"');
  });

  it("does not publish a synthetic preview route for the headless contract", () => {
    expect(existsSync("app/preview/slices/event-tracking/page.tsx")).toBe(false);
  });

  it("advertises no UI component and no framework runtime dependency", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/event-tracking/slice.json", "utf8"));
    expect(slice.kind).toBe("backend");
    expect(slice.previews).toEqual([]);
    expect(slice.contract.provides.components).toEqual([]);
    expect(slice.contract.requires.deps).toEqual([]);
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps).toEqual({ npm: [], shadcn: [] });
  });
});
