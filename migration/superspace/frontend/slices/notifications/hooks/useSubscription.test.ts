/**
 * @vitest-environment happy-dom
 */
import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, beforeEach } from "vitest"
import { useSubscription } from "./useSubscription"

beforeEach(() => {
  localStorage.clear()
})

describe("useSubscription", () => {
  it("starts unsubscribed", () => {
    const { result } = renderHook(() => useSubscription("page-1"))
    expect(result.current.isSubscribed).toBe(false)
    expect(result.current.scopes).toEqual([])
  })

  it("subscribe sets scopes + isSubscribed", () => {
    const { result } = renderHook(() => useSubscription("page-1"))
    act(() => result.current.subscribe(["page", "comments"]))
    expect(result.current.isSubscribed).toBe(true)
    expect(result.current.scopes).toEqual(["page", "comments"])
  })

  it("toggleScope adds then removes a scope", () => {
    const { result } = renderHook(() => useSubscription("page-1"))
    act(() => result.current.toggleScope("edits"))
    expect(result.current.scopes).toEqual(["edits"])
    act(() => result.current.toggleScope("edits"))
    expect(result.current.isSubscribed).toBe(false)
    expect(result.current.scopes).toEqual([])
  })

  it("unsubscribe clears state", () => {
    const { result } = renderHook(() => useSubscription("page-1"))
    act(() => result.current.subscribe(["page"]))
    act(() => result.current.unsubscribe())
    expect(result.current.isSubscribed).toBe(false)
  })

  it("persists across hook instances (localStorage-backed)", () => {
    const first = renderHook(() => useSubscription("page-1"))
    act(() => first.result.current.subscribe(["thread"]))
    const second = renderHook(() => useSubscription("page-1"))
    expect(second.result.current.isSubscribed).toBe(true)
    expect(second.result.current.scopes).toEqual(["thread"])
  })

  it("isolates state per pageId", () => {
    const a = renderHook(() => useSubscription("page-a"))
    act(() => a.result.current.subscribe(["page"]))
    const b = renderHook(() => useSubscription("page-b"))
    expect(b.result.current.isSubscribed).toBe(false)
  })
})
