// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("CmsLitePage layout contract", () => {
  it("uses the shared feature layout with admin preset", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/cms-lite/views/CmsLitePage.tsx"), "utf8");

    expect(source).toContain("FeatureThreeColumnLayout");
    expect(source).toContain('preset="admin"');
    expect(source).toContain('storageKey="cms-lite-layout"');
    expect(source).toContain("persistState={true}");
    expect(source).toContain("rightHidden");
    expect(source).not.toContain("SecondarySidebarLayout");
  });
});
