// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("platform-admin layout contract", () => {
  it("mounts FeatureThreeColumnLayout with platform-admin storageKey", () => {
    const source = readFileSync(
      resolve(process.cwd(), "frontend/slices/platform-admin/views/PlatformAdminPageNew.tsx"),
      "utf8",
    );
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('storageKey="platform-admin-layout"');
  });
});
