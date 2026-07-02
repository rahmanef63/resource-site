// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("bi layout contract", () => {
  it("mounts the shared FeatureShell with featureId=bi", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/bi/views/BiPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="bi"');
  });
});
