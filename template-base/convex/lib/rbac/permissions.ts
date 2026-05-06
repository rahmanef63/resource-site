/**
 * RBAC Permission Helpers
 *
 * Provides utility functions for checking permissions in Convex mutations
 * and actions. This enforces workspace-level RBAC as required by project
 * guardrails.
 *
 * USAGE:
 * ```typescript
 * // In your mutation/action
 * await requirePermission(ctx, workspaceId, "feature.action");
 * ```
 *
 * @see docs/RBAC_GUIDE.md for permission strings
 * @see .claude/CLAUDE.md for project guardrails
 */

import { MutationCtx, QueryCtx, ActionCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * Permission string format: "feature.action"
 *
 * Examples:
 * - "database.create" - Create new database
 * - "database.read" - Read database
 * - "database.update" - Update database
 * - "database.delete" - Delete database
 * - "database.manage" - Full database management
 */
export type Permission = string;

/**
 * Check if user has permission in workspace (non-throwing version)
 *
 * @param ctx - Convex context (MutationCtx or QueryCtx only, not ActionCtx)
 * @param workspaceId - Workspace to check permission in
 * @param permission - Permission string (e.g., "database.create")
 * @returns true if user has permission, false otherwise
 *
 * @example
 * ```typescript
 * const canCreate = await checkPermission(ctx, workspaceId, "database.create");
 * if (!canCreate) {
 *   return { error: "You don't have permission to create databases" };
 * }
 * ```
 */
export async function checkPermission(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">,
  permission: Permission
): Promise<boolean> {
  try {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_subject", (q: any) => q.eq("authSubject", identity.subject))
      .first();

    if (!user) {
      return false;
    }

    // Get workspace membership
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q: any) =>
        q.eq("userId", user._id).eq("workspaceId", workspaceId)
      )
      .first();

    if (!membership) {
      return false;
    }

    // Get role
    const role = await ctx.db.get(membership.roleId);
    if (!role) {
      return false;
    }

    // Check if role has the permission
    // Permissions are stored as an array of strings in the role
    if (!role.permissions || !Array.isArray(role.permissions)) {
      return false;
    }

    // Check for exact permission or wildcard
    const hasPermission = role.permissions.some((p: string) => {
      // Exact match
      if (p === permission) return true;

      // Wildcard match (e.g., "database.*" matches "database.create")
      if (p.endsWith(".*")) {
        const prefix = p.slice(0, -2);
        return permission.startsWith(prefix + ".");
      }

      // Super admin wildcard
      if (p === "*") return true;

      return false;
    });

    return hasPermission;
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

/**
 * Require permission (throwing version)
 *
 * Throws an error if user doesn't have the required permission.
 * This should be used at the start of every mutation/query.
 *
 * @param ctx - Convex context (MutationCtx or QueryCtx only, not ActionCtx)
 * @param workspaceId - Workspace to check permission in
 * @param permission - Permission string (e.g., "database.create")
 * @throws Error if user doesn't have permission
 *
 * @example
 * ```typescript
 * export const createDatabase = mutation({
 *   args: { workspaceId: v.id("workspaces"), ... },
 *   handler: async (ctx, args) => {
 *     // MUST be first line
 *     await requirePermission(ctx, args.workspaceId, "database.create");
 *
 *     // ... rest of mutation logic
 *   },
 * });
 * ```
 */
export async function requirePermission(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">,
  permission: Permission
): Promise<void> {
  const hasPermission = await checkPermission(ctx, workspaceId, permission);

  if (!hasPermission) {
    throw new Error(
      `Permission denied: You don't have '${permission}' permission in this workspace`
    );
  }
}

/**
 * Check if user is workspace admin
 *
 * Convenience function to check if user has admin role
 *
 * @param ctx - Convex context (MutationCtx or QueryCtx only, not ActionCtx)
 * @param workspaceId - Workspace to check
 * @returns true if user is admin
 */
export async function isWorkspaceAdmin(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">
): Promise<boolean> {
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_subject", (q: any) => q.eq("authSubject", identity.subject))
      .first();

    if (!user) return false;

    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q: any) =>
        q.eq("userId", user._id).eq("workspaceId", workspaceId)
      )
      .first();

    if (!membership) return false;

    const role = await ctx.db.get(membership.roleId);
    if (!role) return false;

    // Check if role is admin (either by slug or has all permissions)
    return (
      role.slug === "admin" ||
      role.slug === "owner" ||
      (role.permissions && role.permissions.includes("*"))
    );
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
}

/**
 * Check if user is workspace owner
 *
 * @param ctx - Convex context (MutationCtx or QueryCtx only, not ActionCtx)
 * @param workspaceId - Workspace to check
 * @returns true if user is owner
 */
export async function isWorkspaceOwner(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">
): Promise<boolean> {
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_subject", (q: any) => q.eq("authSubject", identity.subject))
      .first();

    if (!user) return false;

    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) return false;

    return workspace.createdBy === user._id;
  } catch (error) {
    console.error("Owner check error:", error);
    return false;
  }
}

/**
 * Get user permissions in workspace
 *
 * Returns list of all permissions user has in the workspace
 *
 * @param ctx - Convex context (MutationCtx or QueryCtx only, not ActionCtx)
 * @param workspaceId - Workspace to check
 * @returns Array of permission strings
 */
export async function getUserPermissions(
  ctx: MutationCtx | QueryCtx,
  workspaceId: Id<"workspaces">
): Promise<Permission[]> {
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_subject", (q: any) => q.eq("authSubject", identity.subject))
      .first();

    if (!user) return [];

    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q: any) =>
        q.eq("userId", user._id).eq("workspaceId", workspaceId)
      )
      .first();

    if (!membership) return [];

    const role = await ctx.db.get(membership.roleId);
    if (!role) return [];

    return (role.permissions || []) as Permission[];
  } catch (error) {
    console.error("Get permissions error:", error);
    return [];
  }
}

/**
 * Common Permission Constants
 *
 * Use these constants instead of hardcoding permission strings
 */
export const PERMISSIONS = {
  // Database permissions
  DATABASE: {
    CREATE: "database.create",
    READ: "database.read",
    UPDATE: "database.update",
    DELETE: "database.delete",
    MANAGE: "database.manage",
  },

  // Document permissions
  DOCUMENTS: {
    CREATE: "documents.create",
    READ: "documents.read",
    UPDATE: "documents.update",
    DELETE: "documents.delete",
    PUBLISH: "documents.publish",
  },

  // Chat permissions
  CHAT: {
    CREATE: "chat.create",
    READ: "chat.read",
    DELETE: "chat.delete",
    MANAGE: "chat.manage",
  },

  // Workspace permissions
  WORKSPACE: {
    READ: "workspace.read",
    UPDATE: "workspace.update",
    DELETE: "workspace.delete",
    MANAGE_MEMBERS: "workspace.manage_members",
    MANAGE_ROLES: "workspace.manage_roles",
    MANAGE: "workspace.manage",
  },

  // Admin wildcard
  ADMIN: "*",
} as const;

/**
 * TESTING NOTES:
 *
 * When writing tests for mutations using these permission helpers:
 *
 * 1. Test without authentication (should fail)
 * 2. Test with user but no workspace membership (should fail)
 * 3. Test with membership but no permission (should fail)
 * 4. Test with correct permission (should succeed)
 * 5. Test with wildcard permission (should succeed)
 * 6. Test with admin/owner (should succeed)
 *
 * Example:
 * ```typescript
 * test("requirePermission rejects without permission", async () => {
 *   await expect(
 *     mutation(ctx, { workspaceId, permission: "database.create" })
 *   ).rejects.toThrow("Permission denied");
 * });
 * ```
 */
