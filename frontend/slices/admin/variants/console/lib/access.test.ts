import { describe, expect, it } from "vitest"
import { ADMIN_CONSOLE_SECTIONS, type AdminAccess } from "./sections"
import { canSeeSection, filterSections, hasPermission, meetsLevel } from "./access"

const access = (over: Partial<AdminAccess> = {}): AdminAccess => ({
  isLoading: false,
  level: "delegated_admin",
  permissions: [],
  email: null,
  ...over,
})

const section = (id: string) => ADMIN_CONSOLE_SECTIONS.find((s) => s.id === id)!

describe("access gate", () => {
  it("platform_admin sees every section", () => {
    const a = access({ level: "platform_admin" })
    expect(ADMIN_CONSOLE_SECTIONS.every((s) => canSeeSection(s, a))).toBe(true)
  })

  it("denied sees nothing", () => {
    const a = access({ level: "denied" })
    expect(ADMIN_CONSOLE_SECTIONS.some((s) => canSeeSection(s, a))).toBe(false)
  })

  it("permission wildcards resolve", () => {
    expect(hasPermission(["content.*"], "content.manage")).toBe(true)
    expect(hasPermission(["*"], "crm.manage")).toBe(true)
    expect(hasPermission(["content.manage"], "crm.manage")).toBe(false)
  })

  it("content.manage grants only content sections, not CRM", () => {
    const a = access({ permissions: ["content.manage"] })
    expect(canSeeSection(section("blog"), a)).toBe(true)
    expect(canSeeSection(section("leads"), a)).toBe(false) // needs crm.manage
  })

  it("OWNER token needs the workspace_owner level, not a permission", () => {
    expect(canSeeSection(section("settings"), access({ level: "workspace_owner" }))).toBe(true)
    expect(canSeeSection(section("settings"), access({ permissions: ["*"] }))).toBe(false)
  })

  it("level ordering: owner outranks delegated", () => {
    expect(meetsLevel("workspace_owner", "delegated_admin")).toBe(true)
    expect(meetsLevel("delegated_admin", "workspace_owner")).toBe(false)
  })

  it("tier filter hides team/org-only sections from solo", () => {
    const a = access({ level: "platform_admin" })
    const solo = filterSections(ADMIN_CONSOLE_SECTIONS, a, "solo")
    expect(solo.some((s) => s.id === "audit-log")).toBe(false) // team+org only
    expect(solo.some((s) => s.id === "analytics")).toBe(true)
  })
})
