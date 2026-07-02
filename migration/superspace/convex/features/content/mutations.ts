import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { ensureUser, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import { assertDocWorkspace } from "../lib/rbac"

/**
 * Mutations for content feature
 * 
 * Content types supported:
 * - images
 * - videos
 * - audio
 * - documents
 * - links
 */

// Placeholder mutation - actual content table needs to be created
export const createItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    type: v.optional(v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("document"),
      v.literal("link")
    )),
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Check permission
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.CONTENT_MANAGE
    )

    // TODO: Create content table in schema and implement proper storage
    // For now, return a placeholder response

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "content.item.create",
      resourceType: "contentItem",
      resourceId: "temp_id",
      metadata: { name: args.name, type: args.type }
    })

    return {
      success: true,
      message: "Content feature is being set up. Content table creation pending.",
      workspaceId: args.workspaceId,
      name: args.name,
      type: args.type ?? "document",
      createdBy: membership.userDocId,
    }
  },
})

export const updateContent = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contentId: v.id("content"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("scheduled"),
        v.literal("archived"),
      ),
    ),
    folder: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isFavorite: v.optional(v.boolean()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.CONTENT_MANAGE)
    const row = await ctx.db.get(args.contentId)
    assertDocWorkspace(row, args.workspaceId, "content")
    const patch: Record<string, unknown> = { updatedAt: Date.now() }
    if (args.name !== undefined) patch.name = args.name
    if (args.description !== undefined) patch.description = args.description
    if (args.status !== undefined) patch.status = args.status
    if (args.folder !== undefined) patch.folder = args.folder
    if (args.tags !== undefined) patch.tags = args.tags
    if (args.isFavorite !== undefined) patch.isFavorite = args.isFavorite
    if (args.url !== undefined) patch.url = args.url
    await ctx.db.patch(args.contentId, patch as any)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership?.userId,
      action: "content.item.updated",
      resourceType: "content",
      resourceId: args.contentId,
      changes: patch,
    })
    return { success: true }
  },
})

export const deleteContent = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contentId: v.id("content"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.CONTENT_MANAGE)
    const actorId = membership?.userId ?? (await ensureUser(ctx))
    const row = await ctx.db.get(args.contentId)
    assertDocWorkspace(row, args.workspaceId, "content")
    await ctx.db.delete(args.contentId)
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: actorId,
      action: "content.item.deleted",
      resourceType: "content",
      resourceId: args.contentId,
      metadata: { name: row!.name, type: row!.type },
    })
    return { success: true }
  },
})
