// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("accounting layout contract", () => {
  it("mounts the shared FeatureShell with featureId=accounting", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/accounting/views/AccountingPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="accounting"');
  });
});
