import { describe, it, expect } from "vitest"
import {
  loadHistory,
  saveHistory,
  clearHistory,
  HISTORY_KEY,
  HISTORY_MAX,
  type HistoryEntry,
} from "./cmdkHistory"

function fakeStorage(seed?: Record<string, string>): Storage {
  const m = new Map<string, string>(Object.entries(seed ?? {}))
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => {
      m.set(k, v)
    },
    removeItem: (k: string) => {
      m.delete(k)
    },
    clear: () => m.clear(),
    key: (i: number) => [...m.keys()][i] ?? null,
    get length() {
      return m.size
    },
  } as Storage
}

describe("cmdkHistory", () => {
  it("returns [] when storage empty", () => {
    expect(loadHistory(fakeStorage())).toEqual([])
  })

  it("returns [] when storage is null/unavailable", () => {
    expect(loadHistory(null)).toEqual([])
  })

  it("saves newest-first", () => {
    const s = fakeStorage()
    saveHistory({ id: "a", label: "A" }, s)
    const out = saveHistory({ id: "b", label: "B" }, s)
    expect(out.map((e) => e.id)).toEqual(["b", "a"])
  })

  it("dedupes by id, moving repeat to front", () => {
    const s = fakeStorage()
    saveHistory({ id: "a", label: "A" }, s)
    saveHistory({ id: "b", label: "B" }, s)
    const out = saveHistory({ id: "a", label: "A2" }, s)
    expect(out.map((e) => e.id)).toEqual(["a", "b"])
    expect(out[0].label).toBe("A2")
  })

  it(`caps at HISTORY_MAX (${HISTORY_MAX})`, () => {
    const s = fakeStorage()
    let out: HistoryEntry[] = []
    for (let i = 0; i < HISTORY_MAX + 3; i++) {
      out = saveHistory({ id: `id-${i}`, label: `L${i}` }, s)
    }
    expect(out).toHaveLength(HISTORY_MAX)
    expect(out[0].id).toBe(`id-${HISTORY_MAX + 2}`)
  })

  it("filters malformed entries on load", () => {
    const s = fakeStorage({
      [HISTORY_KEY]: JSON.stringify([{ id: "ok", label: "OK" }, { id: 1 }, null, "x"]),
    })
    expect(loadHistory(s)).toEqual([{ id: "ok", label: "OK" }])
  })

  it("returns [] on non-array / corrupt JSON", () => {
    expect(loadHistory(fakeStorage({ [HISTORY_KEY]: "{not-array}" }))).toEqual([])
    expect(loadHistory(fakeStorage({ [HISTORY_KEY]: JSON.stringify({ a: 1 }) }))).toEqual([])
  })

  it("clearHistory removes the key", () => {
    const s = fakeStorage()
    saveHistory({ id: "a", label: "A" }, s)
    clearHistory(s)
    expect(loadHistory(s)).toEqual([])
  })
})
