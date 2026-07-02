// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("asset-management layout contract", () => {
  it("mounts the shared FeatureShell with featureId=asset-management", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/asset-management/views/AssetManagementPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="asset-management"');
  });
});
