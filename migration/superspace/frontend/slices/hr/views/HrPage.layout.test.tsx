// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("hr layout contract", () => {
  it("mounts the shared FeatureShell with featureId=hr", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/hr/views/HrPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="hr"');
  });
});
