import { describe, expect, it } from "vitest";
import { activeTitle, deriveDock, flattenNav, isActive } from "./nav";
import type { NavGroup } from "./types";

const nav: NavGroup[] = [
  {
    id: "main",
    label: "Workspace",
    items: [
      { id: "home", label: "Home", href: "/app", exact: true, dock: true },
      {
        id: "posts",
        label: "Posts",
        href: "/app/posts",
        dock: true,
        items: [{ id: "drafts", label: "Drafts", href: "/app/posts/drafts" }],
      },
      { id: "action", label: "New", onSelect: () => {} },
    ],
  },
  { id: "sys", items: [{ id: "settings", label: "Settings", href: "/app/settings" }] },
];

describe("isActive", () => {
  it("prefix-matches whole segments only", () => {
    expect(isActive("/app/posts/drafts", { href: "/app/posts" })).toBe(true);
    expect(isActive("/app/posts-archive", { href: "/app/posts" })).toBe(false);
  });

  it("honours exact + trailing slashes + query", () => {
    expect(isActive("/app/posts", { href: "/app", exact: true })).toBe(false);
    expect(isActive("/app/", { href: "/app", exact: true })).toBe(true);
    expect(isActive("/app?tab=1", { href: "/app", exact: true })).toBe(true);
  });

  it("is false without an href", () => {
    expect(isActive("/app", {})).toBe(false);
  });
});

describe("deriveDock", () => {
  it("prefers flagged items", () => {
    expect(deriveDock(nav).map((i) => i.id)).toEqual(["home", "posts"]);
  });

  it("falls back to the first linkable items when nothing is flagged", () => {
    const plain: NavGroup[] = [
      { id: "g", items: [{ id: "a", label: "A", href: "/a" }, { id: "b", label: "B", href: "/b" }, { id: "c", label: "C", href: "/c" }] },
    ];
    expect(deriveDock(plain, 2).map((i) => i.id)).toEqual(["a", "b"]);
  });
});

describe("activeTitle", () => {
  it("picks the deepest match", () => {
    expect(activeTitle("/app/posts/drafts", nav)).toBe("Drafts");
    expect(activeTitle("/app/settings", nav)).toBe("Settings");
    expect(activeTitle("/nowhere", nav)).toBe("");
  });
});

describe("flattenNav", () => {
  it("includes sub-items", () => {
    expect(flattenNav(nav).map((i) => i.id)).toEqual([
      "home",
      "posts",
      "drafts",
      "action",
      "settings",
    ]);
  });
});
