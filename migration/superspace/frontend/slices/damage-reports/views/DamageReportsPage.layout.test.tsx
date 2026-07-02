// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("damage-reports layout contract", () => {
  it("mounts the shared FeatureShell with featureId=damage-reports", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/damage-reports/views/DamageReportsPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="damage-reports"');
  });
});
