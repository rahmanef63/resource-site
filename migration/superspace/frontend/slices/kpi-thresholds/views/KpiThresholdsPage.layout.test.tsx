// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("kpi-thresholds layout contract", () => {
  it("mounts the shared FeatureShell with featureId=kpi-thresholds", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/kpi-thresholds/views/KpiThresholdsPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="kpi-thresholds"');
  });
});
