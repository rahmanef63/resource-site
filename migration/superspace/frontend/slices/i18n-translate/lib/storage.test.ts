import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { persistLang, readPersistedLang, detectBrowserLang } from "./storage"
import type { Lang } from "./types"

const ALLOWED: Lang[] = [
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
  { code: "zh-CN", label: "中文 (简)" },
  { code: "ja", label: "日本語" },
]

const KEY = "test-lang"

beforeEach(() => {
  localStorage.clear()
})

describe("persistLang / readPersistedLang", () => {
  it("round-trips an allowed lang", () => {
    persistLang(KEY, "en")
    expect(readPersistedLang(KEY, ALLOWED)).toBe("en")
  })

  it("returns null when nothing persisted", () => {
    expect(readPersistedLang(KEY, ALLOWED)).toBeNull()
  })

  it("returns null when persisted lang not in allowed list", () => {
    persistLang(KEY, "de")
    expect(readPersistedLang(KEY, ALLOWED)).toBeNull()
  })
})

describe("detectBrowserLang", () => {
  const orig = navigator.language

  function setNavLang(v: string) {
    Object.defineProperty(navigator, "language", { value: v, configurable: true })
  }

  afterEach(() => {
    Object.defineProperty(navigator, "language", { value: orig, configurable: true })
    vi.restoreAllMocks()
  })

  it("returns pageLang when browser starts with it", () => {
    setNavLang("id-ID")
    expect(detectBrowserLang(ALLOWED, "id")).toBe("id")
  })

  it("matches exact locale code", () => {
    setNavLang("zh-cn")
    expect(detectBrowserLang(ALLOWED, "id")).toBe("zh-CN")
  })

  it("falls back to base-language partial match", () => {
    setNavLang("en-GB")
    expect(detectBrowserLang(ALLOWED, "id")).toBe("en")
  })

  it("falls back to en when no match and en present", () => {
    setNavLang("fr-FR")
    expect(detectBrowserLang(ALLOWED, "id")).toBe("en")
  })

  it("falls back to pageLang when no match and en absent", () => {
    setNavLang("fr-FR")
    const noEn: Lang[] = [{ code: "id", label: "ID" }, { code: "ja", label: "JA" }]
    expect(detectBrowserLang(noEn, "id")).toBe("id")
  })
})
