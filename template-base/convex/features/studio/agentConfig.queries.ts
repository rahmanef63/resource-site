/**
 * Studio Agent Config — Convex Queries
 *
 * Read operations for agent configuration, instruction versions,
 * Train Mode feedback, and visual validation results.
 */

import { v } from "convex/values";
import { query } from "../../_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// getAgentConfig — get a single agent config with its active instruction version
// ─────────────────────────────────────────────────────────────────────────────

export const getAgentConfig = query({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      return null;
    }

    // Fetch active instruction version
    const activeInstruction = await ctx.db
      .query("studioInstructionVersions")
      .withIndex("by_agent_active", (q) =>
        q.eq("agentConfigId", args.agentConfigId).eq("isActive", true)
      )
      .first();

    return {
      ...config,
      activeInstruction: activeInstruction ?? null,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// listAgentConfigs — list all agent configs for a workspace or project
// ─────────────────────────────────────────────────────────────────────────────

export const listAgentConfigs = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.string()),
    featureId: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("studioAgentConfigs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const configs = await q.take(200);

    return configs.filter((c) => {
      if (!args.includeArchived && c.status === "archived") return false;
      if (args.projectId !== undefined && c.projectId !== args.projectId) return false;
      if (args.featureId !== undefined && c.featureId !== args.featureId) return false;
      return true;
    });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// getInstructionHistory — full version history for an agent
// ─────────────────────────────────────────────────────────────────────────────

export const getInstructionHistory = query({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      return [];
    }

    const versions = await ctx.db
      .query("studioInstructionVersions")
      .withIndex("by_agent", (q) => q.eq("agentConfigId", args.agentConfigId))
      .order("desc")
      .take(args.limit ?? 50);

    return versions;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// getTrainFeedback — paginated feedback entries for an agent
// ─────────────────────────────────────────────────────────────────────────────

export const getTrainFeedback = query({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
    feedbackType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      return [];
    }

    let entries;
    if (args.feedbackType) {
      entries = await ctx.db
        .query("studioTrainFeedback")
        .withIndex("by_agent_type", (q) =>
          q.eq("agentConfigId", args.agentConfigId).eq("feedbackType", args.feedbackType!)
        )
        .order("desc")
        .take(args.limit ?? 100);
    } else {
      entries = await ctx.db
        .query("studioTrainFeedback")
        .withIndex("by_agent", (q) => q.eq("agentConfigId", args.agentConfigId))
        .order("desc")
        .take(args.limit ?? 100);
    }

    return entries;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// getLatestVisualCheck — most recent visual validation result
// ─────────────────────────────────────────────────────────────────────────────

export const getLatestVisualCheck = query({
  args: {
    agentConfigId: v.id("studioAgentConfigs"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db.get(args.agentConfigId);
    if (!config || config.workspaceId !== args.workspaceId) {
      return null;
    }

    return ctx.db
      .query("studioVisualChecks")
      .withIndex("by_agent", (q) => q.eq("agentConfigId", args.agentConfigId))
      .order("desc")
      .first();
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// listUIDocuments — list UI documents for a workspace or project
// ─────────────────────────────────────────────────────────────────────────────

export const listUIDocuments = query({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.string()),
    templatesOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let docs;
    if (args.templatesOnly) {
      docs = await ctx.db
        .query("studioUIDocuments")
        .withIndex("by_template", (q) => q.eq("isTemplate", true))
        .take(args.limit ?? 50);
    } else {
      docs = await ctx.db
        .query("studioUIDocuments")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .order("desc")
        .take(args.limit ?? 50);
    }

    return docs.filter((d) => {
      if (d.workspaceId !== args.workspaceId && !args.templatesOnly) return false;
      if (args.projectId !== undefined && d.projectId !== args.projectId) return false;
      if (d.status === "archived") return false;
      return true;
    });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// getUIDocument — get a single UI document with parsed content
// ─────────────────────────────────────────────────────────────────────────────

export const getUIDocument = query({
  args: {
    documentId: v.id("studioUIDocuments"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc || (doc.workspaceId !== args.workspaceId && !doc.isTemplate)) {
      return null;
    }
    return doc;
  },
});
