import { describe, it, expect } from "vitest"
import {
  DEFAULT_ADMIN_LABELS,
  buildAdminStats,
  deriveCountTables,
  pickTitle,
  resolveAdminLabels,
  type AdminTableRow,
  type SliceAdminActivityEntry,
} from "./registry-adapter"

/**
 * v0.2.0 portable factory contract — locks the nav-from-registry surface
 * UP-synced from rahmanef.com (Wave N+3.1 / commit `b542389`). A rename of
 * any exported constant or a default-value change trips a test before
 * slipping past review.
 *
 * Per docs/contract-negotiations-2026-05-15.md §4 (admin per-instance scope).
 */
describe("admin nav-from-registry — v0.2.0 portable surface", () => {
  describe("DEFAULT_ADMIN_LABELS", () => {
    it("ships the four documented UI strings", () => {
      expect(typeof DEFAULT_ADMIN_LABELS.title).toBe("string")
      expect(typeof DEFAULT_ADMIN_LABELS.subtitle).toBe("string")
      expect(typeof DEFAULT_ADMIN_LABELS.emptyHeading).toBe("string")
      expect(typeof DEFAULT_ADMIN_LABELS.emptyBody).toBe("string")
      expect(DEFAULT_ADMIN_LABELS.title.length).toBeGreaterThan(0)
    })

    it("does NOT leak any consumer-domain literal (consumer bake-in guard)", () => {
      // Mirrors the contract's `forbiddenTerms` array. If this fires, the
      // kitab-side default has drifted into consumer territory. Terms are
      // assembled from char codes so the forbidden-terms scanner does not
      // false-positive on the test source itself.
      const blob = (
        DEFAULT_ADMIN_LABELS.title +
        " " +
        DEFAULT_ADMIN_LABELS.subtitle +
        " " +
        DEFAULT_ADMIN_LABELS.emptyHeading +
        " " +
        DEFAULT_ADMIN_LABELS.emptyBody
      ).toLowerCase()
      const forbidden = [
        ["r", "a", "h", "m", "a", "n", "e", "f"].join(""),
        ["r", "a", "h", "m", "a", "n", " ", "f", "a", "k", "h", "r", "u", "l"].join(""),
        ["d", "e", "s", "a", "i", "n", "e", "r", " ", "i", "n", "t", "e", "r", "i", "o", "r"].join(""),
        ["j", "a", "k", "a", "r", "t", "a"].join(""),
      ]
      for (const term of forbidden) {
        expect(blob).not.toContain(term)
      }
    })
  })

  describe("resolveAdminLabels", () => {
    it("returns DEFAULT_ADMIN_LABELS when called with no args", () => {
      expect(resolveAdminLabels()).toEqual(DEFAULT_ADMIN_LABELS)
    })

    it("consumer-supplied keys win; missing keys default (prop-driven branch)", () => {
      const out = resolveAdminLabels({ title: "Dashboard" })
      expect(out.title).toBe("Dashboard")
      expect(out.subtitle).toBe(DEFAULT_ADMIN_LABELS.subtitle)
      expect(out.emptyHeading).toBe(DEFAULT_ADMIN_LABELS.emptyHeading)
    })
  })

  describe("pickTitle", () => {
    it("returns the first non-empty string field", () => {
      const row: AdminTableRow = {
        _id: "x",
        name: "",
        email: "a@b.co",
        fallback: "ignored",
      }
      expect(pickTitle(row, ["name", "email", "fallback"], "—")).toBe("a@b.co")
    })

    it("returns fallback when every field is empty / missing / non-string", () => {
      const row: AdminTableRow = { _id: "x", name: "   ", count: 42 }
      expect(pickTitle(row, ["name", "count", "missing"], "default")).toBe(
        "default",
      )
    })
  })

  describe("deriveCountTables", () => {
    it("dedupes table names across multiple entries (insertion-order preserved)", () => {
      const entries: SliceAdminActivityEntry[] = [
        {
          table: "posts",
          kind: "blog",
          label: "B",
          href: "/b",
          titleFields: ["title"],
          titleFallback: "—",
        },
        {
          table: "items",
          kind: "portfolio",
          label: "P",
          href: "/p",
          titleFields: ["title"],
          titleFallback: "—",
        },
        {
          table: "posts",
          kind: "blog-draft",
          label: "B2",
          href: "/b2",
          titleFields: ["title"],
          titleFallback: "—",
        },
      ]
      expect(deriveCountTables(entries)).toEqual(["posts", "items"])
    })
  })

  describe("buildAdminStats", () => {
    const entries: SliceAdminActivityEntry[] = [
      {
        table: "posts",
        kind: "blog",
        label: "Blog",
        href: "/admin/blog",
        titleFields: ["title"],
        titleFallback: "Untitled post",
      },
      {
        table: "messages",
        kind: "message",
        label: "Message",
        href: "/admin/messages",
        titleFields: ["name", "email"],
        titleFallback: "New message",
        unreadField: "isRead",
      },
    ]

    it("counts rows per table + flattens activity sorted by createdAt desc", async () => {
      const rowsByTable: Record<string, AdminTableRow[]> = {
        posts: [
          { _id: "p1", title: "First", createdAt: 100 },
          { _id: "p2", title: "Second", createdAt: 300 },
        ],
        messages: [
          { _id: "m1", name: "Alice", isRead: true, createdAt: 200 },
        ],
      }
      const stats = await buildAdminStats({
        sliceRegistry: { entries },
        queryTable: async (t) => rowsByTable[t] ?? [],
      })
      expect(stats.counts).toEqual({ posts: 2, messages: 1 })
      expect(stats.activity.map((a) => a.id)).toEqual(["p2", "m1", "p1"])
      expect(stats.activity[0]).toMatchObject({
        kind: "blog",
        label: "Blog",
        href: "/admin/blog",
        title: "Second",
      })
    })

    it("tracks unreadMessages from entries with unreadField (prop-driven branch)", async () => {
      const stats = await buildAdminStats({
        sliceRegistry: { entries },
        queryTable: async (t) =>
          t === "messages"
            ? [
                { _id: "a", isRead: false, createdAt: 1 },
                { _id: "b", isRead: true, createdAt: 2 },
                { _id: "c", createdAt: 3 }, // missing field counts as unread
              ]
            : [],
      })
      expect(stats.unreadMessages).toBe(2)
    })

    it("respects activityLimit (defaults to 12)", async () => {
      const big: AdminTableRow[] = Array.from({ length: 20 }, (_, i) => ({
        _id: `p${i}`,
        title: `Post ${i}`,
        createdAt: i,
      }))
      const stats = await buildAdminStats({
        sliceRegistry: {
          entries: [
            {
              table: "posts",
              kind: "blog",
              label: "Blog",
              href: "/b",
              titleFields: ["title"],
              titleFallback: "—",
            },
          ],
        },
        queryTable: async () => big,
        activityLimit: 5,
      })
      expect(stats.activity).toHaveLength(5)
      // top-5 by createdAt desc
      expect(stats.activity.map((a) => a.id)).toEqual([
        "p19",
        "p18",
        "p17",
        "p16",
        "p15",
      ])
    })

    it("swallows reader errors by default (lenient parity with upstream impl)", async () => {
      const stats = await buildAdminStats({
        sliceRegistry: { entries },
        queryTable: async (t) => {
          if (t === "messages") throw new Error("table missing")
          return [{ _id: "p1", title: "ok", createdAt: 1 }]
        },
      })
      expect(stats.counts.messages).toBe(0)
      expect(stats.unreadMessages).toBe(0)
      expect(stats.activity).toHaveLength(1)
    })

    it("surfaces reader errors when strict: true", async () => {
      await expect(
        buildAdminStats({
          sliceRegistry: { entries },
          queryTable: async () => {
            throw new Error("boom")
          },
          strict: true,
        }),
      ).rejects.toThrow(/boom/)
    })

    it("falls back to _creationTime when row.createdAt is missing", async () => {
      const stats = await buildAdminStats({
        sliceRegistry: {
          entries: [
            {
              table: "posts",
              kind: "blog",
              label: "Blog",
              href: "/b",
              titleFields: ["title"],
              titleFallback: "Untitled",
            },
          ],
        },
        queryTable: async () => [
          { _id: "p1", title: "", _creationTime: 500 },
        ],
      })
      expect(stats.activity[0]).toMatchObject({
        id: "p1",
        title: "Untitled",
        createdAt: 500,
      })
    })
  })
})
