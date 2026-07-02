import { QueryCtx, query } from "../../_generated";
import { v } from "convex/values";
import { Doc } from "../../_generated";

/**
 * Get a specific copy by key
 */
export const getCopy = query({
  args: {
    workspaceId: v.string(),
    key: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("copies"),
      _creationTime: v.number(),
      workspaceId: v.string(),
      key: v.string(),
      group: v.string(),
      status: v.string(),
      translations: v.record(v.string(), v.object({
        content: v.string(),
        description: v.optional(v.string()),
        updatedAt: v.number(),
        updatedBy: v.optional(v.string()),
      })),
      tags: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      lastReviewedAt: v.optional(v.number()),
      lastReviewedBy: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const copy = await ctx.db
      .query("copies")
      .withIndex("by_workspace_key", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("key", args.key)
      )
      .unique();

    return copy;
  },
});

/**
 * List copies in a group
 */
export const listCopiesByGroup = query({
  args: {
    workspaceId: v.string(),
    group: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("copies"),
      _creationTime: v.number(),
      key: v.string(),
      status: v.string(),
      translations: v.record(v.string(), v.object({
        content: v.string(),
        description: v.optional(v.string()),
        updatedAt: v.number(),
        updatedBy: v.optional(v.string()),
      })),
      tags: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const copies = await ctx.db
      .query("copies")
      .withIndex("by_group", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("group", args.group)
      )
      .take(2000);

    return copies;
  },
});

/**
 * List all copy groups
 */
export const listGroups = query({
  args: {
    workspaceId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("copyGroups"),
      _creationTime: v.number(),
      workspaceId: v.string(),
      name: v.string(),
      displayNames: v.record(v.string(), v.string()),
      description: v.optional(v.string()),
      status: v.string(),
      copyCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("copyGroups")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(2000);

    return groups;
  },
});

/**
 * Get copy history
 */
export const getCopyHistory = query({
  args: {
    copyId: v.id("copies"),
  },
  returns: v.array(
    v.object({
      _id: v.id("copyHistory"),
      _creationTime: v.number(),
      copyId: v.id("copies"),
      locale: v.string(),
      previousContent: v.string(),
      changeNote: v.optional(v.string()),
      createdBy: v.optional(v.union(v.string(), v.null())),
    })
  ),
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("copyHistory")
      .withIndex("by_copy", (q) => q.eq("copyId", args.copyId))
      .order("desc")
      .take(2000);

    return history;
  },
});

