import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Communications Queries
 * Read operations for channels, messages, and members
 */

export const getChannels = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    if (args.type) {
      return ctx.db
        .query("channels")
        .withIndex("by_workspace_type", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("type", args.type as "text" | "voice" | "video" | "announcement" | "forum" | "stage" | "huddle")
        )
        .take(100)
    }

    return ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(100)
  },
})

export const getChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId)
    if (!channel) return null
    await requireActiveMembership(ctx, channel.workspaceId)
    return channel
  },
})

export const getChannelCategories = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return ctx.db
      .query("channelCategories")
      .withIndex("by_workspace_position", (q) => q.eq("workspaceId", args.workspaceId))
      .take(50)
  },
})

export const getChannelMessages = query({
  args: {
    channelId: v.id("channels"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId)
    if (!channel) return []
    await requireActiveMembership(ctx, channel.workspaceId)

    return ctx.db
      .query("channelMessages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(args.limit ?? 50)
  },
})

export const getChannelMembers = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId)
    if (!channel) return []
    await requireActiveMembership(ctx, channel.workspaceId)

    return ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .take(200)
  },
})
