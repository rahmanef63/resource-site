import { describe, it, expect } from "vitest"
import type { TargetRef } from "./index"

/**
 * Compile-time + runtime assertions for the v0.2.0 polymorphic TargetRef
 * shape. Forbidden literals (`pageId`, `blockId`, `targetType`) are gated by
 * the forbidden-terms scanner; here we lock the structural contract so a
 * future `targetKind` rename or `id` retype trips a test before it slips
 * past code review.
 */
describe("TargetRef shape", () => {
  it("accepts page-anchored kind+id without subId", () => {
    const t: TargetRef = { kind: "page", id: "p_1" }
    expect(t.kind).toBe("page")
    expect(t.id).toBe("p_1")
    expect(t.subId).toBeUndefined()
  })

  it("accepts block-anchored kind+id+subId", () => {
    const t: TargetRef = { kind: "page", id: "p_1", subId: "b_42" }
    expect(t.subId).toBe("b_42")
  })

  it("accepts consumer-defined kind literals (blog/task/etc)", () => {
    const blog: TargetRef = { kind: "blog", id: "post-2026-05-15" }
    const task: TargetRef = { kind: "task", id: "t_99", subId: "comment_seed" }
    expect(blog.kind).toBe("blog")
    expect(task.kind).toBe("task")
  })

  it("locks id type to string (not Convex Id<...>)", () => {
    const t: TargetRef = { kind: "any", id: "string-id" }
    expect(typeof t.id).toBe("string")
  })
})
