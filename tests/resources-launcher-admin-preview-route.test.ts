// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("resources-launcher-admin public preview route", () => {
  it("hosts canonical preview.tsx instead of mounting the app directly", () => {
    const source = readFileSync("app/preview/slices/resources-launcher-admin/page.tsx", "utf8");
    expect(source).toContain('import preview from "@/features/resources-launcher-admin/preview"');
    expect(source).toContain("preview.ResourcesAdmin");
    expect(source).not.toContain('import { ResourcesAdmin } from "@/features/resources-launcher-admin"');
  });
});
