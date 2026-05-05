// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { v } from "convex/values";
import { query } from "./_generated/server";

// Reads any "events" table you have. Adjust table name + grouping per use.
//
// Schema assumption — your events table already exists:
// events: defineTable({ userId: v.id("users"), kind: v.string(), createdAt: v.number() })
//   .index("by_kind_createdAt", ["kind", "createdAt"]),

export const seriesByDay = query({
  args: { kind: v.string(), days: v.number() },
  handler: async (ctx, { kind, days }) => {
    const since = Date.now() - days * 86_400_000;
    const rows = await ctx.db
      .query("events")
      .withIndex("by_kind_createdAt", (q) => q.eq("kind", kind).gte("createdAt", since))
      .take(10_000);

    const buckets = new Map<string, number>();
    for (const r of rows) {
      const d = new Date(r.createdAt).toISOString().slice(5, 10);
      buckets.set(d, (buckets.get(d) ?? 0) + 1);
    }
    return [...buckets.entries()].map(([date, count]) => ({ date, count }));
  },
});
