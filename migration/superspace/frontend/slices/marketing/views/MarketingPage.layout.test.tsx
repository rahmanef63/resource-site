// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("marketing layout contract", () => {
  it("mounts the shared FeatureShell with featureId=marketing", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/marketing/views/MarketingPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="marketing"');
  });
});
