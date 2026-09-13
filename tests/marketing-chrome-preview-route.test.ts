import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("marketing-chrome public preview route", () => {
  it("hosts the canonical preview module instead of duplicating seed data", () => {
    const route = readFileSync("app/preview/slices/marketing-chrome/page.tsx", "utf8");
    expect(route).toContain('from "@/features/marketing-chrome/preview"');
    expect(route).toContain("preview.MarketingHeader");
    expect(route).toContain("preview.MarketingFooter");
    expect(route).not.toContain("const NAV");
    expect(route).not.toContain("const COLUMNS");
  });
});
