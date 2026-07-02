// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("petty-cash layout contract", () => {
  it("mounts the shared FeatureShell with featureId=petty-cash", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/petty-cash/views/PettyCashPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="petty-cash"');
  });
});
