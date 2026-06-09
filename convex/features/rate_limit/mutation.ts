import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { constantTimeEqual } from "../../_shared/crypto";

// Per-prefix rate-limit policy lives SERVER-SIDE, not in the args.
// Letting the caller supply limit/windowMs let any anonymous caller
// craft a loose window and bypass the limit entirely. The prefix is
// everything before the first ":" in the key (`admin-login:<ip>`).
// Unknown prefixes are rejected — add a row here before using a new one.
const POLICY: Record<string, { limit: number; windowMs: number }> = {
  "admin-login": { limit: 5, windowMs: 15 * 60_000 },
  newsletter: { limit: 3, windowMs: 60 * 60_000 },
  telemetry: { limit: 60, windowMs: 60 * 60_000 },
  csp: { limit: 60, windowMs: 60_000 },
  mcp: { limit: 120, windowMs: 60_000 },
};

// Atomic single-row check-and-increment for per-key rate limits.
// Caller hands us a stable key (`admin-login:<ip>`, `mcp:<ip>`, …);
// the count threshold + window come from POLICY above. Returns whether
// the request fits in the window and how many slots are left. Convex
// serialises mutations against the same document, so the
// read-then-patch sequence below is race-free even under concurrent
// Next replicas.
//
// This stays a PUBLIC mutation (server routes call it over
// ConvexHttpClient, which can't reach internal functions). Two layers
// keep it abuse-resistant: the policy map closes the forged-window
// bypass, and — when the RATE_LIMIT_SERVER_KEY env is set on the
// deployment — a serverKey arg is required, which also closes the
// burn-a-victim's-budget vector. Set the env in production.
export const consume = mutation({
  args: {
    key: v.string(),
    serverKey: v.optional(v.string()),
  },
  returns: v.object({
    ok: v.boolean(),
    remaining: v.number(),
    resetAt: v.number(),
  }),
  handler: async (ctx, { key, serverKey }) => {
    const gate = process.env.RATE_LIMIT_SERVER_KEY;
    if (gate && !constantTimeEqual(serverKey ?? "", gate)) {
      throw new Error("rate-limit: invalid server key");
    }
    if (!gate) {
      // Unkeyed = anyone can consume() a victim's bucket (e.g. lock an IP
      // out of admin login). Loud so it shows in deployment logs.
      console.warn(
        "rate-limit: RATE_LIMIT_SERVER_KEY is not set — consume() is callable by any client. Set it in production.",
      );
    }
    const prefix = key.split(":")[0];
    const policy = POLICY[prefix];
    if (!policy) {
      throw new Error(`rate-limit: unknown key prefix "${prefix}"`);
    }
    const { limit, windowMs } = policy;
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
