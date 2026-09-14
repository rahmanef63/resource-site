import { describe, expect, it } from "vitest";
import type { PageEntry } from "../types";
import { editablePageSnapshot, moveBlock, orderPagesForAdmin, pageHref } from "./core";

const page = (patch: Partial<PageEntry> = {}): PageEntry => ({
  id: "p1",
  slug: "about",
  title: "About",
  description: "About us",
  blocks: [{ kind: "text", body: "hello" }],
  status: "draft",
  createdAt: 1,
  updatedAt: 1,
  ...patch,
});

describe("pages-cms portable core", () => {
  it("moves blocks without mutating the source", () => {
    const blocks = [{ kind: "text", body: "a" }, { kind: "text", body: "b" }] as const;
    const next = moveBlock([...blocks], 1, 0);
    expect(next.map((block) => block.kind === "text" ? block.body : "")).toEqual(["b", "a"]);
    expect(blocks[0].body).toBe("a");
  });

  it("ignores updatedAt in dirty snapshots and normalizes hrefs", () => {
    expect(editablePageSnapshot(page({ updatedAt: 1 }))).toBe(editablePageSnapshot(page({ updatedAt: 99 })));
    expect(pageHref("/p", "about")).toBe("/p/about");
    expect(pageHref("/", "")).toBe("/");
  });

  it("orders system pages before custom pages", () => {
    const ordered = orderPagesForAdmin([
      page({ id: "custom", slug: "z" }),
      page({ id: "system", slug: "a", systemPage: true }),
    ]);
    expect(ordered.map((item) => item.id)).toEqual(["system", "custom"]);
  });
});
