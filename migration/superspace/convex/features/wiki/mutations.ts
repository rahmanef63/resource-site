import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

async function ensureUniqueSlug(ctx: any, workspaceId: any, title: string, existingSlug?: string | null) {
  const baseSlug = slugify(title) || slugify(existingSlug ?? "") || `page-${Math.random().toString(36).slice(2, 8)}`
  let candidate = baseSlug
  let suffix = 1

  while (true) {
    const conflict = await ctx.db
      .query("wiki")
      .withIndex("by_workspace_slug", (q: any) => q.eq("workspaceId", workspaceId).eq("slug", candidate))
      .first()
    if (!conflict) {
      return candidate
    }
    candidate = `${baseSlug}-${suffix++}`
  }
}

/**
 * Wiki Mutations
 */

// Create new item
export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    category: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require permission
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.WIKI_MANAGE)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    const slug = await ensureUniqueSlug(ctx, args.workspaceId, args.title)

    const doc: any = {
      workspaceId: args.workspaceId,
      title: args.title,
      content: args.content,
      createdAt: now,
      updatedAt: now,
      createdBy: actorId,
      updatedBy: actorId,
      slug,
      isPublished: args.isPublished ?? true,
    }

    if (args.summary !== undefined) doc.summary = args.summary
    if (args.category !== undefined) doc.category = args.category

    const itemId = await ctx.db.insert("wiki", doc)

    await logAuditEvent(ctx, {
      action: "wiki.create",
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      resourceType: "wiki",
      resourceId: itemId,
      changes: {
        title: args.title,
        isPublished: args.isPublished,
      },
      metadata: { slug },
    })

    return itemId
  },
})

// Update item
export const update = mutation({
  args: {
    id: v.id("wiki"),
    patch: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      summary: v.optional(v.union(v.string(), v.null())),
      category: v.optional(v.union(v.string(), v.null())),
      isPublished: v.optional(v.boolean()),
      regenerateSlug: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    const { membership } = await requirePermission(ctx, item.workspaceId, PERMS.WIKI_MANAGE)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const now = Date.now()

    const updates: any = {
      updatedAt: now,
      updatedBy: actorId,
    }

    const { patch } = args

    if (patch.title !== undefined) updates.title = patch.title
    if (patch.content !== undefined) updates.content = patch.content
    if (patch.summary !== undefined) updates.summary = patch.summary === null ? undefined : patch.summary
    if (patch.category !== undefined) updates.category = patch.category === null ? undefined : patch.category
    if (patch.isPublished !== undefined) updates.isPublished = patch.isPublished

    if (patch.regenerateSlug || patch.title !== undefined) {
      const nextTitle = patch.title ?? item.title
      updates.slug = await ensureUniqueSlug(ctx, item.workspaceId, nextTitle, item.slug)
    }

    await ctx.db.patch(args.id, updates)

    await logAuditEvent(ctx, {
      action: "wiki.update",
      workspaceId: item.workspaceId,
      actorUserId: actorId,
      resourceType: "wiki",
      resourceId: args.id,
      changes: patch,
    })

    return args.id
  },
})

// Delete item
export const remove = mutation({
  args: {
    id: v.id("wiki"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id)
    if (!item) throw new Error("Item not found")

    // Require permission
    const { membership } = await requirePermission(ctx, item.workspaceId, PERMS.WIKI_MANAGE)
    const actorId = membership?.userId ?? (await ensureUser(ctx))

    await ctx.db.delete(args.id)

    await logAuditEvent(ctx, {
      action: "wiki.delete",
      workspaceId: item.workspaceId,
      actorUserId: actorId,
      resourceType: "wiki",
      resourceId: args.id,
      metadata: {
        title: item.title,
        slug: item.slug,
      },
    })

    return args.id
  },
})
