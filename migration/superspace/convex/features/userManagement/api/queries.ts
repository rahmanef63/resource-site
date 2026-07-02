/**
 * User Management Queries
 * 
 * Orchestration queries that compose data from multiple existing systems:
 * - Members (workspaceMemberships)
 * - Invitations (invitations)
 * - Contacts (contacts, contactsRequests)
 * - Hierarchy (workspace hierarchy)
 * 
 * @module convex/features/userManagement/api/queries
 */

import { v } from "convex/values";
import { query } from "../../../_generated/server";
import { ensureUser, requireActiveMembership } from "../../../auth/helpers";
import type { Doc, Id } from "../../../_generated/dataModel";

/**
 * Get user→workspace access matrix
 * Returns a matrix showing which users have access to which workspaces
 * within a hierarchy starting from a given workspace
 */
export const getUserWorkspaceMatrix = query({
  args: {
    workspaceId: v.id("workspaces"),
    maxDepth: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const maxDepth = args.maxDepth ?? 3;
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return { users: [], workspaces: [], matrix: {} };

    // Collect all workspaces in hierarchy
    const workspaceIds: Id<"workspaces">[] = [args.workspaceId];
    const workspaceMap = new Map<string, Doc<"workspaces">>();
    workspaceMap.set(String(args.workspaceId), workspace);

    // BFS to collect children up to maxDepth
    async function collectChildren(wsId: Id<"workspaces">, depth: number) {
      if (depth >= maxDepth) return;

      const children = await ctx.db
        .query("workspaces")
        .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", wsId))
        .take(1000);

      for (const child of children) {
        workspaceIds.push(child._id);
        workspaceMap.set(String(child._id), child);
        await collectChildren(child._id, depth + 1);
      }

      // Also get linked children
      const links = await ctx.db
        .query("workspaceLinks")
        .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", wsId))
        .take(1000);

      for (const link of links) {
        const linkedWs = await ctx.db.get(link.childWorkspaceId);
        if (linkedWs && !workspaceMap.has(String(linkedWs._id))) {
          workspaceIds.push(linkedWs._id);
          workspaceMap.set(String(linkedWs._id), linkedWs);
          await collectChildren(linkedWs._id, depth + 1);
        }
      }
    }

    await collectChildren(args.workspaceId, 0);

    // Get all memberships for these workspaces
    const allMemberships: Doc<"workspaceMemberships">[] = [];
    const userIds = new Set<string>();

    for (const wsId of workspaceIds) {
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", wsId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .take(1000);

      for (const m of memberships) {
        allMemberships.push(m);
        userIds.add(String(m.userId));
      }
    }

    // Get user details — parallel fetch instead of sequential gets.
    const users: Array<{ _id: Id<"users">; name?: string; email?: string; avatarUrl?: string }> = [];
    const fetchedUsers = await Promise.all(
      [...userIds].map((uid) => ctx.db.get(uid as Id<"users">)),
    );
    for (const user of fetchedUsers) {
      if (user) {
        users.push({
          _id: user._id,
          name: user.name ?? undefined,
          email: user.email,
          avatarUrl: user.avatarUrl ?? undefined,
        });
      }
    }

    // Build matrix: { [userId]: { [workspaceId]: { roleId, roleName, roleLevel } } }
    const matrix: Record<string, Record<string, { roleId: string; roleName?: string; roleLevel?: number }>> = {};

    // Fetch each distinct role once (memberships often share roles) instead of
    // a sequential ctx.db.get per membership re-fetching the same rows.
    const roleIdByKey = new Map<string, (typeof allMemberships)[number]["roleId"]>();
    for (const m of allMemberships) roleIdByKey.set(String(m.roleId), m.roleId);
    const roleEntries = await Promise.all(
      [...roleIdByKey.entries()].map(async ([key, rid]) => [key, await ctx.db.get(rid)] as const),
    );
    const roleCache = new Map(roleEntries);

    for (const m of allMemberships) {
      const userKey = String(m.userId);
      const wsKey = String(m.workspaceId);

      if (!matrix[userKey]) {
        matrix[userKey] = {};
      }

      const role = roleCache.get(String(m.roleId));
      matrix[userKey][wsKey] = {
        roleId: String(m.roleId),
        roleName: role?.name,
        roleLevel: role?.level ?? m.roleLevel,
      };
    }

    // Convert workspace map to array with hierarchy info
    const workspaces = Array.from(workspaceMap.values()).map((ws) => ({
      _id: ws._id,
      name: ws.name,
      slug: ws.slug,
      type: ws.type,
      depth: ws.depth ?? 0,
      parentWorkspaceId: ws.parentWorkspaceId,
    }));

    return { users, workspaces, matrix };
  },
});

/**
 * Get hierarchy member overview
 * Returns aggregated member statistics for a workspace hierarchy
 */
export const getHierarchyMemberOverview = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return null;

    // Get direct workspace members
    const directMembers = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(1000);

    // Get roles for member breakdown
    const roleBreakdown: Record<string, { count: number; roleName: string; level?: number }> = {};
    for (const m of directMembers) {
      const role = await ctx.db.get(m.roleId);
      const roleKey = String(m.roleId);
      if (!roleBreakdown[roleKey]) {
        roleBreakdown[roleKey] = {
          count: 0,
          roleName: role?.name ?? "Unknown",
          level: role?.level,
        };
      }
      roleBreakdown[roleKey].count++;
    }

    // Get pending invitations
    const pendingInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .take(1000);

    // Get child workspaces count
    const children = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.workspaceId))
      .take(1000);

    // Get linked children count
    const links = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.workspaceId))
      .take(1000);

    return {
      workspaceId: args.workspaceId,
      workspaceName: workspace.name,
      totalMembers: directMembers.length,
      roleBreakdown: Object.values(roleBreakdown),
      pendingInvitations: pendingInvitations.length,
      childWorkspaces: children.length,
      linkedWorkspaces: links.length,
    };
  },
});

/**
 * Get Contacts available for quick invite
 * Returns Contacts who are not yet members of the specified workspace
 */
export const getContactsForQuickInvite = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    const userId = await ensureUser(ctx);

    // Get current user's Contacts
    const contacts1 = await ctx.db
      .query("socialContacts")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(1000);

    const contacts2 = await ctx.db
      .query("socialContacts")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(1000);

    const ContactIds = new Set<string>();
    contacts1.forEach((f) => ContactIds.add(String(f.user2Id)));
    contacts2.forEach((f) => ContactIds.add(String(f.user1Id)));

    // Get existing workspace members
    const existingMembers = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);
    const memberIds = new Set(existingMembers.map((m) => String(m.userId)));

    // Get pending invitations
    const pendingInvitations = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .take(1000);
    const pendingInviteeIds = new Set(
      pendingInvitations
        .filter((i) => i.inviteeId)
        .map((i) => String(i.inviteeId))
    );

    // Filter Contacts who are not members and don't have pending invitations
    const availableContacts: Array<{
      _id: Id<"users">;
      name?: string;
      email?: string;
      avatarUrl?: string;
      hasPendingInvite: boolean;
    }> = [];

    for (const ContactId of ContactIds) {
      if (memberIds.has(ContactId)) continue; // Skip if already member

      const Contact = await ctx.db.get(ContactId as Id<"users">);
      if (Contact) {
        availableContacts.push({
          _id: Contact._id,
          name: Contact.name ?? undefined,
          email: Contact.email,
          avatarUrl: Contact.avatarUrl ?? undefined,
          hasPendingInvite: pendingInviteeIds.has(ContactId),
        });
      }
    }

    return availableContacts;
  },
});

/**
 * Get user teams for a workspace
 */
export const getWorkspaceTeams = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await ensureUser(ctx);

    const teams = await ctx.db
      .query("userTeams")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    // Get member count for each team
    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        const members = await ctx.db
          .query("teamMemberships")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .take(1000);

        return {
          ...team,
          memberCount: members.length,
        };
      })
    );

    return teamsWithCounts;
  },
});

/**
 * Get team members
 */
export const getTeamMembers = query({
  args: {
    teamId: v.id("userTeams"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return [];

    await requireActiveMembership(ctx, team.workspaceId);
    await ensureUser(ctx);

    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .take(1000);

    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        return {
          ...m,
          user: user
            ? {
              _id: user._id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
            }
            : null,
        };
      })
    );

    return members.filter((m) => m.user);
  },
});

/**
 * Get role hierarchy for a workspace
 * Returns roles with their parent-child relationships for ReactFlow canvas
 */
export const getRoleHierarchy = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);
    await ensureUser(ctx);

    // Get all roles for this workspace
    const roles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    // Get role hierarchy links
    const links = await ctx.db
      .query("roleHierarchyLinks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    // Format roles for ReactFlow nodes
    const roleNodes = roles.map((role, index) => ({
      id: String(role._id),
      name: role.name,
      slug: role.slug,
      level: role.level ?? index * 10,
      color: role.color,
      permissions: role.permissions,
      isSystemRole: role.isSystemRole,
      isDefault: role.isDefault,
      // Default position based on level
      position: {
        x: 250,
        y: (role.level ?? index * 10) * 8,
      },
    }));

    // Format links for ReactFlow edges
    const roleLinks = links.map((link) => ({
      id: String(link._id),
      source: String(link.parentRoleId),
      target: String(link.childRoleId),
      inheritanceMode: link.inheritanceMode,
    }));

    return { roles: roleNodes, links: roleLinks };
  },
});
