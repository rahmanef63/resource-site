// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("maintenance-scheduling layout contract", () => {
  it("mounts the shared FeatureShell with featureId=maintenance-scheduling", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/maintenance-scheduling/views/MaintenanceSchedulingPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="maintenance-scheduling"');
  });
});
