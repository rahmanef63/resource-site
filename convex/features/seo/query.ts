import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";

// Internal-only — actions read this via ctx.runQuery(internal.slices.seo.callsInWindow).
// Public exposure would let any caller probe per-admin LLM-spend telemetry by email.
export const callsInWindow = internalQuery({
  args: { userEmail: v.string(), windowMs: v.number() },
  handler: async (ctx, { userEmail, windowMs }) => {
    const since = Date.now() - windowMs;
    // Cap tight — rate-limit math only needs to know "over the cap?".
    // 1000 is well above any legitimate per-window quota.
    const calls = await ctx.db
      .query("seoGeneratorCalls")
      .withIndex("by_user_time", (q) =>
        q.eq("userEmail", userEmail).gt("calledAt", since),
      )
      .take(1000);
    return calls.length;
  },
});
