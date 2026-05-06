// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("StudioPage layout contract", () => {
  it("documents IDE layout usage explicitly", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/studio/pages/StudioPage.tsx"), "utf8");
    expect(source).toContain('preset="ide"');
    expect(source).toContain('storageKey="studio-layout"');
    expect(source).toContain("persistState={true}");
    expect(source).toContain('className="flex-1 min-h-0"');
    expect(source).toContain('ThreeColumnLayoutAdvanced');
  });
});
