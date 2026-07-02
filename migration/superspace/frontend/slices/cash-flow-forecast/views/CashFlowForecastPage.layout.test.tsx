// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("cash-flow-forecast layout contract", () => {
  it("mounts the shared FeatureShell with featureId=cash-flow-forecast", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/cash-flow-forecast/views/CashFlowForecastPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="cash-flow-forecast"');
  });
});
