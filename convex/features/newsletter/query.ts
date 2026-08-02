import { internalQuery } from "../../_generated/server";
import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { isSuperAdminUser } from "../../_shared/auth";

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
      .take(10_000);
  },
});

/** Admin probe used by `broadcastPublic` to gate fanout. True only when
 *  the user's profile carries role="admin" or they are the
 *  SUPER_ADMIN_EMAIL account. */
export const isAdminUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Same verified-email rule as _shared/auth — plain email equality would
    // let an unverified Password sign-up of the super-admin address broadcast.
    const user = await ctx.db.get(userId);
    if (isSuperAdminUser(user)) return true;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .first();
    return profile?.role === "admin";
  },
});
