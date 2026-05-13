import { describe, it, expect } from "vitest"
import { cn } from "./utils"

// Note: uid + clamp tests come in a follow-up PR after #21 (lib/utils +uid +clamp) merges.

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("a", "b")).toBe("a b")
  })

  it("dedupes conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b")
  })
})
