import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/ai-core-svelte";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("ai-core Svelte distribution contract", () => {
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

  it("declares the exact shared portable cores", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual([
      "frontend/slices/ai-core/lib/format.ts",
      "frontend/slices/ai-core/lib/error-core.ts",
      "frontend/slices/ai-core/lib/theme.ts",
    ]);
  });

  it("preserves native dialog, section-reset boundary, error and theme semantics", () => {
    const dialog = readFileSync(`${root}/components/ResponsiveDialog.svelte`, "utf8");
    const boundary = readFileSync(`${root}/components/SectionErrorBoundary.svelte`, "utf8");
    const error = readFileSync(`${root}/components/ErrorLine.svelte`, "utf8");
    const theme = readFileSync(`${root}/lib/theme-store.ts`, "utf8");
    expect(dialog).toContain("showModal()");
    expect(dialog).toContain("oncancel={handleCancel}");
    expect(dialog).toContain("event.target === dialog");
    expect(boundary).toContain("{#key section}");
    expect(boundary).toContain("<svelte:boundary>");
    expect(error).toContain("presentError(e, labels)");
    expect(theme).toContain("readTheme(window.localStorage)");
    expect(theme).toContain("applyTheme(theme, document.documentElement, window.localStorage)");
  });
});
