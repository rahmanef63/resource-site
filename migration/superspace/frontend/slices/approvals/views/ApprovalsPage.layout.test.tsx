// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("approvals layout contract", () => {
  it("mounts the shared FeatureShell with featureId=approvals", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/approvals/views/ApprovalsPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="approvals"');
  });
});
