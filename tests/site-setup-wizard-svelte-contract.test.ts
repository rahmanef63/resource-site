// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const svelteRoot = path.join(process.cwd(), "frontend/slices/site-setup-wizard-svelte");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(file) : /\.(svelte|ts)$/.test(entry.name) ? [file] : [];
  });
}

describe("site-setup-wizard Svelte distribution", () => {
  it("keeps Svelte source free of React/Next/Lucide/shadcn imports", () => {
    const source = sourceFiles(svelteRoot).map((file) => readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next(?:\/|["'])/);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("preserves the real wizard seams instead of shipping placeholder UI", () => {
    const wizard = readFileSync(path.join(svelteRoot, "components/OnboardingWizard.svelte"), "utf8");
    const branding = readFileSync(path.join(svelteRoot, "components/StepBranding.svelte"), "utf8");
    expect(wizard).toContain("createOnboardingStore");
    expect(wizard).toContain("Lewati setup");
    expect(wizard).toContain("seedSample");
    expect(wizard).toContain("buildOnboardingSavePayload");
    expect(branding).toContain("ThemePresetField");
    expect(branding).toContain("onPresetPreview");
    expect(branding).toContain("imageField");
    expect(branding).toContain("analyticsId");
  });

  it("shares only the portable core and agent tools", () => {
    const slice = JSON.parse(readFileSync("frontend/slices/site-setup-wizard/slice.json", "utf8"));
    expect(slice.frontend.frameworks["svelte-sveltekit"].deps.sharedFiles).toEqual([
      "frontend/slices/site-setup-wizard/lib/core.ts",
      "frontend/slices/site-setup-wizard/lib/tools.ts",
    ]);
    const core = readFileSync("frontend/slices/site-setup-wizard/lib/core.ts", "utf8");
    expect(core).not.toMatch(/from ["']react["']/);
    expect(core).toContain("createOnboardingStore");
    expect(core).toContain("isValidOptionalEmail");
  });
});
