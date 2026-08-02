import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { logAuditEvent } from "../../shared/audit";
import { internal } from "../../_generated/api";

// Shared validators for workflow step types
const stepTypeValidator = v.union(
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
);

const workflowStepValidator = v.object({
  id: v.string(),
  type: stepTypeValidator,
  config: v.any(),
  retryConfig: v.optional(v.object({
    maxAttempts: v.number(),
    backoffMs: v.number(),
  })),
  timeoutMs: v.optional(v.number()),
});

const workflowDefinitionValidator = v.object({
  steps: v.array(workflowStepValidator),
  settings: v.optional(v.object({
    slaDurationMs: v.optional(v.number()),
    maxRetries: v.optional(v.number()),
  })),
});

/**
 * Create a new workflow
 */
export const createWorkflow = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    trigger: v.union(
      v.literal("manual"),
      v.literal("schedule"),
      v.literal("event"),
    ),
    definition: workflowDefinitionValidator,
  },
  returns: v.id("workflows"),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "studio.create" as any);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workflowId = await ctx.db.insert("workflows", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      trigger: args.trigger,
      status: "draft",
      definition: args.definition,
      createdBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "studio.workflow.created",
      resourceType: "workflow",
      resourceId: workflowId,
      changes: {
        name: args.name,
        trigger: args.trigger,
      },
    });

    return workflowId;
  },
});

/**
 * Update workflow
 */
export const updateWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    trigger: v.optional(v.union(
      v.literal("manual"),
      v.literal("schedule"),
      v.literal("event"),
    )),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived"),
    )),
    definition: v.optional(workflowDefinitionValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    await requirePermission(ctx, workflow.workspaceId, "studio.edit" as any);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.trigger !== undefined) updates.trigger = args.trigger;
    if (args.status !== undefined) updates.status = args.status;
    if (args.definition !== undefined) updates.definition = args.definition;

    await ctx.db.patch(args.workflowId, updates);

    await logAuditEvent(ctx, {
      workspaceId: workflow.workspaceId,
      actorUserId: userId,
      action: "studio.workflow.updated",
      resourceType: "workflow",
      resourceId: args.workflowId,
      changes: updates,
    });

    return null;
  },
});

/**
 * Execute workflow manually
 */
export const executeWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
    isDryRun: v.optional(v.boolean()),
  },
  returns: v.id("workflowExecutions"),
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    await requirePermission(ctx, workflow.workspaceId, "studio.execute" as any);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Allow running drafts if it's a dry run
    if (workflow.status !== "active" && !args.isDryRun) {
      throw new Error("Workflow is not active");
    }

    const executionId = await ctx.db.insert("workflowExecutions", {
      workflowId: args.workflowId,
      workspaceId: workflow.workspaceId,
      status: "running",
      startedAt: Date.now(),
      triggeredBy: userId,
      isDryRun: args.isDryRun,
      logs: [{
        timestamp: Date.now(),
        level: "info",
        message: `Workflow execution started${args.isDryRun ? " (Dry Run)" : ""}`,
      }],
    });

    // Update workflow metadata
    await ctx.db.patch(args.workflowId, {
      metadata: {
        ...workflow.metadata,
        lastRunAt: Date.now(),
        runCount: (workflow.metadata?.runCount || 0) + 1,
      },
    });

    // Schedule the workflow execution via the executor action
    await ctx.scheduler.runAfter(0, internal.features.studio.executor.processExecution, {
      executionId,
    });

    await logAuditEvent(ctx, {
      workspaceId: workflow.workspaceId,
      actorUserId: userId,
      action: "studio.workflow.executed",
      resourceType: "workflow",
      resourceId: args.workflowId,
      metadata: { executionId },
    });

    return executionId;
  },
});

/**
 * Cancel workflow execution
 */
export const cancelExecution = mutation({
  args: {
    executionId: v.id("workflowExecutions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.executionId);
    if (!execution) throw new Error("Execution not found");
    await requirePermission(ctx, execution.workspaceId, "studio.execute" as any);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (execution.status !== "running") {
      throw new Error("Execution is not running");
    }

    await ctx.db.patch(args.executionId, {
      status: "cancelled",
      completedAt: Date.now(),
      error: "Cancelled by user",
    });

    await logAuditEvent(ctx, {
      workspaceId: execution.workspaceId,
      actorUserId: userId,
      action: "studio.execution.cancelled",
      resourceType: "workflowExecution",
      resourceId: args.executionId,
      metadata: { workflowId: execution.workflowId },
    });

    return null;
  },
});

/**
 * Delete workflow
 */
export const deleteWorkflow = mutation({
  args: {
    workflowId: v.id("workflows"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) throw new Error("Workflow not found");
    await requirePermission(ctx, workflow.workspaceId, "studio.delete" as any);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if there are running executions
    const runningExecutions = await ctx.db
      .query("workflowExecutions")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .filter((q) => q.eq(q.field("status"), "running"))
      .take(1);

    if (runningExecutions.length > 0) {
      throw new Error("Cannot delete workflow with running executions");
    }

    await ctx.db.delete(args.workflowId);

    await logAuditEvent(ctx, {
      workspaceId: workflow.workspaceId,
      actorUserId: userId,
      action: "studio.workflow.deleted",
      resourceType: "workflow",
      resourceId: args.workflowId,
    });

    return null;
  },
});
