// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("integrations layout contract", () => {
  it("mounts the shared FeatureShell with featureId=integrations", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/integrations/views/IntegrationsPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="integrations"');
  });
});
