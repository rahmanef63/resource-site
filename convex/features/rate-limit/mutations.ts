import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";

// Atomic single-row check-and-increment for per-key rate limits.
// Caller hands us a stable key (`csp:<ip>`, `mcp:<ip>`, etc.) and a
// window (count threshold + ms). Returns whether the request fits in
// the window and how many slots are left. Convex serialises mutations
// against the same document, so the read-then-patch sequence below is
// race-free even under concurrent Next replicas.
export const consume = mutation({
  args: {
    key: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  returns: v.object({
    ok: v.boolean(),
    remaining: v.number(),
    resetAt: v.number(),
  }),
  handler: async (ctx, { key, limit, windowMs }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (!existing || existing.resetAt < now) {
      const resetAt = now + windowMs;
      if (existing) {
        await ctx.db.patch(existing._id, { count: 1, resetAt });
      } else {
        await ctx.db.insert("rateLimits", { key, count: 1, resetAt });
      }
      return { ok: true, remaining: Math.max(0, limit - 1), resetAt };
    }

    if (existing.count >= limit) {
      return { ok: false, remaining: 0, resetAt: existing.resetAt };
    }

    await ctx.db.patch(existing._id, { count: existing.count + 1 });
    return {
      ok: true,
      remaining: Math.max(0, limit - existing.count - 1),
      resetAt: existing.resetAt,
    };
  },
});

// Cron-driven cleanup. Walks expired rows in batches of 1000 to bound
// per-run cost. Wire into convex/crons.ts on a 5-minute cadence.
export const _pruneExpired = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("rateLimits")
      .withIndex("by_resetAt", (q) => q.lt("resetAt", now))
      .take(1000);
    for (const row of expired) await ctx.db.delete(row._id);
    return { deleted: expired.length };
  },
});
