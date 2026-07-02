/**
 * User Management Schema
 * 
 * Provides tables for unified user management including:
 * - User Teams: Grouping users for batch operations
 * - Team Memberships: User-team associations
 * - Hierarchy Invitations: Bulk invitation tracking
 * 
 * @module convex/features/userManagement/api/schema
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * User Teams - Groups of users for batch operations
 * e.g., "Marketing Team", "Development Team"
 */
export const userTeams = defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  workspaceId: v.id("workspaces"),
  color: v.optional(v.string()),
  icon: v.optional(v.string()),
  createdBy: v.id("users"),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_slug", ["workspaceId", "slug"])
  .index("by_creator", ["createdBy"]);

/**
 * Team Memberships - User-team associations
 */
export const teamMemberships = defineTable({
  teamId: v.id("userTeams"),
  userId: v.id("users"),
  role: v.union(
    v.literal("leader"),
    v.literal("member"),
  ),
  joinedAt: v.number(),
  addedBy: v.optional(v.id("users")),
})
  .index("by_team", ["teamId"])
  .index("by_user", ["userId"])
  .index("by_team_user", ["teamId", "userId"]);

/**
 * Hierarchy Invitations - Track bulk invitation operations
 * Records invitation batches to workspace hierarchies
 */
export const hierarchyInvitations = defineTable({
  // Source workspace (parent of hierarchy)
  sourceWorkspaceId: v.id("workspaces"),
  // Inviter user
  inviterId: v.id("users"),
  // Invitee (user ID if existing, email if new)
  inviteeEmail: v.string(),
  inviteeId: v.optional(v.id("users")),
  // Role propagation strategy
  propagationStrategy: v.union(
    v.literal("same"),       // Same role for all workspaces
    v.literal("per_level"),  // Different role per workspace (stored in roleMapping)
    v.literal("decreasing"), // Role level decreases in children
  ),
  // Base role (for 'same' and 'decreasing' strategies)
  baseRoleId: v.optional(v.id("roles")),
  // Role mapping per workspace (for 'per_level' strategy)
  // Stored as JSON string: { [workspaceId]: roleId }
  roleMapping: v.optional(v.string()),
  // Target workspace IDs in this invitation batch
  targetWorkspaceIds: v.array(v.id("workspaces")),
  // Status tracking
  status: v.union(
    v.literal("pending"),
    v.literal("partial"),  // Some accepted, some pending
    v.literal("completed"),
    v.literal("cancelled"),
  ),
  // Invitation results per workspace (JSON string)
  // { [workspaceId]: { status: 'pending' | 'accepted' | 'declined', invitationId?: string } }
  resultMapping: v.optional(v.string()),
  // Timestamps
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
  message: v.optional(v.string()),
})
  .index("by_source", ["sourceWorkspaceId"])
  .index("by_inviter", ["inviterId"])
  .index("by_invitee_email", ["inviteeEmail"])
  .index("by_invitee_id", ["inviteeId"])
  .index("by_status", ["status"]);

/**
 * Role Hierarchy Links - Parent-child role relationships
 * Enables nested role inheritance (child inherits parent constraints)
 */
export const roleHierarchyLinks = defineTable({
  parentRoleId: v.id("roles"),
  childRoleId: v.id("roles"),
  workspaceId: v.id("workspaces"),
  // Inheritance mode
  inheritanceMode: v.union(
    v.literal("full"),      // Child inherits all parent permissions
    v.literal("restrict"),  // Child can only have subset of parent permissions
    v.literal("extend"),    // Child can add to parent permissions
  ),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_parent", ["parentRoleId"])
  .index("by_child", ["childRoleId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_parent_child", ["parentRoleId", "childRoleId"]);

export const userManagementTables = {
  userTeams,
  teamMemberships,
  hierarchyInvitations,
  roleHierarchyLinks,
};
