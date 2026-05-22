/**
 * workspace-shell — queries (P0 scaffold).
 *
 * Implements: getNavContext (resolves wsId + menuSetId with fallback).
 * P2 will add: listMenuSets, getEffectiveMenuItems (with role gating).
 */
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { ensureUser, requireActiveMembership } from "../../auth/helpers";

/**
 * Resolve NavContext for current user + workspace.
 * Resolution order: explicit cache row > user override > workspace default > system.
 */
export const getNavContext = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requireActiveMembership(ctx, args.workspaceId);

    // 1) Cached context row
    const cached = await ctx.db
      .query("workspaceShell_navContext")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId),
      )
      .first();

    let menuSetId = cached?.menuSetId ?? null;
    let source: "user" | "workspace" | "system" = cached?.source ?? "system";

    // 2) User override (scoped to this workspace OR global)
    if (!menuSetId) {
      const userAssign = await ctx.db
        .query("workspaceShell_userAssignments")
        .withIndex("by_user_workspace", (q) =>
          q.eq("userId", userId).eq("workspaceId", args.workspaceId),
        )
        .first();
      if (userAssign) {
        menuSetId = userAssign.menuSetId;
        source = "user";
      }
    }

    // 3) Workspace default
    if (!menuSetId) {
      const wsAssign = await ctx.db
        .query("workspaceShell_wsAssignments")
        .withIndex("by_workspace_default", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("isDefault", true),
        )
        .first();
      if (wsAssign) {
        menuSetId = wsAssign.menuSetId;
        source = "workspace";
      }
    }

    const workspace = await ctx.db.get(args.workspaceId);
    const menuSet = menuSetId ? await ctx.db.get(menuSetId) : null;

    return { workspace, menuSet, menuSetId, source, userId };
  },
});

/**
 * List menu sets available to current user in this workspace
 * (own + workspace + system).
 */
export const listAvailableMenuSets = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requireActiveMembership(ctx, args.workspaceId);

    const ownByUser = await ctx.db
      .query("workspaceShell_menuSets")
      .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", userId))
      .take(200);

    const ownByWorkspace = await ctx.db
      .query("workspaceShell_menuSets")
      .withIndex("by_ownerWorkspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(200);

    const system = await ctx.db
      .query("workspaceShell_menuSets")
      .withIndex("by_ownerType", (q) => q.eq("ownerType", "system"))
      .take(50);

    return { user: ownByUser, workspace: ownByWorkspace, system };
  },
});

/**
 * List menuItems by menuSet (editor view — no role filter, no resolver).
 * Caller must have access to the parent menuSet's workspace.
 */
export const listMenuItemsBySet = query({
  args: { menuSetId: v.id("workspaceShell_menuSets") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const ms = await ctx.db.get(args.menuSetId);
    if (!ms) return [];
    // Workspace-scoped sets require active membership
    if (ms.workspaceId) {
      await requireActiveMembership(ctx, ms.workspaceId);
    }
    // user-owned sets require ownership
    if (ms.ownerType === "user" && ms.ownerUserId !== userId) {
      return [];
    }
    const items = await ctx.db
      .query("workspaceShell_menuItems")
      .withIndex("by_menuSet", (q) => q.eq("menuSetId", args.menuSetId))
      .take(2000);
    return items;
  },
});

/**
 * Get effective menu items for current user in workspace, with role filter
 * applied. Resolves menuSet via NavContext resolver (user > workspace > system).
 * Returns flat list, sorted by (parentId, order). Frontend builds tree.
 */
export const getEffectiveMenuItems = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requireActiveMembership(ctx, args.workspaceId);

    // Resolve menuSetId — same chain as getNavContext but inline (avoids
    // double-query overhead since this is the hot path for sidebar render).
    const cached = await ctx.db
      .query("workspaceShell_navContext")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId),
      )
      .first();

    let menuSetId = cached?.menuSetId ?? null;

    if (!menuSetId) {
      const userAssign = await ctx.db
        .query("workspaceShell_userAssignments")
        .withIndex("by_user_workspace", (q) =>
          q.eq("userId", userId).eq("workspaceId", args.workspaceId),
        )
        .first();
      menuSetId = userAssign?.menuSetId ?? null;
    }

    if (!menuSetId) {
      const wsAssign = await ctx.db
        .query("workspaceShell_wsAssignments")
        .withIndex("by_workspace_default", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("isDefault", true),
        )
        .first();
      menuSetId = wsAssign?.menuSetId ?? null;
    }

    if (!menuSetId) return { items: [], menuSetId: null };

    const items = await ctx.db
      .query("workspaceShell_menuItems")
      .withIndex("by_menuSet", (q) => q.eq("menuSetId", menuSetId!))
      .take(2000);

    // Filter invisible items
    const visible = items.filter((i) => i.isVisible !== false);

    // Role filter — get user's role in this workspace
    const membership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId),
      )
      .first();

    const roleId = membership?.roleId;

    // If user has no role (owner/admin/anonymous), show all
    if (!roleId) {
      return {
        items: visible.sort((a, b) => a.order - b.order),
        menuSetId,
      };
    }

    // Load rolePerms for this role (in-memory filter)
    const allowedItemIds = new Set<string>();
    const perms = await ctx.db
      .query("workspaceShell_rolePerms")
      .withIndex("by_role", (q) => q.eq("roleId", roleId))
      .take(2000);
    for (const p of perms) {
      if (p.canView) allowedItemIds.add(p.menuItemId);
    }

    // If NO rolePerms exist at all for this menuSet (most common pre-RBAC
    // setup), don't filter — show everything.
    const anyPermsForMenuSet = visible.some((it) => allowedItemIds.has(it._id));
    const filtered = anyPermsForMenuSet
      ? visible.filter((it) => allowedItemIds.has(it._id))
      : visible;

    return {
      items: filtered.sort((a, b) => a.order - b.order),
      menuSetId,
    };
  },
});
