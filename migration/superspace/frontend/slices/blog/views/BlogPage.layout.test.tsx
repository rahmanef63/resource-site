// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("blog layout contract", () => {
  it("mounts the shared FeatureShell with featureId=blog", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/blog/views/BlogPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="blog"');
  });
});
