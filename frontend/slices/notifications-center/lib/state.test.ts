import { describe, expect, it } from "vitest";
import { createMemoryNotificationsAdapter } from "./adapter";
import { createNotificationsState, filterNotifications } from "./state";

const rows = [
  { id: "old", title: "Old", kind: "info" as const, read: true, createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "new", title: "New", kind: "success" as const, read: false, createdAt: "2026-02-01T00:00:00.000Z" },
];

describe("notifications state core", () => {
  it("sorts newest-first and counts unread", () => {
    const adapter = createMemoryNotificationsAdapter(rows);
    const state = createNotificationsState(adapter);
    expect(state.notifications.map((row) => row.id)).toEqual(["new", "old"]);
    expect(state.unreadCount).toBe(1);
  });

  it("filters unread without mutating input order", () => {
    expect(filterNotifications(rows, "unread").map((row) => row.id)).toEqual(["new"]);
    expect(rows.map((row) => row.id)).toEqual(["old", "new"]);
  });
});
