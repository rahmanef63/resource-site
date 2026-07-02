import { query, mutation } from "../../../_generated/server";
import { api } from "../../../_generated/api";
import { v } from "convex/values";
import { ensureUser, resolveCandidateUserIds } from "../../../auth/helpers";

/**
 * Workspace Context API
 * 
 * Manages AI-consumable context information for workspaces.
 */

/**
 * Get workspace context
 */
export const getWorkspaceContext = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) return null;

    // Check workspace access
    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) return null;

    // Check if user has access to workspace
    let hasAccess = false;
    for (const idStr of candidateIds) {
      const membership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q) =>
          q.eq("userId", idStr as any).eq("workspaceId", workspaceId)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .unique();
      if (membership) {
        hasAccess = true;
        break;
      }
    }

    // Allow creator access
    if (!hasAccess && candidateIds.includes(String(workspace.createdBy))) {
      hasAccess = true;
    }

    if (!hasAccess) return null;

    // Get workspace context
    const context = await ctx.db
      .query("workspaceContext")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .unique();

    return context ?? {
      workspaceId,
      teamOverview: "",
      projectContext: "",
      goalsObjectives: "",
      skills: "",
      processes: "",
      tools: "",
      communication: "",
    };
  },
});

/**
 * Update workspace context
 */
export const updateWorkspaceContext = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    teamOverview: v.optional(v.string()),
    projectContext: v.optional(v.string()),
    goalsObjectives: v.optional(v.string()),
    skills: v.optional(v.string()),
    processes: v.optional(v.string()),
    tools: v.optional(v.string()),
    communication: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const { workspaceId, ...updates } = args;

    // Check workspace access
    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Check if user has membership
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", workspaceId)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    const isCreator = workspace.createdBy === userId;
    if (!membership && !isCreator) {
      throw new Error("Not authorized to update workspace context");
    }

    // Get existing context
    const existing = await ctx.db
      .query("workspaceContext")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .unique();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedBy: userId,
        updatedAt: Date.now(),
      });
    }

    let idToReturn = existing ? existing._id : null;
    if (!existing) {
      // Create new
      idToReturn = await ctx.db.insert("workspaceContext", {
        workspaceId,
        ...updates,
        createdBy: userId,
        updatedAt: Date.now(),
      });
    }

    const formattedContent = [
      updates.teamOverview ? `## Team Overview\n${updates.teamOverview}` : "",
      updates.projectContext ? `## Project Context\n${updates.projectContext}` : "",
      updates.goalsObjectives ? `## Goals & Objectives\n${updates.goalsObjectives}` : "",
      updates.skills ? `## Skills & Expertise\n${updates.skills}` : "",
      updates.processes ? `## Processes & Workflows\n${updates.processes}` : "",
      updates.tools ? `## Tools & Technologies\n${updates.tools}` : "",
      updates.communication ? `## Communication Preferences\n${updates.communication}` : ""
    ].filter(Boolean).join("\n\n");

    await ctx.scheduler.runAfter(0, api.features.ai.actions.syncToKnowledgeBase, {
      workspaceId,
      sourceType: "workspaceContext",
      sourceId: workspaceId,
      title: "Workspace Context",
      content: formattedContent,
    });
    return idToReturn;
  },
});

/**
 * Get all workspace context for AI consumption
 * Returns a formatted string suitable for AI context injection
 */
export const getWorkspaceContextForAI = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) return null;

    // Check workspace access
    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) return null;

    // Check if user has access
    let hasAccess = false;
    for (const idStr of candidateIds) {
      const membership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user_workspace", (q) =>
          q.eq("userId", idStr as any).eq("workspaceId", workspaceId)
        )
        .filter((q) => q.eq(q.field("status"), "active"))
        .unique();
      if (membership) {
        hasAccess = true;
        break;
      }
    }

    if (!hasAccess && !candidateIds.includes(String(workspace.createdBy))) {
      return null;
    }

    // Get context
    const context = await ctx.db
      .query("workspaceContext")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .unique();

    if (!context) return null;

    // Format for AI consumption
    const sections: string[] = [];

    if (context.teamOverview) {
      sections.push(`## Team Overview\n${context.teamOverview}`);
    }
    if (context.projectContext) {
      sections.push(`## Project Context\n${context.projectContext}`);
    }
    if (context.goalsObjectives) {
      sections.push(`## Goals & Objectives\n${context.goalsObjectives}`);
    }
    if (context.skills) {
      sections.push(`## Skills & Expertise\n${context.skills}`);
    }
    if (context.processes) {
      sections.push(`## Processes & Workflows\n${context.processes}`);
    }
    if (context.tools) {
      sections.push(`## Tools & Technologies\n${context.tools}`);
    }
    if (context.communication) {
      sections.push(`## Communication Preferences\n${context.communication}`);
    }

    return sections.length > 0
      ? `# Workspace Context: ${workspace.name}\n\n${sections.join('\n\n')}`
      : null;
  },
});
