// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("sales layout contract", () => {
  it("mounts the shared FeatureShell with featureId=sales", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/sales/views/SalesPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="sales"');
  });
});
