// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("reports layout contract", () => {
  it("mounts the shared FeatureShell with featureId=reports", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/reports/views/ReportsPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="reports"');
  });
});
