// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("user-management layout contract", () => {
  it("mounts the shared FeatureShell with featureId=user-management", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/user-management/page.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="user-management"');
  });
});
