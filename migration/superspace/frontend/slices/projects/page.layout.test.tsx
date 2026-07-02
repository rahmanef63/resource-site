// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("projects layout contract", () => {
  it("mounts the shared FeatureShell with featureId=projects", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/projects/page.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="projects"');
  });
});
