import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

const route = "app/preview/slices/site-setup-wizard/page.tsx";

describe("site-setup-wizard public preview route", () => {
  it("hosts canonical preview.tsx instead of a second theme-coupled playground", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/site-setup-wizard/preview"');
    expect(source).toContain("preview.OnboardingWizard");
    expect(source).not.toContain("ThemePresetProvider");
    expect(source).not.toContain("WizardPlayground");
    expect(existsSync("app/preview/slices/site-setup-wizard/wizard-playground.tsx")).toBe(false);
  });
});
