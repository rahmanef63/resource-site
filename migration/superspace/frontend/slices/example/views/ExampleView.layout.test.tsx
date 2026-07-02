// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("example layout contract", () => {
  it("mounts FeatureShell with featureId=example", () => {
    const source = readFileSync(
      resolve(process.cwd(), "frontend/slices/example/views/ExampleView.tsx"),
      "utf8",
    );
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="example"');
  });
});
