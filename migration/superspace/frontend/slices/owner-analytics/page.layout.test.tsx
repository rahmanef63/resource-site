// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("owner-analytics layout contract", () => {
  it("mounts the shared FeatureShell with featureId=owner-analytics", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/owner-analytics/page.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="owner-analytics"');
  });
});
