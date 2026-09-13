import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const route = "app/preview/slices/theme-presets/page.tsx";

describe("theme-presets public preview route", () => {
  it("hosts canonical preview.tsx instead of a second theme playground", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/theme-presets/preview"');
    expect(source).toContain("preview.ThemePresetSwitcher");
    expect(source).not.toContain("ThemePresetProvider");
    expect(source).not.toContain("ThemeWidgets");
    expect(existsSync("app/preview/slices/theme-presets/SwitcherSpotlight.tsx")).toBe(false);
    expect(existsSync("app/preview/slices/theme-presets/theme-widgets.tsx")).toBe(false);
    expect(existsSync("app/preview/slices/theme-presets/theme-widgets-b.tsx")).toBe(false);
  });
});
