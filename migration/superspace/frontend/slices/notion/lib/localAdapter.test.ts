import { describe, it, expect } from "vitest"
import type { Block } from "@notion/shared/types"
import { _insertBlock, _duplicate, _reorder } from "./localAdapter"

const B = (id: string): Block => ({ id, type: "paragraph", text: id })

describe("notion localAdapter pure ops", () => {
  it("_insertBlock inserts after the given index", () => {
    const out = _insertBlock([B("a"), B("b")], 0, B("x"))
    expect(out.map((b) => b.id)).toEqual(["a", "x", "b"])
  })

  it("_insertBlock at -1 prepends (add-to-empty case)", () => {
    const out = _insertBlock([B("a")], -1, B("x"))
    expect(out.map((b) => b.id)).toEqual(["x", "a"])
  })

  it("_duplicate clones with a new id right after the source", () => {
    const out = _duplicate([B("a"), B("b")], "a", "a2")
    expect(out.map((b) => b.id)).toEqual(["a", "a2", "b"])
  })

  it("_duplicate is a no-op for an unknown id", () => {
    const src = [B("a")]
    expect(_duplicate(src, "zzz", "n")).toBe(src)
  })

  it("_reorder follows orderedIds and appends any it omits", () => {
    const out = _reorder([B("a"), B("b"), B("c")], ["c", "a"])
    expect(out.map((b) => b.id)).toEqual(["c", "a", "b"])
  })
})
