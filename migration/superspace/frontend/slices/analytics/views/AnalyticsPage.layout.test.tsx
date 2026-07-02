// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("analytics layout contract", () => {
  it("mounts the shared FeatureShell with featureId=analytics", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/analytics/views/AnalyticsPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="analytics"');
  });
});
