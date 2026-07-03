import { renderHook, act } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useAdminSection } from "./useAdminSection"
import type { AdminConsoleSection } from "../lib/sections"

const s = (id: string): AdminConsoleSection => ({
  id,
  label: id,
  icon: "Square",
  group: "config",
  priority: "P1",
  required: "*",
  tiers: ["org"],
  provider: "self",
})
const VISIBLE = [s("overview"), s("leads"), s("settings")]
const param = () => new URLSearchParams(window.location.search).get("section")

beforeEach(() => window.history.pushState({}, "", "/"))

describe("useAdminSection", () => {
  it("defaults to the first visible section", () => {
    const { result } = renderHook(() => useAdminSection(VISIBLE))
    expect(result.current.activeId).toBe("overview")
  })

  it("adopts ?section= from the URL", () => {
    window.history.pushState({}, "", "/?section=leads")
    const { result } = renderHook(() => useAdminSection(VISIBLE))
    expect(result.current.activeId).toBe("leads")
  })

  it("ignores an unknown ?section=, falling back to first", () => {
    window.history.pushState({}, "", "/?section=bogus")
    const { result } = renderHook(() => useAdminSection(VISIBLE))
    expect(result.current.activeId).toBe("overview")
  })

  it("navigate() sets active + writes the URL", () => {
    const { result } = renderHook(() => useAdminSection(VISIBLE))
    act(() => result.current.navigate("settings"))
    expect(result.current.activeId).toBe("settings")
    expect(param()).toBe("settings")
  })

  it("adopts the param on popstate (back/forward)", () => {
    const { result } = renderHook(() => useAdminSection(VISIBLE))
    act(() => {
      window.history.pushState({}, "", "/?section=leads")
      window.dispatchEvent(new Event("popstate"))
    })
    expect(result.current.activeId).toBe("leads")
  })
})
