// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("customer-loyalty layout contract", () => {
  it("mounts the shared FeatureShell with featureId=customer-loyalty", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/customer-loyalty/views/CustomerLoyaltyPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="customer-loyalty"');
  });
});
