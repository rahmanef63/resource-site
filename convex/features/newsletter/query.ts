import { getAuthUserId } from "@convex-dev/auth/server";
import { internalQuery, query, type QueryCtx } from "../../_generated/server";
import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { isSuperAdminUser } from "../../_shared/auth";

async function isAdmin(ctx: QueryCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (isSuperAdminUser(user)) return true;
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return profile?.role === "admin";
}

export const getIssue = internalQuery({
  args: { issueId: v.id("newsletterIssues") },
  handler: async (ctx, { issueId }) => ctx.db.get(issueId),
});

export const activeSubscribers = internalQuery({
  args: {},
  handler: async (ctx) => ctx.db
    .query("newsletterSubscribers")
    .withIndex("by_status_subscribedAt", (q) => q.eq("status", "active"))
    .take(10_000),
});

export const isAdminUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => isAdmin(ctx, userId),
});

export const listSubscribersPublic = query({
  args: {},
  returns: v.array(v.object({
    email: v.string(),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("unsubscribed")),
    subscribedAt: v.number(),
  })),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized — sign in required");
    if (!(await isAdmin(ctx, userId))) throw new Error("Forbidden — admin role required");
    const rows = await ctx.db.query("newsletterSubscribers").take(10_000);
    return rows.map(({ email, status, subscribedAt }) => ({ email, status, subscribedAt }));
  },
});
