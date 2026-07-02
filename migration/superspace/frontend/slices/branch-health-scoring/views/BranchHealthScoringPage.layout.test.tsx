// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("branch-health-scoring layout contract", () => {
  it("mounts the shared FeatureShell with featureId=branch-health-scoring", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/branch-health-scoring/views/BranchHealthScoringPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="branch-health-scoring"');
  });
});
