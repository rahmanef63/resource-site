// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("StatusView layout contract", () => {
  it("uses the shared feature layout without custom mobile branching", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/status/StatusView.tsx"), "utf8");

    expect(source).toContain("FeatureThreeColumnLayout");
    expect(source).toContain('preset="feature"');
    expect(source).toContain('storageKey="status-layout"');
    expect(source).toContain("persistState={true}");
    expect(source).toContain("rightHidden");
    expect(source).not.toContain("useIsMobile");
    expect(source).not.toContain("SecondarySidebarLayout");
  });
});
