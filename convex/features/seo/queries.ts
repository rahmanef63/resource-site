import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";

// Internal-only — actions read this via ctx.runQuery(internal.slices.seo.callsInWindow).
// Public exposure would let any caller probe per-admin LLM-spend telemetry by email.
export const callsInWindow = internalQuery({
  args: { userEmail: v.string(), windowMs: v.number() },
  handler: async (ctx, { userEmail, windowMs }) => {
    const since = Date.now() - windowMs;
    const calls = await ctx.db
      .query("seoGeneratorCalls")
      .withIndex("by_user_time", (q) =>
        q.eq("userEmail", userEmail).gt("calledAt", since),
      )
      .collect();
    return calls.length;
  },
});
