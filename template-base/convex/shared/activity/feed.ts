import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserByExternalId } from "../auth";

const verbValidator = v.union(
  v.literal("created"),
  v.literal("updated"),
  v.literal("deleted"),
  v.literal("archived"),
  v.literal("restored"),
  v.literal("viewed"),
  v.literal("downloaded"),
  v.literal("shared"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("assigned"),
  v.literal("completed"),
  v.literal("commented"),
  v.literal("mentioned"),
  v.literal("subscribed"),
  v.literal("unsubscribed"),
  v.literal("exported"),
  v.literal("imported"),
  v.literal("login"),
  v.literal("logout"),
);

export const logActivity = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    actorId: v.id("users"),
    actorType: v.optional(v.union(v.literal("user"), v.literal("system"), v.literal("automation"))),
    actorName: v.optional(v.string()),
    verb: verbValidator,
    action: v.string(),
    entityType: v.string(),
    entityId: v.id("_table"),
    entityName: v.optional(v.string()),
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    changedFields: v.optional(v.array(v.string())),
    metadata: v.optional(v.record(v.string(), v.any())),
    tags: v.optional(v.array(v.string())),
    visibility: v.optional(
      v.union(
        v.literal("public"),
        v.literal("workspace"),
        v.literal("team"),
        v.literal("private"),
      ),
    ),
    targetUsers: v.optional(v.array(v.id("users"))),
    targetRoles: v.optional(v.array(v.string())),
    feedId: v.optional(v.string()),
    parentId: v.optional(v.id("activities")),
    batchId: v.optional(v.string()),
    message: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("_storage"))),
    mentions: v.optional(v.array(v.id("users"))),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    location: v.optional(
      v.object({
        country: v.string(),
        city: v.string(),
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    isImportant: v.optional(v.boolean()),
    isAutomated: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activities", {
      workspaceId: args.workspaceId,
      actorId: args.actorId,
      actorType: args.actorType ?? "user",
      actorName: args.actorName,
      action: args.action,
      verb: args.verb,
      entityType: args.entityType,
      entityId: args.entityId,
      entityName: args.entityName,
      oldValue: args.oldValue,
      newValue: args.newValue,
      changedFields: args.changedFields,
      metadata: args.metadata,
      tags: args.tags ?? [],
      visibility: args.visibility ?? "workspace",
      targetUsers: args.targetUsers ?? [],
      targetRoles: args.targetRoles ?? [],
      feedId: args.feedId,
      parentId: args.parentId,
      batchId: args.batchId,
      message: args.message,
      attachments: args.attachments ?? [],
      mentions: args.mentions ?? [],
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      location: args.location,
      isImportant: args.isImportant ?? false,
      isAutomated: args.isAutomated ?? false,
      isDeleted: false,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      timestamp: Date.now(),
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const getActivityFeed = query({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.id("_table")),
    verbs: v.optional(v.array(verbValidator)),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await getUserByExternalId(ctx, identity.subject);
    if (!user) throw new Error("User not found");

    const activities = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .order("desc")
      .collect();
    const filtered = activities.filter((a) => {
      if (args.entityType && a.entityType !== args.entityType) return false;
      if (args.entityId && a.entityId !== args.entityId) return false;
      if (args.verbs && !args.verbs.includes(a.verb as any)) return false;
      // basic visibility: public/workspace; others could check target lists
      if (a.visibility === "private" && a.actorId !== user._id) return false;
      return true;
    });

    const slice = args.limit ? filtered.slice(0, args.limit) : filtered;
    return { activities: slice, total: filtered.length };
  },
});
