// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("inventory layout contract", () => {
  it("mounts the shared FeatureShell with featureId=inventory", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/inventory/views/InventoryPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="inventory"');
  });
});
