import { internalMutation, mutation } from "../../_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      if (existing.status === "active") return { ok: true, already: true };
      // Re-subscribe path
      await ctx.db.patch(existing._id, { status: "active", subscribedAt: Date.now() });
      return { ok: true, already: false };
    }
    await ctx.db.insert("newsletterSubscribers", {
      email,
      status: "pending",
      subscribedAt: Date.now(),
    });
    return { ok: true, already: false };
  },
});

export const markSending = internalMutation({
  args: { issueId: v.id("newsletterIssues") },
  handler: async (ctx, { issueId }) => {
    await ctx.db.patch(issueId, { status: "sending" });
  },
});

export const markSent = internalMutation({
  args: { issueId: v.id("newsletterIssues"), sentCount: v.number() },
  handler: async (ctx, { issueId, sentCount }) => {
    await ctx.db.patch(issueId, {
      status: "sent",
      sentAt: Date.now(),
      sentCount,
    });
  },
});
