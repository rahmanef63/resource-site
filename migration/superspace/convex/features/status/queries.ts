import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExistingUserId, requireActiveMembership } from "../../auth/helpers";

// Document shape of the `statuses` table (mirrors api/schema.ts).
// Used to build concrete return validators instead of v.any().
const statusFields = {
  _id: v.id("statuses"),
  _creationTime: v.number(),
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
  content: v.string(),
  storageId: v.optional(v.id("_storage")),
  backgroundColor: v.optional(v.string()),
  textColor: v.optional(v.string()),
  font: v.optional(v.string()),
  viewCount: v.number(),
  createdAt: v.number(),
  expiresAt: v.number(),
  metadata: v.optional(v.any()),
};

/**
 * Get all status updates in a workspace (not expired)
 */
export const getWorkspaceStatuses = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.object({ ...statusFields, user: v.any() })),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const now = Date.now();

    const statuses = await ctx.db
      .query("statuses")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .order("desc")
      .take(1000);

    const statusesWithDetails = await Promise.all(
      statuses.map(async (status) => {
        const user = await ctx.db.get(status.userId);
        const viewCount = await ctx.db
          .query("statusViews")
          .withIndex("by_status", (q) => q.eq("statusId", status._id))
          .take(1000);

        return {
          ...status,
          user,
          viewCount: viewCount.length,
        };
      })
    );

    return statusesWithDetails;
  },
});

/**
 * Get a single status with details
 */
export const getStatus = query({
  args: {
    statusId: v.id("statuses"),
  },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    const status = await ctx.db.get(args.statusId);
    if (!status) return null;

    await requireActiveMembership(ctx, status.workspaceId);

    const user = await ctx.db.get(status.userId);
    const views = await ctx.db
      .query("statusViews")
      .withIndex("by_status", (q) => q.eq("statusId", status._id))
      .take(1000);

    const viewDetails = await Promise.all(
      views.map(async (view) => {
        const viewer = await ctx.db.get(view.viewerId);
        return { ...view, viewer };
      })
    );

    return {
      ...status,
      user,
      views: viewDetails,
    };
  },
});

/**
 * Get my status updates
 */
export const getMyStatuses = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.object({ ...statusFields })),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const now = Date.now();

    const statuses = await ctx.db
      .query("statuses")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId)
      )
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .order("desc")
      .take(1000);

    const statusesWithDetails = await Promise.all(
      statuses.map(async (status) => {
        const viewCount = await ctx.db
          .query("statusViews")
          .withIndex("by_status", (q) => q.eq("statusId", status._id))
          .take(1000);

        return {
          ...status,
          viewCount: viewCount.length,
        };
      })
    );

    return statusesWithDetails;
  },
});

/**
 * Get statuses by user (group statuses by user for list view)
 */
export const getStatusesByUser = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(
    v.object({
      userId: v.string(),
      user: v.any(),
      latestStatus: v.any(),
      statusCount: v.number(),
      hasUnviewed: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const now = Date.now();

    const statuses = await ctx.db
      .query("statuses")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .order("desc")
      .take(1000);

    // Group by user
    const userStatusMap = new Map<string, typeof statuses>();
    for (const status of statuses) {
      const existing = userStatusMap.get(status.userId as string);
      if (existing) {
        existing.push(status);
      } else {
        userStatusMap.set(status.userId as string, [status]);
      }
    }

    // Build response with user details
    const result = await Promise.all(
      Array.from(userStatusMap.entries()).map(async ([userIdStr, userStatuses]) => {
        const user = await ctx.db.get(userIdStr as any);
        const latestStatus = userStatuses[0];
        return {
          userId: userIdStr,
          user,
          latestStatus,
          statusCount: userStatuses.length,
          hasUnviewed: true, // TODO: Check if current user has viewed
        };
      })
    );

    return result;
  },
});

/**
 * Check if user has viewed a status
 */
export const hasViewedStatus = query({
  args: {
    statusId: v.id("statuses"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return false;

    const view = await ctx.db
      .query("statusViews")
      .withIndex("by_status_viewer", (q) =>
        q.eq("statusId", args.statusId).eq("viewerId", userId)
      )
      .unique();

    return view !== null;
  },
});
