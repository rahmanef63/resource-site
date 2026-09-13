import { describe, expect, it } from "vitest";
import { createMemoryNotificationsAdapter } from "../../notifications-center/lib/adapter";
import { createNotificationsStore } from "./store";

const rows = [
  { id: "a", title: "A", kind: "info" as const, read: false, createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("createNotificationsStore", () => {
  it("tracks adapter mutations through the shared state core", () => {
    const adapter = createMemoryNotificationsAdapter(rows);
    const store = createNotificationsStore(adapter);
    const seen: number[] = [];
    const unsubscribe = store.subscribe((state) => seen.push(state.unreadCount));
    adapter.markRead("a");
    unsubscribe();
    expect(seen).toEqual([1, 0]);
  });
});
