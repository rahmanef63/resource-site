// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/theme-presets-svelte");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

const sharedFiles = [
  "frontend/slices/theme-presets/lib/core.ts",
  "frontend/slices/theme-presets/lib/tools.ts",
  "frontend/slices/theme-presets/lib/tweakcn.ts",
  "frontend/slices/theme-presets/lib/tweakcn/apply.ts",
  "frontend/slices/theme-presets/lib/tweakcn/cssBuilder.ts",
  "frontend/slices/theme-presets/lib/tweakcn/groups.ts",
  "frontend/slices/theme-presets/lib/tweakcn/registry-data.json",
  "frontend/slices/theme-presets/lib/tweakcn/registry.ts",
  "frontend/slices/theme-presets/lib/tweakcn/tokens.ts",
  "frontend/slices/theme-presets/lib/tweakcn/types.ts",
];

describe("theme-presets Svelte distribution", () => {
  it("keeps native Svelte surfaces free of React/Next/Lucide/shadcn/next-themes", () => {
    const source = sourceFiles(svelteRoot).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("next-themes");
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("preserves provider, preset preview/restore, display mode, site-default save, and theme-color seams", () => {
    const provider = readFileSync(path.join(svelteRoot, "components/ThemePresetProvider.svelte"), "utf8");
    const switcher = readFileSync(path.join(svelteRoot, "components/ThemePresetSwitcher.svelte"), "utf8");
    const save = readFileSync(path.join(svelteRoot, "components/SaveSiteDefaultButton.svelte"), "utf8");
    const color = readFileSync(path.join(svelteRoot, "components/ThemeColorSync.svelte"), "utf8");
    expect(provider).toContain("preset.init()");
    expect(provider).toContain("setHostDefault");
    expect(provider).toContain("setSiteDefault");
    expect(switcher).toContain("groupTweakcnPresets");
    expect(switcher).toContain("tweakcnSwatches");
    expect(switcher).toContain("preset.preview");
    expect(switcher).toContain("preset.restore");
    expect(switcher).toContain("mode.setMode");
    expect(save).toContain("onSave(snapshot.presetName)");
    expect(color).toContain('meta[name="theme-color"]');
  });

  it("shares the exact portable registry/apply/state/tool files instead of duplicating them", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/theme-presets/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual(sharedFiles);
    for (const file of sharedFiles.filter((file) => !file.endsWith(".json"))) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/from ["']react["']/);
      expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
      expect(source).not.toContain("lucide-react");
      expect(source).not.toContain("@/components/ui/");
    }
  });
});
