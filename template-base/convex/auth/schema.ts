/**
 * Auth/RBAC schema — backfilled from superspace's
 * convex/auth/api/schema.ts to match what the kitab's RBAC + workspace
 * helpers reference. Composed into root via `convex/schema.ts`.
 *
 * Tables:
 * - workspaceMemberships: per-workspace user role binding (RBAC).
 * - roles: workspace-scoped role definitions + permission set.
 * - adminUsers: legacy admin/staff registry; kept optional during port.
 *
 * NOTE: clerkId fields are retained as optional for parity with
 * superspace, but the kitab's auth path (@convex-dev/auth) doesn't use
 * them. Future cleanup can drop them without affecting the kitab.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

const workspaceMemberships = defineTable({
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  roleId: v.id("roles"),
  themePreset: v.optional(v.string()),
  roleLevel: v.optional(v.number()),
  additionalPermissions: v.array(v.string()),
  status: v.string(),
  joinedAt: v.number(),
  invitedBy: v.optional(v.id("users")),
  lastActiveAt: v.optional(v.number()),
  createdBy: v.optional(v.id("users")),
  updatedBy: v.optional(v.id("users")),
})
  .index("by_user", ["userId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_user", ["workspaceId", "userId"])
  .index("by_user_workspace", ["userId", "workspaceId"])
  .index("by_status", ["status"])
  .index("by_role", ["roleId"]);

const roles = defineTable({
  name: v.string(),
  slug: v.optional(v.string()),
  description: v.optional(v.union(v.string(), v.null())),
  workspaceId: v.id("workspaces"),
  level: v.optional(v.number()),
  permissions: v.array(v.string()),
  color: v.optional(v.string()),
  isDefault: v.boolean(),
  isSystemRole: v.optional(v.boolean()),
  isSystem: v.optional(v.boolean()),
  icon: v.optional(v.string()),
  createdBy: v.optional(v.union(v.id("users"), v.null())),
  updatedBy: v.optional(v.union(v.id("users"), v.null())),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_slug", ["workspaceId", "slug"]);

const adminUsers = defineTable({
  clerkId: v.string(),
  email: v.string(),
  name: v.string(),
  roleLevel: v.number(),
  permissions: v.array(v.string()),
  status: v.string(),
  lastLoginAt: v.optional(v.union(v.number(), v.null())),
  workspaceIds: v.array(v.string()),
  createdBy: v.optional(v.union(v.string(), v.null())),
  updatedBy: v.optional(v.union(v.string(), v.null())),
})
  .index("by_clerk_id", ["clerkId"])
  .index("by_email", ["email"]);

export const authRbacTables = {
  workspaceMemberships,
  roles,
  adminUsers,
  // `workspaces` is owned by notion's schema (with the minimal shape the
  // notion port relies on). Don't redefine here — would collide at root.
};
