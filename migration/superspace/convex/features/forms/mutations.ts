import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for forms feature
 */

const formFieldValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("textarea"),
    v.literal("number"),
    v.literal("email"),
    v.literal("phone"),
    v.literal("date"),
    v.literal("datetime"),
    v.literal("time"),
    v.literal("select"),
    v.literal("multiselect"),
    v.literal("checkbox"),
    v.literal("radio"),
    v.literal("file"),
    v.literal("rating"),
    v.literal("signature")
  ),
  label: v.string(),
  placeholder: v.optional(v.string()),
  helpText: v.optional(v.string()),
  required: v.boolean(),
  validation: v.optional(v.object({
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    minLength: v.optional(v.number()),
    maxLength: v.optional(v.number()),
    pattern: v.optional(v.string()),
    customMessage: v.optional(v.string()),
  })),
  options: v.optional(v.array(v.object({
    label: v.string(),
    value: v.string(),
  }))),
  defaultValue: v.optional(v.any()),
  conditionalLogic: v.optional(v.object({
    show: v.boolean(),
    conditions: v.array(v.object({
      fieldId: v.string(),
      operator: v.string(),
      value: v.any(),
    })),
  })),
  order: v.number(),
})

export const createForm = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.optional(v.string()),
    fields: v.optional(v.array(formFieldValidator)),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.FORMS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const id = await ctx.db.insert("forms", {
      workspaceId: args.workspaceId,
      title: args.title,
      description: args.description,
      fields: args.fields ?? [],
      settings: {
        allowMultipleSubmissions: true,
        requireAuth: false,
      },
      status: "draft",
      submissionCount: 0,
      viewCount: 0,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      updatedBy: userId,
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "form.created",
      resourceType: "form",
      resourceId: String(id),
      metadata: { title: args.title },
    })

    return { id, success: true }
  },
})

export const updateForm = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    formId: v.id("forms"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    fields: v.optional(v.array(formFieldValidator)),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("closed"),
      v.literal("archived")
    )),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.FORMS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    if (candidateIds.length === 0) throw new Error("Not authenticated")

    const userId = candidateIds[0] as Id<"users">

    const form = await ctx.db.get(args.formId)
    if (!form || form.workspaceId !== args.workspaceId) {
      throw new Error("Form not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now(), updatedBy: userId }
    if (args.title !== undefined) updates.title = args.title
    if (args.description !== undefined) updates.description = args.description
    if (args.fields !== undefined) updates.fields = args.fields
    if (args.status !== undefined) {
      updates.status = args.status
      if (args.status === "published") updates.publishedAt = Date.now()
      if (args.status === "closed") updates.closedAt = Date.now()
    }

    await ctx.db.patch(args.formId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "form.updated",
      resourceType: "form",
      resourceId: String(args.formId),
    })

    return { success: true }
  },
})

export const deleteForm = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.FORMS_MANAGE)

    const candidateIds = await resolveCandidateUserIds(ctx)
    const userId = candidateIds[0] as Id<"users"> | undefined

    const form = await ctx.db.get(args.formId)
    if (!form || form.workspaceId !== args.workspaceId) {
      throw new Error("Form not found")
    }

    const deletedId = String(args.formId)
    await ctx.db.delete(args.formId)

    if (userId) {
      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        actorUserId: userId,
        action: "form.deleted",
        resourceType: "form",
        resourceId: deletedId,
      })
    }

    return { success: true }
  },
})

// @dod:skip-permissions reason="anonymous public form submission — form is workspace-scoped via formId lookup; no Clerk identity required for end-user submitters"
// @dod:skip-audit reason="anonymous public submission — formSubmissions row IS the audit trail (immutable record of submission); no Clerk identity to attribute audit actor"
export const submitForm = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    formId: v.id("forms"),
    data: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    // Note: Form submissions might be public, so we check if form exists
    const form = await ctx.db.get(args.formId)
    if (!form || form.workspaceId !== args.workspaceId) {
      throw new Error("Form not found")
    }

    // Try to get user if authenticated
    const candidateIds = await resolveCandidateUserIds(ctx)
    const userId = candidateIds.length > 0 ? candidateIds[0] as Id<"users"> : undefined

    const id = await ctx.db.insert("formSubmissions", {
      workspaceId: args.workspaceId,
      formId: args.formId,
      data: args.data,
      status: "pending",
      submittedBy: userId,
      submittedAt: Date.now(),
    })

    // Update submission count
    await ctx.db.patch(args.formId, {
      submissionCount: (form.submissionCount || 0) + 1,
    })

    return { id, success: true }
  },
})
