// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("operational-checklist layout contract", () => {
  it("mounts the shared FeatureShell with featureId=operational-checklist", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/operational-checklist/views/OperationalChecklistPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="operational-checklist"');
  });
});
