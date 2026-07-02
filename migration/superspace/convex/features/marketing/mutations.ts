import { v } from "convex/values"
import { internalMutation, mutation, type QueryCtx, type MutationCtx } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import type { Id } from "../../_generated/dataModel"
import { logAuditEvent } from "../../shared/audit"

/**
 * Comprehensive Marketing Mutations
 */

// Helper to get current user ID
async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const candidateIds = await resolveCandidateUserIds(ctx)
  if (candidateIds.length === 0) throw new Error("Not authenticated")
  return candidateIds[0] as Id<"users">
}

// ═══════════════════════════════════════════════════════════════════════════════
// Campaign Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createCampaign = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("social"),
      v.literal("ads"),
      v.literal("push"),
      v.literal("content"),
      v.literal("event"),
      v.literal("other")
    )),
    content: v.optional(v.object({
      subject: v.optional(v.string()),
      previewText: v.optional(v.string()),
      body: v.optional(v.string()),
      htmlBody: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("marketingCampaigns", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type ?? "email",
      status: "draft",
      content: args.content,
      sent: 0,
      delivered: 0,
      opens: 0,
      clicks: 0,
      conversions: 0,
      unsubscribes: 0,
      bounces: 0,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "marketing_campaign.create",
      resourceType: "marketingCampaign",
      resourceId: id,
      metadata: { name: args.name }
    })

    return { id, success: true }
  },
})

export const updateCampaign = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    campaignId: v.id("marketingCampaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    content: v.optional(v.object({
      subject: v.optional(v.string()),
      previewText: v.optional(v.string()),
      body: v.optional(v.string()),
      htmlBody: v.optional(v.string()),
      template: v.optional(v.id("marketingTemplates")),
    })),
    schedule: v.optional(v.object({
      sendAt: v.optional(v.number()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      timezone: v.optional(v.string()),
    })),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign || campaign.workspaceId !== args.workspaceId) {
      throw new Error("Campaign not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }

    const fields = ["name", "description", "type", "status", "content", "schedule", "tags"]
    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.campaignId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing.campaign.updated",
      resourceType: "marketingCampaign",
      resourceId: String(args.campaignId),
      metadata: { fields: Object.keys(updates), name: campaign.name },
    })

    return { success: true }
  },
})

export const deleteCampaign = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign || campaign.workspaceId !== args.workspaceId) {
      throw new Error("Campaign not found")
    }

    // Can only delete drafts
    if (campaign.status !== "draft") {
      throw new Error("Can only delete draft campaigns. Cancel or archive instead.")
    }

    await ctx.db.delete(args.campaignId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing.campaign.deleted",
      resourceType: "marketingCampaign",
      resourceId: String(args.campaignId),
      metadata: { name: campaign.name },
    })

    return { success: true }
  },
})

export const duplicateCampaign = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    campaignId: v.id("marketingCampaigns"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const original = await ctx.db.get(args.campaignId)
    if (!original || original.workspaceId !== args.workspaceId) {
      throw new Error("Campaign not found")
    }

    const id = await ctx.db.insert("marketingCampaigns", {
      workspaceId: args.workspaceId,
      name: args.name || `${original.name} (Copy)`,
      description: original.description,
      type: original.type,
      status: "draft",
      content: original.content,
      audience: original.audience,
      tags: original.tags,
      sent: 0,
      delivered: 0,
      opens: 0,
      clicks: 0,
      conversions: 0,
      unsubscribes: 0,
      bounces: 0,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_campaign.duplicate",
      resourceType: "marketingCampaign",
      resourceId: id,
      metadata: { originalId: args.campaignId }
    })

    return { id, success: true }
  },
})

export const scheduleCampaign = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    campaignId: v.id("marketingCampaigns"),
    sendAt: v.number(),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign || campaign.workspaceId !== args.workspaceId) {
      throw new Error("Campaign not found")
    }

    if (campaign.status !== "draft") {
      throw new Error("Can only schedule draft campaigns")
    }

    await ctx.db.patch(args.campaignId, {
      status: "scheduled",
      schedule: {
        sendAt: args.sendAt,
        timezone: args.timezone || "UTC",
      },
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_campaign.schedule",
      resourceType: "marketingCampaign",
      resourceId: args.campaignId,
      metadata: { sendAt: args.sendAt }
    })

    return { success: true }
  },
})

export const sendCampaign = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign || campaign.workspaceId !== args.workspaceId) {
      throw new Error("Campaign not found")
    }

    if (!["draft", "scheduled"].includes(campaign.status)) {
      throw new Error("Campaign cannot be sent")
    }

    // In a real implementation, this would queue the campaign for sending
    await ctx.db.patch(args.campaignId, {
      status: "active",
      sentAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_campaign.send",
      resourceType: "marketingCampaign",
      resourceId: args.campaignId,
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Template Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("landing_page"),
      v.literal("social_post"),
      v.literal("push_notification")
    ),
    category: v.optional(v.string()),
    subject: v.optional(v.string()),
    content: v.string(),
    htmlContent: v.optional(v.string()),
    format: v.optional(v.union(
      v.literal("html"),
      v.literal("builder"),
      v.literal("text")
    )),
    variables: v.optional(v.array(v.object({
      name: v.string(),
      defaultValue: v.optional(v.string()),
      type: v.string(),
      required: v.boolean(),
    }))),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("marketingTemplates", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type,
      category: args.category,
      subject: args.subject,
      content: args.content,
      htmlContent: args.htmlContent,
      format: args.format || "html",
      variables: args.variables,
      isPublic: false,
      usageCount: 0,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_template.create",
      resourceType: "marketingTemplate",
      resourceId: id,
      metadata: { name: args.name, type: args.type }
    })

    return { id, success: true }
  },
})

export const updateTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    templateId: v.id("marketingTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    htmlContent: v.optional(v.string()),
    variables: v.optional(v.array(v.object({
      name: v.string(),
      defaultValue: v.optional(v.string()),
      type: v.string(),
      required: v.boolean(),
    }))),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const template = await ctx.db.get(args.templateId)
    if (!template || template.workspaceId !== args.workspaceId) {
      throw new Error("Template not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = ["name", "description", "category", "subject", "content", "htmlContent", "variables", "isPublic"]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.templateId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_template.update",
      resourceType: "marketingTemplate",
      resourceId: args.templateId,
    })

    return { success: true }
  },
})

export const deleteTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    templateId: v.id("marketingTemplates"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const template = await ctx.db.get(args.templateId)
    if (!template || template.workspaceId !== args.workspaceId) {
      throw new Error("Template not found")
    }

    await ctx.db.delete(args.templateId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_template.delete",
      resourceType: "marketingTemplate",
      resourceId: args.templateId,
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Subscriber Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const addSubscriber = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    lists: v.optional(v.array(v.id("marketingLists"))),
    source: v.optional(v.string()),
    customFields: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    // Check if subscriber already exists
    const existing = await ctx.db
      .query("marketingSubscribers")
      .withIndex("by_email", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("email", args.email)
      )
      .first()

    if (existing) {
      // Update existing subscriber
      const updates: Record<string, any> = { updatedAt: Date.now() }
      if (args.firstName) updates.firstName = args.firstName
      if (args.lastName) updates.lastName = args.lastName
      if (args.phone) updates.phone = args.phone
      if (args.customFields) {
        updates.customFields = { ...existing.customFields, ...args.customFields }
      }
      if (args.lists) {
        const allLists = [...new Set([...existing.lists, ...args.lists])]
        updates.lists = allLists
      }

      // Resubscribe if unsubscribed
      if (existing.status === "unsubscribed") {
        updates.status = "subscribed"
        updates.subscribedAt = Date.now()
      }

      await ctx.db.patch(existing._id, updates)

      await logAuditEvent(ctx, {
        workspaceId: args.workspaceId,
        actorUserId: membership.userId,
        action: "marketing_subscriber.update",
        resourceType: "marketingSubscriber",
        resourceId: existing._id,
      })

      return { id: existing._id, success: true, isNew: false }
    }

    // Create new subscriber
    const id = await ctx.db.insert("marketingSubscribers", {
      workspaceId: args.workspaceId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      lists: args.lists || [],
      status: "subscribed",
      source: args.source,
      customFields: args.customFields,
      engagement: {
        totalOpens: 0,
        totalClicks: 0,
        emailsSent: 0,
      },
      subscribedAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Update list counts
    if (args.lists) {
      for (const listId of args.lists) {
        const list = await ctx.db.get(listId)
        if (list) {
          await ctx.db.patch(listId, {
            subscriberCount: list.subscriberCount + 1,
            updatedAt: Date.now(),
          })
        }
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_subscriber.create",
      resourceType: "marketingSubscriber",
      resourceId: id,
      metadata: { email: args.email }
    })

    return { id, success: true, isNew: true }
  },
})

export const updateSubscriber = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    subscriberId: v.id("marketingSubscribers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    lists: v.optional(v.array(v.id("marketingLists"))),
    customFields: v.optional(v.record(v.string(), v.any())),
    preferences: v.optional(v.object({
      emailFrequency: v.optional(v.string()),
      categories: v.optional(v.array(v.string())),
      timezone: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const subscriber = await ctx.db.get(args.subscriberId)
    if (!subscriber || subscriber.workspaceId !== args.workspaceId) {
      throw new Error("Subscriber not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    const fields = ["firstName", "lastName", "phone", "lists", "customFields", "preferences"]

    for (const field of fields) {
      if ((args as any)[field] !== undefined) {
        updates[field] = (args as any)[field]
      }
    }

    await ctx.db.patch(args.subscriberId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_subscriber.update",
      resourceType: "marketingSubscriber",
      resourceId: args.subscriberId,
    })

    return { success: true }
  },
})

export const unsubscribe = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    subscriberId: v.id("marketingSubscribers"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const subscriber = await ctx.db.get(args.subscriberId)
    if (!subscriber || subscriber.workspaceId !== args.workspaceId) {
      throw new Error("Subscriber not found")
    }

    await ctx.db.patch(args.subscriberId, {
      status: "unsubscribed",
      unsubscribedAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Update list counts
    for (const listId of subscriber.lists) {
      const list = await ctx.db.get(listId)
      if (list) {
        await ctx.db.patch(listId, {
          subscriberCount: Math.max(0, list.subscriberCount - 1),
          unsubscribedCount: (list.unsubscribedCount || 0) + 1,
          updatedAt: Date.now(),
        })
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_subscriber.unsubscribe",
      resourceType: "marketingSubscriber",
      resourceId: args.subscriberId,
      metadata: { reason: args.reason }
    })

    return { success: true }
  },
})

export const deleteSubscriber = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    subscriberId: v.id("marketingSubscribers"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const subscriber = await ctx.db.get(args.subscriberId)
    if (!subscriber || subscriber.workspaceId !== args.workspaceId) {
      throw new Error("Subscriber not found")
    }

    // Update list counts
    for (const listId of subscriber.lists) {
      const list = await ctx.db.get(listId)
      if (list) {
        await ctx.db.patch(listId, {
          subscriberCount: Math.max(0, list.subscriberCount - 1),
          updatedAt: Date.now(),
        })
      }
    }

    await ctx.db.delete(args.subscriberId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_subscriber.delete",
      resourceType: "marketingSubscriber",
      resourceId: args.subscriberId,
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// List Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createList = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("static"), v.literal("dynamic"))),
    doubleOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("marketingLists", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type || "static",
      doubleOptIn: args.doubleOptIn,
      subscriberCount: 0,
      activeCount: 0,
      unsubscribedCount: 0,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_list.create",
      resourceType: "marketingList",
      resourceId: id,
      metadata: { name: args.name, type: args.type }
    })

    return { id, success: true }
  },
})

export const updateList = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    listId: v.id("marketingLists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    doubleOptIn: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const list = await ctx.db.get(args.listId)
    if (!list || list.workspaceId !== args.workspaceId) {
      throw new Error("List not found")
    }

    const updates: Record<string, any> = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.doubleOptIn !== undefined) updates.doubleOptIn = args.doubleOptIn

    await ctx.db.patch(args.listId, updates)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_list.update",
      resourceType: "marketingList",
      resourceId: args.listId,
    })

    return { success: true }
  },
})

export const deleteList = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    listId: v.id("marketingLists"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const list = await ctx.db.get(args.listId)
    if (!list || list.workspaceId !== args.workspaceId) {
      throw new Error("List not found")
    }

    // Remove list from all subscribers
    const subscribers = await ctx.db
      .query("marketingSubscribers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(50000)

    for (const subscriber of subscribers) {
      if (subscriber.lists.includes(args.listId)) {
        await ctx.db.patch(subscriber._id, {
          lists: subscriber.lists.filter(id => id !== args.listId),
          updatedAt: Date.now(),
        })
      }
    }

    await ctx.db.delete(args.listId)

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_list.delete",
      resourceType: "marketingList",
      resourceId: args.listId,
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Segment Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createSegment = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    rules: v.array(v.object({
      type: v.string(),
      field: v.string(),
      operator: v.string(),
      value: v.any(),
      logic: v.optional(v.string()),
    })),
    autoRefresh: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("marketingSegments", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      rules: args.rules,
      size: 0,
      autoRefresh: args.autoRefresh,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_segment.create",
      resourceType: "marketingSegment",
      resourceId: id,
      metadata: { name: args.name }
    })

    return { id, success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Automation Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createAutomation = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    trigger: v.object({
      type: v.string(),
      conditions: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      config: v.optional(v.record(v.string(), v.any())),
    }),
    steps: v.array(v.object({
      id: v.string(),
      type: v.string(),
      config: v.record(v.string(), v.any()),
      nextSteps: v.optional(v.array(v.object({
        stepId: v.string(),
        condition: v.optional(v.string()),
      }))),
    })),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("marketingAutomations", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      status: "draft",
      trigger: args.trigger,
      steps: args.steps,
      stats: {
        enrolled: 0,
        completed: 0,
        active: 0,
        emailsSent: 0,
      },
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_automation.create",
      resourceType: "marketingAutomation",
      resourceId: id,
      metadata: { name: args.name }
    })

    return { id, success: true }
  },
})

export const updateAutomationStatus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    automationId: v.id("marketingAutomations"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)

    const automation = await ctx.db.get(args.automationId)
    if (!automation || automation.workspaceId !== args.workspaceId) {
      throw new Error("Automation not found")
    }

    await ctx.db.patch(args.automationId, {
      status: args.status,
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_automation.update_status",
      resourceType: "marketingAutomation",
      resourceId: args.automationId,
      metadata: { status: args.status }
    })

    return { success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Form Mutations
// ═══════════════════════════════════════════════════════════════════════════════

export const createForm = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("embedded"),
      v.literal("popup"),
      v.literal("landing_page")
    ),
    fields: v.array(v.object({
      id: v.string(),
      type: v.string(),
      name: v.string(),
      label: v.string(),
      placeholder: v.optional(v.string()),
      required: v.boolean(),
      options: v.optional(v.array(v.object({
        label: v.string(),
        value: v.string(),
      }))),
    })),
    settings: v.optional(v.object({
      submitButtonText: v.optional(v.string()),
      successMessage: v.optional(v.string()),
      redirectUrl: v.optional(v.string()),
      doubleOptIn: v.optional(v.boolean()),
      addToLists: v.optional(v.array(v.id("marketingLists"))),
      addTags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MARKETING_MANAGE)
    const userId = await getCurrentUserId(ctx)

    const id = await ctx.db.insert("marketingForms", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      type: args.type,
      fields: args.fields,
      settings: args.settings,
      views: 0,
      submissions: 0,
      isActive: true,
      createdBy: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: membership.userId,
      action: "marketing_form.create",
      resourceType: "marketingForm",
      resourceId: id,
      metadata: { name: args.name, type: args.type }
    })

    return { id, success: true }
  },
})

// @dod:skip-permissions reason="anonymous public marketing form submission — workspace-scoped via formId; lead capture endpoint cannot require Clerk identity"
// @dod:skip-audit reason="anonymous public lead capture — marketingFormSubmissions row IS the audit trail; no Clerk identity to attribute"
export const submitForm = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    formId: v.id("marketingForms"),
    data: v.record(v.string(), v.any()),
    source: v.optional(v.object({
      url: v.optional(v.string()),
      referrer: v.optional(v.string()),
      utmSource: v.optional(v.string()),
      utmMedium: v.optional(v.string()),
      utmCampaign: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId)
    if (!form || form.workspaceId !== args.workspaceId) {
      throw new Error("Form not found")
    }

    if (!form.isActive) {
      throw new Error("Form is not active")
    }

    // Create submission record
    const submissionId = await ctx.db.insert("marketingFormSubmissions", {
      workspaceId: args.workspaceId,
      formId: args.formId,
      data: args.data,
      source: args.source,
      status: "pending",
      createdAt: Date.now(),
    })

    // Update form stats
    await ctx.db.patch(args.formId, {
      submissions: (form.submissions || 0) + 1,
      conversionRate: form.views ? ((form.submissions || 0) + 1) / form.views * 100 : 0,
      updatedAt: Date.now(),
    })

    // Auto-create subscriber if email field exists
    const email = args.data.email
    if (email && typeof email === "string") {
      const existing = await ctx.db
        .query("marketingSubscribers")
        .withIndex("by_email", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("email", email)
        )
        .first()

      if (!existing) {
        const subscriberId = await ctx.db.insert("marketingSubscribers", {
          workspaceId: args.workspaceId,
          email,
          firstName: args.data.firstName || args.data.first_name,
          lastName: args.data.lastName || args.data.last_name,
          phone: args.data.phone,
          lists: form.settings?.addToLists || [],
          status: form.settings?.doubleOptIn ? "pending" : "subscribed",
          source: "form",
          sourceId: args.formId,
          customFields: args.data,
          engagement: {
            totalOpens: 0,
            totalClicks: 0,
            emailsSent: 0,
          },
          subscribedAt: Date.now(),
          updatedAt: Date.now(),
        })

        // Update submission with subscriber ID
        await ctx.db.patch(submissionId, {
          subscriberId,
          status: "processed",
        })

        // Update list counts
        if (form.settings?.addToLists) {
          for (const listId of form.settings.addToLists) {
            const list = await ctx.db.get(listId)
            if (list) {
              await ctx.db.patch(listId, {
                subscriberCount: list.subscriberCount + 1,
                updatedAt: Date.now(),
              })
            }
          }
        }
      }
    }

    return { id: submissionId, success: true }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Event Tracking Mutations
// ═══════════════════════════════════════════════════════════════════════════════

// @dod:skip-permissions reason="internalMutation — NOT reachable from the public client API. Only callable from trusted server context (e.g. a future http.ts tracking-pixel action via ctx.runMutation(internal.features.marketing.mutations.trackEvent, ...)). Was a public mutation() with no auth; the old 'no Clerk identity in tracking pixels' rationale was stale (Clerk dropped 2026-05-15). Closing the authz hole by making it internal-only."
// @dod:skip-audit reason="email-tracking pixel telemetry — high-frequency, the event row IS the audit; auditing every pixel ping would 10x the audit log"
export const trackEvent = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("opened"),
      v.literal("clicked"),
      v.literal("bounced"),
      v.literal("unsubscribed"),
      v.literal("complained"),
      v.literal("converted")
    ),
    campaignId: v.optional(v.id("marketingCampaigns")),
    subscriberId: v.optional(v.id("marketingSubscribers")),
    email: v.optional(v.string()),
    data: v.optional(v.object({
      url: v.optional(v.string()),
      bounceType: v.optional(v.string()),
      bounceReason: v.optional(v.string()),
      conversionValue: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Create event
    const id = await ctx.db.insert("marketingEvents", {
      workspaceId: args.workspaceId,
      type: args.type,
      campaignId: args.campaignId,
      subscriberId: args.subscriberId,
      email: args.email,
      data: args.data,
      createdAt: Date.now(),
    })

    // Update campaign metrics
    if (args.campaignId) {
      const campaign = await ctx.db.get(args.campaignId)
      if (campaign) {
        const updates: Record<string, any> = { updatedAt: Date.now() }

        switch (args.type) {
          case "sent":
            updates.sent = (campaign.sent || 0) + 1
            break
          case "delivered":
            updates.delivered = (campaign.delivered || 0) + 1
            break
          case "opened":
            updates.opens = (campaign.opens || 0) + 1
            break
          case "clicked":
            updates.clicks = (campaign.clicks || 0) + 1
            break
          case "bounced":
            updates.bounces = (campaign.bounces || 0) + 1
            break
          case "unsubscribed":
            updates.unsubscribes = (campaign.unsubscribes || 0) + 1
            break
          case "converted":
            updates.conversions = (campaign.conversions || 0) + 1
            break
        }

        await ctx.db.patch(args.campaignId, updates)
      }
    }

    // Update subscriber engagement
    if (args.subscriberId) {
      const subscriber = await ctx.db.get(args.subscriberId)
      if (subscriber && subscriber.engagement) {
        const updates: Record<string, any> = { updatedAt: Date.now() }

        if (args.type === "opened") {
          updates.engagement = {
            ...subscriber.engagement,
            totalOpens: subscriber.engagement.totalOpens + 1,
            lastOpen: Date.now(),
          }
        } else if (args.type === "clicked") {
          updates.engagement = {
            ...subscriber.engagement,
            totalClicks: subscriber.engagement.totalClicks + 1,
            lastClick: Date.now(),
          }
        }

        if (Object.keys(updates).length > 1) {
          await ctx.db.patch(args.subscriberId, updates)
        }
      }
    }

    return { id, success: true }
  },
})
