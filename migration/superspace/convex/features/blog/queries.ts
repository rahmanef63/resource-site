import { v } from "convex/values"
import { query } from "../../_generated/server"
import { ensureUser, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"

/**
 * List blog posts (workspace-scoped, optionally filtered by status + locale).
 */
export const listPosts = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("published"),
        v.literal("archived"),
      ),
    ),
    locale: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requirePermission(ctx, args.workspaceId, PERMS.BLOG_VIEW)

    const limit = Math.min(args.limit ?? 50, 200)

    const builder = args.status
      ? ctx.db
          .query("blogPosts")
          .withIndex("by_workspace_status", (q) =>
            q.eq("workspaceId", args.workspaceId).eq("status", args.status!),
          )
      : ctx.db.query("blogPosts").withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))

    const rows = await builder.order("desc").take(limit)

    return args.locale ? rows.filter((p) => p.locale === args.locale) : rows
  },
})

export const getPostBySlug = query({
  args: {
    workspaceId: v.id("workspaces"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requirePermission(ctx, args.workspaceId, PERMS.BLOG_VIEW)

    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_workspace_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", args.slug),
      )
      .first()

    return post
  },
})

export const listCategories = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await ensureUser(ctx)
    await requirePermission(ctx, args.workspaceId, PERMS.BLOG_VIEW)

    return await ctx.db
      .query("blogCategories")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(200)
  },
})
