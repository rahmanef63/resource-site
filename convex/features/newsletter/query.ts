import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";

export const getIssue = internalQuery({
  args: { issueId: v.id("newsletterIssues") },
  handler: async (ctx, { issueId }) => ctx.db.get(issueId),
});

export const activeSubscribers = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_status_subscribedAt", (q) => q.eq("status", "active"))
      .collect();
  },
});
