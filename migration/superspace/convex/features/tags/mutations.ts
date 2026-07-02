import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for tags feature
 * Note: Uses CRM tags schema with scope and isActive fields
 */

export const createTag = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    color: v.optional(v.string()),
    description: v.optional(v.string()),
    scope: v.optional(v.union(
      v.literal("global"),
      v.literal("contact"),
      v.literal("lead"),
      v.literal("account"),
      v.literal("opportunity"),
      v.literal("campaign")
    )),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.TAGS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("tags", {
      workspaceId: args.workspaceId,
      name: args.name,
      color: args.color ?? "gray",
      description: args.description,
      scope: args.scope ?? "global",
      isActive: true,
      usageCount: 0,
      createdBy: userId,
      createdAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "tag.created",
      resourceType: "tag",
      resourceId: String(id),
      metadata: { name: args.name },
    })

    return { id, success: true }
  },
})

export const updateTag = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    tagId: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.TAGS_MANAGE)

    const tag = await ctx.db.get(args.tagId)
    if (!tag || tag.workspaceId !== args.workspaceId) {
      throw new Error("Tag not found")
    }

    const updates: Record<string, any> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.color !== undefined) updates.color = args.color
    if (args.description !== undefined) updates.description = args.description

    await ctx.db.patch(args.tagId, updates)

    const candidates2 = await resolveCandidateUserIds(ctx)
    if (candidates2.length > 0) {
      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        actorUserId: candidates2[0] as Id<"users">,
        action: "tag.updated",
        resourceType: "tag",
        resourceId: String(args.tagId),
      })
    }

    return { success: true }
  },
})

export const deleteTag = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.TAGS_MANAGE)

    const tag = await ctx.db.get(args.tagId)
    if (!tag || tag.workspaceId !== args.workspaceId) {
      throw new Error("Tag not found")
    }

    const candidates3 = await resolveCandidateUserIds(ctx)
    const deletedTagId = String(args.tagId)
    await ctx.db.delete(args.tagId)

    if (candidates3.length > 0) {
      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        actorUserId: candidates3[0] as Id<"users">,
        action: "tag.deleted",
        resourceType: "tag",
        resourceId: deletedTagId,
      })
    }

    return { success: true }
  },
})
