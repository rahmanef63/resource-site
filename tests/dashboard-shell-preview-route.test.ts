// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("dashboard-shell public preview route", () => {
  it("hosts canonical preview.tsx instead of duplicating nav/mobile shell logic", () => {
    const source = readFileSync(
      "app/preview/slices/dashboard-shell/page.tsx",
      "utf8",
    );
    expect(source).toContain('import preview from "@/features/dashboard-shell/preview"');
    expect(source).toContain("preview.DashboardShell");
    expect(source).not.toContain("DEMO_NAV");
    expect(source).not.toContain("MobileDock");
    expect(source).not.toContain("MobileMenuDrawer");
  });
});
