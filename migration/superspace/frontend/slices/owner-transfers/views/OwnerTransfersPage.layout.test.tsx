// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("owner-transfers layout contract", () => {
  it("mounts the shared FeatureShell with featureId=owner-transfers", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/owner-transfers/views/OwnerTransfersPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="owner-transfers"');
  });
});
