import { describe, expect, it } from "vitest";
import { deriveMembersView, nextSort } from "./members-core";
import type { Member } from "../types";

const members: Member[] = [
  { userId: "2", name: "Zara", email: "z@example.com", roleSlug: "staff", status: "active", joinedAt: 20 },
  { userId: "1", name: "Ali", email: "a@example.com", roleSlug: "admin", status: "active", joinedAt: 10 },
  { userId: "3", email: "bob@example.com", roleSlug: "staff", status: "inactive", joinedAt: 30 },
];

describe("user-management members core", () => {
  it("filters by search/role and sorts deterministically", () => {
    expect(deriveMembersView({ members, query: "", roleFilter: "all", sortKey: "name", sortDir: "asc" }).map((m) => m.userId)).toEqual(["1", "3", "2"]);
    expect(deriveMembersView({ members, query: "bob", roleFilter: "staff", sortKey: "joined", sortDir: "desc" }).map((m) => m.userId)).toEqual(["3"]);
  });

  it("toggles direction only for the active key", () => {
    expect(nextSort("name", "asc", "name")).toEqual({ sortKey: "name", sortDir: "desc" });
    expect(nextSort("name", "desc", "role")).toEqual({ sortKey: "role", sortDir: "asc" });
  });
});
