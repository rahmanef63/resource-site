// @vitest-environment node
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const files = [
  "frontend/slices/platform-admin/config.ts",
  "frontend/slices/platform-admin/index.ts",
  "frontend/slices/platform-admin/lib/tools.ts",
];

describe("platform-admin Svelte-facing contract", () => {
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

  it("publishes only the real headless tool surface", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/platform-admin/slice.json", "utf8"));
    expect(slice.kind).toBe("backend");
    expect(slice.convex).toBeUndefined();
    expect(slice.previews).toEqual([]);
    expect(slice.contract.provides.components).toEqual([]);
    expect(slice.contract.provides.hooks).toEqual([]);
    expect(slice.contract.provides.tables).toEqual([]);
    expect(slice.contract.provides.routes).toEqual([]);
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps).toEqual({ npm: [], shadcn: [] });
  });

  it("removes the synthetic multi-tenant preview", () => {
    expect(existsSync("app/preview/slices/platform-admin/page.tsx")).toBe(false);
  });
});
