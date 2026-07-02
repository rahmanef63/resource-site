// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("import-export layout contract", () => {
  it("mounts the shared FeatureShell with featureId=import-export", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/import-export/views/ImportExportPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="import-export"');
  });
});
