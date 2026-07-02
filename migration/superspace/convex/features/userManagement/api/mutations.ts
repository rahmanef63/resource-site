/**
 * User Management Mutations
 * 
 * Orchestration mutations for unified user management:
 * - inviteToHierarchy: Bulk invite to workspace + children
 * - bulkInviteContacts: Quick invite multiple Contacts
 * - Team management mutations
 * 
 * @module convex/features/user-management/api/mutations
 */

import { v } from "convex/values";
import { mutation } from "../../../_generated/server";
import { ensureUser, requirePermission, hasPermission, requireActiveMembership } from "../../../auth/helpers";
import type { Id } from "../../../_generated/dataModel";
import { PERMS } from "../../../workspace/permissions";
import { logAuditEvent } from "../../../shared/audit";

/**
 * Role propagation strategies
 */
const ROLE_LEVEL_DECREASE = 10; // Level increase per hierarchy depth (lower level = more power)

/**
 * Invite user to workspace hierarchy
 * Invites a user to a parent workspace and optionally all children
 */
export const inviteToHierarchy = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    inviteeEmail: v.string(),
    baseRoleId: v.id("roles"),
    propagateToChildren: v.boolean(),
    propagationStrategy: v.union(
      v.literal("same"),
      v.literal("decreasing"),
    ),
    maxDepth: v.optional(v.number()),
    message: v.optional(v.string()),
    specificWorkspaceIds: v.optional(v.array(v.id("workspaces"))), // New arg for custom mode
  },
  handler: async (ctx, args) => {
    const inviterId = await ensureUser(ctx);
    if (!inviterId) throw new Error("Not authenticated");

    // Verify permission on source workspace
    await requirePermission(ctx, args.workspaceId, PERMS.INVITE_MEMBERS);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const baseRole = await ctx.db.get(args.baseRoleId);
    if (!baseRole) throw new Error("Role not found");

    // Capture slug for use in nested function (TypeScript narrowing workaround)
    const baseRoleSlug = baseRole.slug;
    const baseRoleLevel = baseRole.level ?? 0;

    const maxDepth = args.maxDepth ?? 3;
    const targetWorkspaceIds: Id<"workspaces">[] = [args.workspaceId];
    const roleMap = new Map<string, Id<"roles">>();
    roleMap.set(String(args.workspaceId), args.baseRoleId);

    // Customize target collection
    if (args.specificWorkspaceIds) {
      // CUSTOM MODE: specific workspaces only
      // We assume "same" strategy (role equivalence by slug) for simplicity or respect "same" from args.
      // We don't support "decreasing" for arbitrary specific IDs easily without knowing depth.
      // So we'll try to find equivalent role in each specific workspace.

      // Reset targets to just the specific ones (ensure unique)
      const uniqueIds = Array.from(new Set(args.specificWorkspaceIds));
      // Clear the default start (unless it's in the list)
      targetWorkspaceIds.length = 0;
      uniqueIds.forEach(id => targetWorkspaceIds.push(id));

      for (const wsId of targetWorkspaceIds) {
        if (roleMap.has(String(wsId))) continue; // Already set (e.g. source workspace)

        // Find equivalent role
        const equivalentRole = await ctx.db
          .query("roles")
          .withIndex("by_workspace_slug", (q) => q.eq("workspaceId", wsId).eq("slug", baseRoleSlug))
          .first();

        if (equivalentRole) {
          roleMap.set(String(wsId), equivalentRole._id);
        } else {
          // Fallback to default
          const defaultRole = await ctx.db
            .query("roles")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", wsId))
            .filter((q) => q.eq(q.field("isDefault"), true))
            .first();
          if (defaultRole) {
            roleMap.set(String(wsId), defaultRole._id);
          }
        }
      }

    } else if (args.propagateToChildren) {
      async function collectChildren(wsId: Id<"workspaces">, depth: number, parentRoleLevel: number) {
        if (depth >= maxDepth) return;

        const children = await ctx.db
          .query("workspaces")
          .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", wsId))
          .take(1000);

        for (const child of children) {
          targetWorkspaceIds.push(child._id);

          // Determine role for this child based on strategy
          if (args.propagationStrategy === "same") {
            // Use same role if it exists in child workspace, otherwise find equivalent
            const childRole = await ctx.db
              .query("roles")
              .withIndex("by_workspace_slug", (q) => q.eq("workspaceId", child._id).eq("slug", baseRoleSlug))
              .first();

            if (childRole) {
              roleMap.set(String(child._id), childRole._id);
            } else {
              // Fall back to default role
              const defaultRole = await ctx.db
                .query("roles")
                .withIndex("by_workspace", (q) => q.eq("workspaceId", child._id))
                .filter((q) => q.eq(q.field("isDefault"), true))
                .first();
              if (defaultRole) {
                roleMap.set(String(child._id), defaultRole._id);
              }
            }
          } else if (args.propagationStrategy === "decreasing") {
            // Find role with lower privilege (higher level number)
            const targetLevel = parentRoleLevel + ROLE_LEVEL_DECREASE;
            const childRoles = await ctx.db
              .query("roles")
              .withIndex("by_workspace", (q) => q.eq("workspaceId", child._id))
              .take(1000);

            // Find closest role at or above target level
            const sortedRoles = childRoles.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
            const targetRole = sortedRoles.find((r) => (r.level ?? 0) >= targetLevel)
              || sortedRoles[sortedRoles.length - 1]; // Fallback to lowest privilege

            if (targetRole) {
              roleMap.set(String(child._id), targetRole._id);
              await collectChildren(child._id, depth + 1, targetRole.level ?? targetLevel);
            }
          }

          await collectChildren(child._id, depth + 1, parentRoleLevel + ROLE_LEVEL_DECREASE);
        }
      }

      await collectChildren(args.workspaceId, 0, baseRoleLevel);
    }

    // Generate unique invitation token (cryptographically secure, 32 hex chars)
    function generateToken(): string {
      return crypto.randomUUID().replace(/-/g, "");
    }

    // Check if invitee already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.inviteeEmail))
      .first();

    // Create invitations for each workspace
    const results: Array<{
      workspaceId: string;
      success: boolean;
      invitationId?: string;
      error?: string;
    }> = [];

    const workspaceResults = await Promise.all(
      targetWorkspaceIds.map(async (wsId) => {
        const roleId = roleMap.get(String(wsId));
        if (!roleId) {
          return {
            workspaceId: String(wsId),
            success: false as const,
            error: "No suitable role found",
          };
        }

        // Check if already a member
        if (existingUser) {
          const existingMembership = await ctx.db
            .query("workspaceMemberships")
            .withIndex("by_user_workspace", (q) =>
              q.eq("userId", existingUser._id).eq("workspaceId", wsId)
            )
            .first();

          if (existingMembership && existingMembership.status === "active") {
            return {
              workspaceId: String(wsId),
              success: false as const,
              error: "Already a member",
            };
          }
        }

        // Check for existing pending invitation
        const existingInvitation = await ctx.db
          .query("invitations")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", wsId))
          .filter((q) =>
            q.and(
              q.eq(q.field("inviteeEmail"), args.inviteeEmail),
              q.eq(q.field("status"), "pending")
            )
          )
          .first();

        if (existingInvitation) {
          return {
            workspaceId: String(wsId),
            success: false as const,
            error: "Invitation already pending",
          };
        }

        // Create invitation (independent per workspace — safe to parallelize)
        const invitationId = await ctx.db.insert("invitations", {
          type: "workspace",
          workspaceId: wsId,
          inviterId,
          inviteeEmail: args.inviteeEmail,
          inviteeId: existingUser?._id,
          roleId,
          status: "pending",
          message: args.message,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          token: generateToken(),
        });

        return {
          workspaceId: String(wsId),
          success: true as const,
          invitationId: String(invitationId),
        };
      })
    );
    results.push(...workspaceResults);

    // Create hierarchy invitation record for tracking
    const hierarchyInvitationId = await ctx.db.insert("hierarchyInvitations", {
      sourceWorkspaceId: args.workspaceId,
      inviterId,
      inviteeEmail: args.inviteeEmail,
      inviteeId: existingUser?._id,
      propagationStrategy: args.propagationStrategy,
      baseRoleId: args.baseRoleId,
      targetWorkspaceIds,
      status: results.every((r) => r.success) ? "pending" : "partial",
      resultMapping: JSON.stringify(
        Object.fromEntries(
          results.map((r) => [
            r.workspaceId,
            { status: r.success ? "pending" : "failed", invitationId: r.invitationId, error: r.error },
          ])
        )
      ),
      createdAt: Date.now(),
      message: args.message,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: inviterId,
      action: "user.invite_hierarchy",
      resourceType: "hierarchyInvitation",
      resourceId: hierarchyInvitationId,
      metadata: {
        inviteeEmail: args.inviteeEmail,
        workspaceCount: targetWorkspaceIds.length,
        successCount: results.filter((r) => r.success).length
      },
    });

    return {
      hierarchyInvitationId,
      results,
      totalWorkspaces: targetWorkspaceIds.length,
      successCount: results.filter((r) => r.success).length,
    };
  },
});

/**
 * Bulk invite Contacts to workspace
 * Quick invite multiple Contacts to a workspace at once
 */
export const bulkInviteContacts = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    ContactIds: v.array(v.id("users")),
    roleId: v.id("roles"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inviterId = await ensureUser(ctx);
    if (!inviterId) throw new Error("Not authenticated");

    // Verify permission
    await requirePermission(ctx, args.workspaceId, PERMS.INVITE_MEMBERS);

    const results: Array<{
      ContactId: string;
      success: boolean;
      invitationId?: string;
      error?: string;
    }> = [];

    // Verify Contactship for each Contact
    const contactResults = await Promise.all(
      args.ContactIds.map(async (ContactId) => {
        // Check if they are actually Contacts (both directions checked in parallel)
        const [Contactship1, Contactship2] = await Promise.all([
          ctx.db
            .query("socialContacts")
            .withIndex("by_users", (q) => q.eq("user1Id", inviterId).eq("user2Id", ContactId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .first(),
          ctx.db
            .query("socialContacts")
            .withIndex("by_users", (q) => q.eq("user1Id", ContactId).eq("user2Id", inviterId))
            .filter((q) => q.eq(q.field("status"), "active"))
            .first(),
        ]);

        if (!Contactship1 && !Contactship2) {
          return {
            ContactId: String(ContactId),
            success: false as const,
            error: "Not a Contact",
          };
        }

        // Get Contact's email + membership + existing invitation in parallel
        const [Contact, existingMembership, existingInvitation] = await Promise.all([
          ctx.db.get(ContactId),
          ctx.db
            .query("workspaceMemberships")
            .withIndex("by_user_workspace", (q) =>
              q.eq("userId", ContactId).eq("workspaceId", args.workspaceId)
            )
            .first(),
          ctx.db
            .query("invitations")
            .withIndex("by_invitee_id", (q) => q.eq("inviteeId", ContactId))
            .filter((q) =>
              q.and(
                q.eq(q.field("workspaceId"), args.workspaceId),
                q.eq(q.field("status"), "pending")
              )
            )
            .first(),
        ]);

        if (!Contact) {
          return {
            ContactId: String(ContactId),
            success: false as const,
            error: "User not found",
          };
        }

        if (existingMembership && existingMembership.status === "active") {
          return {
            ContactId: String(ContactId),
            success: false as const,
            error: "Already a member",
          };
        }

        if (existingInvitation) {
          return {
            ContactId: String(ContactId),
            success: false as const,
            error: "Invitation already pending",
          };
        }

        // Generate token (cryptographically secure)
        const token = crypto.randomUUID().replace(/-/g, "");

        // Create invitation (independent per Contact — safe to parallelize)
        const invitationId = await ctx.db.insert("invitations", {
          type: "workspace",
          workspaceId: args.workspaceId,
          inviterId,
          inviteeEmail: Contact.email,
          inviteeId: ContactId,
          roleId: args.roleId,
          status: "pending",
          message: args.message,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          token,
        });

        return {
          ContactId: String(ContactId),
          success: true as const,
          invitationId: String(invitationId),
        };
      })
    );
    results.push(...contactResults);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: inviterId,
      action: "user.bulk_invite",
      resourceType: "workspace",
      resourceId: args.workspaceId,
      metadata: {
        inviteCount: args.ContactIds.length,
        successCount: results.filter((r) => r.success).length
      },
    });

    return {
      results,
      totalInvites: args.ContactIds.length,
      successCount: results.filter((r) => r.success).length,
    };
  },
});

/**
 * Create a user team
 */
export const createTeam = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MEMBERS);

    // Generate slug
    const slug = args.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check for duplicate slug
    const existing = await ctx.db
      .query("userTeams")
      .withIndex("by_slug", (q) => q.eq("workspaceId", args.workspaceId).eq("slug", slug))
      .first();

    if (existing) {
      throw new Error("Team with this name already exists");
    }

    const teamId = await ctx.db.insert("userTeams", {
      name: args.name,
      slug,
      description: args.description,
      workspaceId: args.workspaceId,
      color: args.color,
      icon: args.icon,
      createdBy: userId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "team.create",
      resourceType: "userTeam",
      resourceId: teamId,
      changes: { name: args.name },
    });

    return teamId;
  },
});

/**
 * Add member to team
 */
export const addTeamMember = mutation({
  args: {
    teamId: v.id("userTeams"),
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("leader"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    await requirePermission(ctx, team.workspaceId, PERMS.MANAGE_MEMBERS);

    // Check if already a member
    const existing = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
      .first();

    if (existing) {
      throw new Error("User is already a team member");
    }

    const membershipId = await ctx.db.insert("teamMemberships", {
      teamId: args.teamId,
      userId: args.userId,
      role: args.role ?? "member",
      joinedAt: Date.now(),
      addedBy: currentUserId,
    });

    await logAuditEvent(ctx, {
      workspaceId: team.workspaceId,
      actorUserId: currentUserId,
      action: "team.add_member",
      resourceType: "userTeam",
      resourceId: args.teamId,
      metadata: { addedUserId: args.userId, role: args.role },
    });

    return membershipId;
  },
});

/**
 * Remove member from team
 */
export const removeTeamMember = mutation({
  args: {
    teamId: v.id("userTeams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    await requirePermission(ctx, team.workspaceId, PERMS.MANAGE_MEMBERS);

    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_user", (q) => q.eq("teamId", args.teamId).eq("userId", args.userId))
      .first();

    if (!membership) {
      throw new Error("User is not a team member");
    }

    await ctx.db.delete(membership._id);

    await logAuditEvent(ctx, {
      workspaceId: team.workspaceId,
      actorUserId: currentUserId,
      action: "team.remove_member",
      resourceType: "userTeam",
      resourceId: args.teamId,
      metadata: { removedUserId: args.userId },
    });

    return true;
  },
});

/**
 * Invite entire team to workspace(s)
 */
export const inviteTeamToWorkspaces = mutation({
  args: {
    teamId: v.id("userTeams"),
    workspaceIds: v.array(v.id("workspaces")),
    roleId: v.id("roles"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inviterId = await ensureUser(ctx);
    if (!inviterId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    // Get team members
    const teamMemberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .take(1000);

    const results: Array<{
      workspaceId: string;
      userId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const wsId of args.workspaceIds) {
      // Verify permission on each workspace
      try {
        await requirePermission(ctx, wsId, PERMS.INVITE_MEMBERS);
      } catch {
        for (const tm of teamMemberships) {
          results.push({
            workspaceId: String(wsId),
            userId: String(tm.userId),
            success: false,
            error: "No permission to invite to this workspace",
          });
        }
        continue;
      }

      // Team members within a workspace are independent — parallelize
      const memberResults = await Promise.all(
        teamMemberships.map(async (tm) => {
          const [user, existingMembership] = await Promise.all([
            ctx.db.get(tm.userId),
            ctx.db
              .query("workspaceMemberships")
              .withIndex("by_user_workspace", (q) =>
                q.eq("userId", tm.userId).eq("workspaceId", wsId)
              )
              .first(),
          ]);

          if (!user) return null;

          if (existingMembership && existingMembership.status === "active") {
            return {
              workspaceId: String(wsId),
              userId: String(tm.userId),
              success: false as const,
              error: "Already a member",
            };
          }

          // Generate token (cryptographically secure)
          const token = crypto.randomUUID().replace(/-/g, "");

          // @dod:skip-perf reason="inside Promise.all map — already parallel, not sequential N+1"
          await ctx.db.insert("invitations", {
            type: "workspace",
            workspaceId: wsId,
            inviterId,
            inviteeEmail: user.email,
            inviteeId: tm.userId,
            roleId: args.roleId,
            status: "pending",
            message: args.message,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            token,
          });

          return {
            workspaceId: String(wsId),
            userId: String(tm.userId),
            success: true as const,
          };
        })
      );
      results.push(...memberResults.filter((r): r is NonNullable<typeof r> => r !== null));
    }

    await logAuditEvent(ctx, {
      workspaceId: team.workspaceId,
      actorUserId: inviterId,
      action: "team.invite_to_workspaces",
      resourceType: "userTeam",
      resourceId: args.teamId,
      metadata: {
        workspaceCount: args.workspaceIds.length,
        memberCount: teamMemberships.length,
        successCount: results.filter((r) => r.success).length
      },
    });

    return {
      results,
      totalInvites: teamMemberships.length * args.workspaceIds.length,
      successCount: results.filter((r) => r.success).length,
    };
  },
});

/**
 * Create role hierarchy link
 */
export const createRoleHierarchyLink = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    parentRoleId: v.id("roles"),
    childRoleId: v.id("roles"),
    inheritanceMode: v.union(
      v.literal("full"),
      v.literal("restrict"),
      v.literal("extend"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_ROLES);

    // Verify both roles belong to the workspace
    const parentRole = await ctx.db.get(args.parentRoleId);
    const childRole = await ctx.db.get(args.childRoleId);

    if (!parentRole || parentRole.workspaceId !== args.workspaceId) {
      throw new Error("Parent role not found in workspace");
    }
    if (!childRole || childRole.workspaceId !== args.workspaceId) {
      throw new Error("Child role not found in workspace");
    }

    // Check for existing link
    const existing = await ctx.db
      .query("roleHierarchyLinks")
      .withIndex("by_parent_child", (q) =>
        q.eq("parentRoleId", args.parentRoleId).eq("childRoleId", args.childRoleId)
      )
      .first();

    if (existing) {
      throw new Error("Role hierarchy link already exists");
    }

    // Check for circular reference
    async function hasCircularPath(fromRole: Id<"roles">, toRole: Id<"roles">, visited: Set<string>): Promise<boolean> {
      if (String(fromRole) === String(toRole)) return true;
      if (visited.has(String(fromRole))) return false;
      visited.add(String(fromRole));

      const childLinks = await ctx.db
        .query("roleHierarchyLinks")
        .withIndex("by_parent", (q) => q.eq("parentRoleId", fromRole))
        .take(1000);

      for (const link of childLinks) {
        if (await hasCircularPath(link.childRoleId, toRole, visited)) {
          return true;
        }
      }
      return false;
    }

    if (await hasCircularPath(args.childRoleId, args.parentRoleId, new Set())) {
      throw new Error("Cannot create circular role hierarchy");
    }

    const linkId = await ctx.db.insert("roleHierarchyLinks", {
      parentRoleId: args.parentRoleId,
      childRoleId: args.childRoleId,
      workspaceId: args.workspaceId,
      inheritanceMode: args.inheritanceMode,
      createdBy: userId,
      createdAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "role_hierarchy.create",
      resourceType: "roleHierarchyLink",
      resourceId: linkId,
      metadata: { parentRoleId: args.parentRoleId, childRoleId: args.childRoleId },
    });

    return linkId;
  },
});

/**
 * Delete role hierarchy link
 */
export const deleteRoleHierarchyLink = mutation({
  args: {
    linkId: v.id("roleHierarchyLinks"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const link = await ctx.db.get(args.linkId);
    if (!link) throw new Error("Link not found");

    await requirePermission(ctx, link.workspaceId, PERMS.MANAGE_ROLES);

    await ctx.db.delete(args.linkId);

    await logAuditEvent(ctx, {
      workspaceId: link.workspaceId,
      actorUserId: userId,
      action: "role_hierarchy.delete",
      resourceType: "roleHierarchyLink",
      resourceId: args.linkId,
    });

    return true;
  },
});
