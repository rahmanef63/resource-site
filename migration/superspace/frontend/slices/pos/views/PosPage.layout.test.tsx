// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("pos layout contract", () => {
  it("mounts the shared FeatureShell with featureId=pos", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/pos/views/PosPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="pos"');
  });
});
