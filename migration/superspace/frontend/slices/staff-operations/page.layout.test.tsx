// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("staff-operations layout contract", () => {
  it("mounts the shared FeatureShell with featureId=staff-operations", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/staff-operations/page.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="staff-operations"');
  });
});
