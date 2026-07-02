// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("documents layout contract", () => {
  it("mounts the shared FeatureShell with featureId=documents", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/documents/page.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="documents"');
  });
});
