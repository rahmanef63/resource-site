import { describe, it, expect } from "vitest"
import { buildThread } from "./buildThread"
import type { Comment } from "../types"

/**
 * Locks the threading contract the slice's "Threaded" name promises:
 * flat `Comment[]` → reply trees keyed on `parentId`, oldest-first per level,
 * orphan-safe.
 */
const mk = (
  id: string,
  createdAt: number,
  parentId?: string,
): Comment => ({
  id,
  target: { kind: "page", id: "p_1" },
  text: id,
  authorName: "x",
  authorIcon: "",
  resolved: false,
  createdAt,
  updatedAt: createdAt,
  parentId,
})

describe("buildThread", () => {
  it("nests replies under their parent", () => {
    const tree = buildThread([mk("a", 1), mk("b", 2, "a"), mk("c", 3, "a")])
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe("a")
    expect(tree[0].replies.map((r) => r.id)).toEqual(["b", "c"])
  })

  it("supports nesting deeper than one level", () => {
    const tree = buildThread([mk("a", 1), mk("b", 2, "a"), mk("c", 3, "b")])
    expect(tree[0].replies[0].id).toBe("b")
    expect(tree[0].replies[0].replies[0].id).toBe("c")
  })

  it("orders each level oldest-first regardless of input order", () => {
    const tree = buildThread([mk("b", 2, "root"), mk("a", 1, "root"), mk("root", 0)])
    expect(tree[0].replies.map((r) => r.id)).toEqual(["a", "b"])
  })

  it("surfaces orphans (missing parent) as roots — never drops them", () => {
    const tree = buildThread([mk("a", 1), mk("ghost", 2, "deleted-parent")])
    expect(tree.map((n) => n.id).sort()).toEqual(["a", "ghost"])
  })

  it("returns [] for empty input", () => {
    expect(buildThread([])).toEqual([])
  })
})
