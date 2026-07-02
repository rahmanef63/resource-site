// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("SupportDashboard layout contract", () => {
  it("uses the shared feature layout without custom mobile branching", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/support/components/SupportDashboard.tsx"), "utf8");

    expect(source).toContain("FeatureThreeColumnLayout");
    expect(source).toContain('preset="feature"');
    expect(source).toContain('storageKey="support-layout"');
    expect(source).toContain("persistState={true}");
    expect(source).toContain("rightHidden");
    expect(source).not.toContain("useIsMobile");
    expect(source).not.toContain("SecondarySidebarLayout");
  });
});
