import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Workspace Context Table
 * 
 * Stores AI-consumable context information about a workspace.
 * This data is used to help AI understand the workspace's:
 * - Team structure and expertise
 * - Project context and goals
 * - Communication preferences
 * - Tools and processes
 */
export const workspaceContext = defineTable({
  workspaceId: v.id("workspaces"),
  
  // Team information
  teamOverview: v.optional(v.string()),
  
  // Project context
  projectContext: v.optional(v.string()),
  
  // Goals and objectives
  goalsObjectives: v.optional(v.string()),
  
  // Skills and expertise
  skills: v.optional(v.string()),
  
  // Processes and workflows
  processes: v.optional(v.string()),
  
  // Tools and technologies
  tools: v.optional(v.string()),
  
  // Communication preferences
  communication: v.optional(v.string()),
  
  // Metadata
  createdBy: v.id("users"),
  updatedBy: v.optional(v.id("users")),
  updatedAt: v.optional(v.number()),
}).index("by_workspace", ["workspaceId"]);

export const knowledgeTables = {
  workspaceContext,
};
