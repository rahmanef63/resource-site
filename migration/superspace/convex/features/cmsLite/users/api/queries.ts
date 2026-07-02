import { query } from "../../_generated";
import { v } from "convex/values";
import { requirePermission } from "../../../../shared/auth";
import { PERMS } from "../../../../shared/schema";
import type { Id } from "../../_generated";

export const getUser = query({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get profile if it exists
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return {
      ...user,
      profile,
    };
  },
});

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    // Get profile if it exists
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return {
      ...user,
      profile,
    };
  },
});

export const listWorkspaceUsers = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  async handler(ctx, args) {
    await requirePermission(ctx, args.workspaceId, PERMS.VIEW_USERS);

    // Get all memberships for this workspace
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(2000);

    // Get all user data
    const users = await Promise.all(
      memberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId as Id<"users">);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", membership.userId))
          .unique();

        return {
          ...user,
          profile,
          membership,
        };
      })
    );

    return users;
  },
});

