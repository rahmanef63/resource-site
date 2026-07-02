// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("knowledge layout contract", () => {
  it("mounts the shared FeatureShell with featureId=knowledge", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/knowledge/page.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="knowledge"');
  });
});
