import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/quicklinks-svelte";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

describe("quicklinks Svelte distribution contract", () => {
  it("stays native Svelte without React/Next/Lucide/shadcn leakage", () => {
    const source = files(root)
      .filter((path) => /\.(ts|svelte)$/.test(path))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next\//);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("uses the canonical core instead of duplicating store/url logic", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual(["frontend/slices/quicklinks/lib/core.ts"]);

    const adapter = readFileSync(`${root}/lib/store.ts`, "utf8");
    const component = readFileSync(`${root}/components/QuicklinksApp.svelte`, "utf8");
    expect(adapter).toContain('../../quicklinks/lib/core');
    expect(component).toContain('../../quicklinks/lib/core');
    expect(component).toContain('openQuicklink(quicklink)');
  });
});
