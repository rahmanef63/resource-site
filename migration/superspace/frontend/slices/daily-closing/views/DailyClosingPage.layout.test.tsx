// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("daily-closing layout contract", () => {
  it("mounts the shared FeatureShell with featureId=daily-closing", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/daily-closing/views/DailyClosingPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="daily-closing"');
  });
});
