// activity slice — public + admin queries.
//
// Paths assume the consumer mounts this file under
// `convex/features/activity/query.ts` and exposes via their root
// `convex/_generated` barrel. Adjust the relative import if the
// consumer puts `_generated` elsewhere.

import { internalQuery, query } from "../../_generated/server";
import { v } from "convex/values";

const LIST_CAP = 2000;

// Returns EVERY row including private/internal visibility — as a public
// query this leaked non-public activity to anonymous callers. Internal now,
// same pattern as this slice's mutations: the consumer wraps it in their own
// auth-gated query (e.g. requireAdmin) for admin views.
export const listAll = internalQuery({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("activities")
      .withIndex("by_occurredAt")
      .order("desc")
      .take(LIST_CAP),
});

export const listPublic = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const cap = Math.max(1, Math.min(limit ?? 500, LIST_CAP));
    return ctx.db
      .query("activities")
      .withIndex("by_visibility_occurredAt", (q) =>
        q.eq("visibility", "public"),
      )
      .order("desc")
      .take(cap);
  },
});

export const get = query({
  args: { id: v.id("activities") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    return doc && doc.visibility === "public" ? doc : null;
  },
});

export const statsThisWeek = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const rows = await ctx.db
      .query("activities")
      .withIndex("by_visibility_occurredAt", (q) =>
        q.eq("visibility", "public"),
      )
      .order("desc")
      .take(500);
    const week = rows.filter((r) => r.occurredAt >= weekAgo);
    const byCategory: Record<string, number> = {};
    let totalMin = 0;
    for (const r of week) {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
      if (typeof r.durationMin === "number") totalMin += r.durationMin;
    }
    return {
      count: week.length,
      totalMinutes: totalMin,
      byCategory,
      windowStart: weekAgo,
      windowEnd: now,
    };
  },
});
