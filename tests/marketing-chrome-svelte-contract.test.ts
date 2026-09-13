import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/marketing-chrome-svelte";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("marketing-chrome Svelte distribution contract", () => {
  it("stays native Svelte without React/Next/Lucide/shadcn leakage", () => {
    const source = sourceFiles(root)
      .filter((path) => /\.(ts|svelte)$/.test(path))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next\//);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("reuses the exact portable core and configure tool", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual([
      "frontend/slices/marketing-chrome/lib/core.ts",
      "frontend/slices/marketing-chrome/lib/tools.ts",
    ]);
  });

  it("preserves native mobile close/security and footer semantics", () => {
    const header = readFileSync(`${root}/components/MarketingHeader.svelte`, "utf8");
    const footer = readFileSync(`${root}/components/MarketingFooter.svelte`, "utf8");
    expect(header).toContain("showModal()");
    expect(header).toContain("externalLinkAttrs(item.external)");
    expect(header).toContain("orderedCtas(secondaryCta, cta)");
    expect(header).toContain("onclick={closeMenu}");
    expect(footer).toContain('target="_blank"');
    expect(footer).toContain('rel="noreferrer noopener"');
    expect(footer).toContain("SOCIAL_TEXT[item.kind]");
  });
});
