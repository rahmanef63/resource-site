import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/content-loops-svelte";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("content-loops Svelte distribution contract", () => {
  it("stays native Svelte without React/Next/shadcn leakage", () => {
    const source = sourceFiles(root)
      .filter((path) => /\.(ts|svelte)$/.test(path))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next\//);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("shares registry, source, pagination, variant helper, and types from canonical core", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual([
      "frontend/slices/content-loops/lib/types.ts",
      "frontend/slices/content-loops/lib/registry.ts",
      "frontend/slices/content-loops/lib/mock-source.ts",
      "frontend/slices/content-loops/lib/pagination.ts",
      "frontend/slices/content-loops/lib/variants.ts",
    ]);

    const component = readFileSync(`${root}/components/ContentLoop.svelte`, "utf8");
    expect(component).toContain("loopSourceRegistry");
    expect(component).toContain("loopVariantIndex");
    expect(component).toContain("Snippet<[LoopItem, number]>");
  });
});
