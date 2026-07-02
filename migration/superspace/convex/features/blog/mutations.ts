import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAudit } from "../../lib/audit/logger"

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 96)

const postStatus = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("archived"),
)

export const createPost = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    body: v.string(),
    excerpt: v.optional(v.string()),
    locale: v.string(),
    status: v.optional(postStatus),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    scheduledFor: v.optional(v.number()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    if (!userId) throw new Error("Unauthenticated")
    await requirePermission(ctx, args.workspaceId, PERMS.BLOG_CREATE)

    const status = args.status ?? "draft"
    const slug = args.slug ? slugify(args.slug) : slugify(args.title)
    if (!slug) throw new Error("Slug derived from title is empty")

    const existing = await ctx.db
      .query("blogPosts")
      .withIndex("by_workspace_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", slug),
      )
      .first()
    if (existing) throw new Error(`Slug "${slug}" already exists in this workspace`)

    const now = Date.now()
    const id = await ctx.db.insert("blogPosts", {
      workspaceId: args.workspaceId,
      slug,
      title: args.title,
      body: args.body,
      excerpt: args.excerpt,
      locale: args.locale,
      status,
      category: args.category,
      tags: args.tags ?? [],
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
      coverImageId: args.coverImageId,
      publishedAt: status === "published" ? now : undefined,
      scheduledFor: status === "scheduled" ? args.scheduledFor : undefined,
      authorId: userId,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    })

    await logAudit(ctx, {
      action: "blog.post.created",
      entityType: "blogPosts",
      entityId: id,
      workspaceId: args.workspaceId,
      userId: String(userId),
      metadata: { slug, status, locale: args.locale },
    })

    return id
  },
})

export const publishPost = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    if (!userId) throw new Error("Unauthenticated")
    await requirePermission(ctx, args.workspaceId, PERMS.BLOG_PUBLISH)

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error("Post not found")
    if (post.workspaceId !== args.workspaceId) throw new Error("Cross-workspace access denied")
    if (post.status === "published") return { ok: true, alreadyPublished: true }

    const now = Date.now()
    await ctx.db.patch(args.postId, {
      status: "published",
      publishedAt: now,
      updatedAt: now,
      updatedBy: userId,
    })

    await logAudit(ctx, {
      action: "blog.post.published",
      entityType: "blogPosts",
      entityId: args.postId,
      workspaceId: args.workspaceId,
      userId: String(userId),
      metadata: { slug: post.slug, previousStatus: post.status },
    })

    return { ok: true, alreadyPublished: false }
  },
})

export const archivePost = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    postId: v.id("blogPosts"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    if (!userId) throw new Error("Unauthenticated")
    await requirePermission(ctx, args.workspaceId, PERMS.BLOG_DELETE)

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error("Post not found")
    if (post.workspaceId !== args.workspaceId) throw new Error("Cross-workspace access denied")

    const now = Date.now()
    await ctx.db.patch(args.postId, { status: "archived", updatedAt: now, updatedBy: userId })

    await logAudit(ctx, {
      action: "blog.post.archived",
      entityType: "blogPosts",
      entityId: args.postId,
      workspaceId: args.workspaceId,
      userId: String(userId),
      metadata: { slug: post.slug, previousStatus: post.status },
    })

    return { ok: true }
  },
})

export const createCategory = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    if (!userId) throw new Error("Unauthenticated")
    await requirePermission(ctx, args.workspaceId, PERMS.BLOG_CREATE)

    const slug = args.slug ? slugify(args.slug) : slugify(args.name)
    if (!slug) throw new Error("Slug derived from name is empty")

    const existing = await ctx.db
      .query("blogCategories")
      .withIndex("by_workspace_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", slug),
      )
      .first()
    if (existing) throw new Error(`Category slug "${slug}" already exists`)

    const id = await ctx.db.insert("blogCategories", {
      workspaceId: args.workspaceId,
      slug,
      name: args.name,
      description: args.description,
      createdAt: Date.now(),
      createdBy: userId,
    })

    await logAudit(ctx, {
      action: "blog.category.created",
      entityType: "blogCategories",
      entityId: id,
      workspaceId: args.workspaceId,
      userId: String(userId),
      metadata: { slug, name: args.name },
    })

    return id
  },
})
