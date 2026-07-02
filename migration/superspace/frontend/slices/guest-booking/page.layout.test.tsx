// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("guest-booking layout contract", () => {
  it("mounts the shared FeatureShell with featureId=guest-booking", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/guest-booking/page.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="guest-booking"');
  });
});
