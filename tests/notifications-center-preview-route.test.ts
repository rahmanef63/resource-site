import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = "app/preview/slices/notifications-center/page.tsx";

describe("notifications-center public preview route", () => {
  it("hosts the canonical preview module instead of duplicating notification seed data", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/notifications-center/preview"');
    expect(source).toContain("preview.NotificationBell");
    expect(source).toContain("preview.NotificationList");
    expect(source).not.toContain("const SEED");
    expect(source).not.toContain("createMemoryNotificationsAdapter");
  });
});
