import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getExistingUserId } from "../../auth/helpers";
import { hasWorkspaceAccess } from "../database/utils";

/**
 * Get all workflows in a workspace
 */
export const getWorkspaceWorkflows = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived"),
    )),
  },
  returns: v.array(v.record(v.string(), v.any())),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const { status } = args;
    // Fix 7: Always filter by workspace first, then optionally filter by status
    const workflowsQuery =
      status !== undefined
        ? ctx.db
            .query("workflows")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("status"), status))
        : ctx.db
            .query("workflows")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    // Fix 8: Add .take(100) instead of unbounded .collect()
    const workflows = await workflowsQuery.take(100);

    // Fix 9: Batch creator lookups and limit executions per workflow
    const creatorIds = [...new Set(workflows.map((w) => w.createdBy))];
    const creators = await Promise.all(creatorIds.map((id) => ctx.db.get(id)));
    const creatorMap = new Map(
      creatorIds.map((id, i) => [id, creators[i]])
    );

    const workflowsWithDetails = await Promise.all(
      workflows.map(async (workflow) => {
        const creator = creatorMap.get(workflow.createdBy) ?? null;

        // Limit executions per workflow to avoid N+1 unbounded reads
        const executions = await ctx.db
          .query("workflowExecutions")
          .withIndex("by_workflow", (q) => q.eq("workflowId", workflow._id))
          .take(50);

        const successCount = executions.filter(e => e.status === "completed").length;
        const failedCount = executions.filter(e => e.status === "failed").length;

        return {
          ...workflow,
          creator,
          executionStats: {
            total: executions.length,
            success: successCount,
            failed: failedCount,
          },
        };
      })
    );

    return workflowsWithDetails;
  },
});

/**
 * Get a single workflow with full details
 */
export const getWorkflow = query({
  args: {
    workflowId: v.id("workflows"),
  },
  returns: v.union(v.record(v.string(), v.any()), v.null()),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return null;

    const workflow = await ctx.db.get(args.workflowId);
    if (!workflow) return null;

    const creator = await ctx.db.get(workflow.createdBy);

    // Get recent executions
    const executions = await ctx.db
      .query("workflowExecutions")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .order("desc")
      .take(10);

    const executionsWithDetails = await Promise.all(
      executions.map(async (execution) => {
        const triggeredBy = await ctx.db.get(execution.triggeredBy);
        return {
          ...execution,
          triggeredBy,
        };
      })
    );

    return {
      ...workflow,
      creator,
      recentExecutions: executionsWithDetails,
    };
  },
});

/**
 * Get workflow executions
 */
export const getWorkflowExecutions = query({
  args: {
    workflowId: v.id("workflows"),
    status: v.optional(v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
    )),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.record(v.string(), v.any())),
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const { status } = args;
    const executionsQuery =
      status !== undefined
        ? ctx.db
            .query("workflowExecutions")
            .withIndex("by_status", (q) => q.eq("status", status))
            .filter((q) => q.eq(q.field("workflowId"), args.workflowId))
        : ctx.db
            .query("workflowExecutions")
            .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId));

    const executions = await executionsQuery
      .order("desc")
      .take(args.limit ?? 20);

    const executionsWithDetails = await Promise.all(
      executions.map(async (execution) => {
        const triggeredBy = await ctx.db.get(execution.triggeredBy);
        return {
          ...execution,
          triggeredBy,
        };
      })
    );

    return executionsWithDetails;
  },
});

/**
 * Studio data binding — fetch live data from database or documents features
 * for use in block widgets (tableBlock, listBlock, kanbanBlock, etc.).
 *
 * featureId: "database" → returns rows from a dbTable (resourceId = dbTables ID)
 * featureId: "docs"     → returns documents in the workspace (resourceId ignored / "all")
 */
export const getStudioDataBinding = query({
  args: {
    workspaceId: v.id("workspaces"),
    featureId: v.union(v.literal("database"), v.literal("docs")),
    resourceId: v.string(),
  },
  returns: v.object({
    records: v.array(v.any()),
    meta: v.object({
      featureId: v.string(),
      resourceId: v.string(),
      count: v.number(),
    }),
  }),
  handler: async (ctx, { workspaceId, featureId, resourceId }) => {
    const empty = { records: [], meta: { featureId, resourceId, count: 0 } };

    const userId = await getExistingUserId(ctx);
    if (!userId) return empty;

    const allowed = await hasWorkspaceAccess(ctx, workspaceId, userId);
    if (!allowed) return empty;

    if (featureId === "database") {
      // resourceId is the string form of a dbTables ID
      const table = await ctx.db
        .query("dbTables")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .filter((q) => q.eq(q.field("_id"), resourceId))
        .first();
      if (!table) return empty;

      const rows = await ctx.db
        .query("dbRows")
        .withIndex("by_table", (q) => q.eq("tableId", table._id))
        .take(100);

      return {
        records: rows,
        meta: { featureId, resourceId, count: rows.length },
      };
    }

    if (featureId === "docs") {
      const docs = await ctx.db
        .query("documents")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .take(100);

      return {
        records: docs,
        meta: { featureId, resourceId, count: docs.length },
      };
    }

    return empty;
  },
});
