import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { requirePermission, ensureUser } from "../../auth/helpers";
import { logAuditEvent } from "../../shared/audit";

// Shared workflow definition validator for templates
const templateDefinitionValidator = v.object({
  steps: v.array(v.object({
    id: v.string(),
    type: v.union(
      v.literal("condition"),
      v.literal("delay"),
      v.literal("sendEmail"),
      v.literal("sendNotification"),
      v.literal("createTask"),
      v.literal("updateRecord"),
      v.literal("httpRequest"),
      v.literal("setVariable"),
      v.literal("code"),
      v.literal("log"),
    ),
    config: v.any(),
    retryConfig: v.optional(v.object({
      maxAttempts: v.number(),
      backoffMs: v.number(),
    })),
    timeoutMs: v.optional(v.number()),
  })),
  settings: v.optional(v.object({
    slaDurationMs: v.optional(v.number()),
    maxRetries: v.optional(v.number()),
  })),
});

/**
 * List workflow templates
 */
export const listTemplates = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Templates are public or shared, so we might not need strict workspace checks for listing
    // unless we have private workspace templates.
    // For now, return all public templates or filtered by category.

    const category = args.category;
    if (category) {
      return await ctx.db.query("workflowTemplates")
        .withIndex("by_category", (q) => q.eq("category", category))
        .take(50);
    }

    return await ctx.db.query("workflowTemplates").take(50);
  },
});

/**
 * Create a new workflow template
 */
export const createTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    definition: templateDefinitionValidator,
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.create" as any);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const templateId = await ctx.db.insert("workflowTemplates", {
      name: args.name,
      description: args.description,
      category: args.category,
      definition: args.definition,
      isPublic: args.isPublic,
      createdBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "studio.template.created",
      resourceType: "workflowTemplate",
      resourceId: templateId,
      metadata: { name: args.name, category: args.category },
    });

    return templateId;
  },
});

/**
 * Instantiate a workflow from a template
 */
export const useTemplate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    templateId: v.id("workflowTemplates"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.create" as any);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template not found");

    const workflowId = await ctx.db.insert("workflows", {
      workspaceId: args.workspaceId,
      name: args.name || template.name,
      description: template.description,
      trigger: "manual", // Default to manual, user configures later
      status: "draft",
      definition: template.definition,
      createdBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "studio.template.used",
      resourceType: "workflow",
      resourceId: workflowId,
      metadata: { templateId: args.templateId, templateName: template.name },
    });

    return workflowId;
  },
});
