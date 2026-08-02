/**
 * workspace-shell — mutations (P0 scaffold).
 *
 * Implements: setNavContext (atomic switch ws + menuSet), forkMenuSet (user
 * creates personal copy of a workspace menuSet).
 *
 * Audit logging: graceful — if logAuditEvent throws (e.g. audit-log slice
 * missing in consumer), catch + console.warn + continue. Mutation must still
 * succeed.
 */
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser, requirePermission, requireActiveMembership } from "../../auth/helpers";
import { logAuditEvent } from "../../shared/audit";
import { PERMS } from "../../workspace/permissions";

async function safeAudit(ctx: any, payload: any) {
  try {
    await logAuditEvent(ctx, payload);
  } catch (err) {
    console.warn("workspaceShell: audit log failed (non-fatal)", err);
  }
}

/**
 * Atomic NavContext update — switch workspace + menuSet in one mutation.
 * Upserts workspaceShell_navContext cache.
 */
export const setNavContext = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    menuSetId: v.optional(v.id("workspaceShell_menuSets")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requireActiveMembership(ctx, args.workspaceId);

    if (args.menuSetId) {
      const ms = await ctx.db.get(args.menuSetId);
      if (!ms) throw new Error("menuSet not found");
      // Authz: user can set context to a menuSet they own OR a workspace/system one
      if (ms.ownerType === "user" && ms.ownerUserId !== userId) {
        throw new Error("Cannot use another user's personal menuSet");
      }
      if (ms.ownerType === "workspace" && ms.workspaceId !== args.workspaceId) {
        throw new Error("menuSet belongs to a different workspace");
      }
    }

    const existing = await ctx.db
      .query("workspaceShell_navContext")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", userId).eq("workspaceId", args.workspaceId),
      )
      .first();

    const source: "user" | "workspace" | "system" = args.menuSetId ? "user" : "system";
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        menuSetId: args.menuSetId,
        source,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("workspaceShell_navContext", {
        userId,
        workspaceId: args.workspaceId,
        menuSetId: args.menuSetId,
        source,
        updatedAt: now,
      });
    }

    // Mirror to user assignment when menuSetId is set (cache stays in sync)
    if (args.menuSetId) {
      const userAssign = await ctx.db
        .query("workspaceShell_userAssignments")
        .withIndex("by_user_workspace", (q) =>
          q.eq("userId", userId).eq("workspaceId", args.workspaceId),
        )
        .first();
      if (userAssign) {
        if (userAssign.menuSetId !== args.menuSetId) {
          await ctx.db.patch(userAssign._id, { menuSetId: args.menuSetId });
        }
      } else {
        await ctx.db.insert("workspaceShell_userAssignments", {
          userId,
          workspaceId: args.workspaceId,
          menuSetId: args.menuSetId,
          scope: "workspace",
          createdAt: now,
        });
      }
    }

    await safeAudit(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "workspaceShell.context.switched",
      resourceType: "navContext",
      resourceId: existing?._id ?? "new",
      metadata: { menuSetId: args.menuSetId, source },
    });
  },
});

/**
 * Create a new menuSet (admin tier — requires MANAGE_MENUS).
 */
export const createMenuSet = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    ownerType: v.union(
      v.literal("workspace"),
      v.literal("user"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (args.ownerType === "workspace") {
      await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS);
    } else {
      await requirePermission(ctx, args.workspaceId, PERMS.MENUS_FORK);
    }
    const now = Date.now();
    const id = await ctx.db.insert("workspaceShell_menuSets", {
      workspaceId: args.workspaceId,
      ownerType: args.ownerType,
      ownerUserId: args.ownerType === "user" ? userId : undefined,
      slug: args.slug,
      name: args.name,
      description: args.description,
      isDefault: false,
      forkedFromId: undefined,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
    await safeAudit(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "workspaceShell.menuSet.created",
      resourceType: "menuSet",
      resourceId: id,
      metadata: { name: args.name, ownerType: args.ownerType },
    });
    return id;
  },
});

export const updateMenuSet = mutation({
  args: {
    id: v.id("workspaceShell_menuSets"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const ms = await ctx.db.get(args.id);
    if (!ms) throw new Error("menuSet not found");
    // Workspace menuSets need MANAGE_MENUS; user-owned only if owner.
    if (ms.ownerType === "user") {
      if (ms.ownerUserId !== userId) throw new Error("not your menuSet");
    } else if (ms.workspaceId) {
      await requirePermission(ctx, ms.workspaceId, PERMS.MANAGE_MENUS);
    }
    const patch: any = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    await ctx.db.patch(args.id, patch);
  },
});

export const deleteMenuSet = mutation({
  args: { id: v.id("workspaceShell_menuSets") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const ms = await ctx.db.get(args.id);
    if (!ms) throw new Error("menuSet not found");
    if (ms.ownerType === "user") {
      if (ms.ownerUserId !== userId) throw new Error("not your menuSet");
    } else if (ms.workspaceId) {
      await requirePermission(ctx, ms.workspaceId, PERMS.MANAGE_MENUS);
    }
    // Cascade delete items
    const items = await ctx.db
      .query("workspaceShell_menuItems")
      .withIndex("by_menuSet", (q) => q.eq("menuSetId", args.id))
      .take(2000);
    for (const it of items) await ctx.db.delete(it._id);
    await ctx.db.delete(args.id);
    if (ms.workspaceId) {
      await safeAudit(ctx, {
        workspaceId: ms.workspaceId,
        actorUserId: userId,
        action: "workspaceShell.menuSet.deleted",
        resourceType: "menuSet",
        resourceId: args.id,
        metadata: { name: ms.name, itemsCascaded: items.length },
      });
    }
  },
});

/**
 * Create a menuItem in a menuSet. ownerType determines RBAC.
 */
export const createMenuItem = mutation({
  args: {
    menuSetId: v.id("workspaceShell_menuSets"),
    parentId: v.optional(v.id("workspaceShell_menuItems")),
    label: v.string(),
    icon: v.optional(v.string()),
    route: v.optional(v.string()),
    featureSlug: v.optional(v.string()),
    order: v.optional(v.number()),
    requiredPermission: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const ms = await ctx.db.get(args.menuSetId);
    if (!ms) throw new Error("menuSet not found");
    if (ms.ownerType === "user") {
      if (ms.ownerUserId !== userId) throw new Error("not your menuSet");
    } else if (ms.workspaceId) {
      await requirePermission(ctx, ms.workspaceId, PERMS.MANAGE_MENUS);
    }
    // Auto-order if not provided
    let order = args.order;
    if (order === undefined) {
      const siblings = await ctx.db
        .query("workspaceShell_menuItems")
        .withIndex("by_menuSet", (q) => q.eq("menuSetId", args.menuSetId))
        .take(2000);
      const maxOrder = siblings
        .filter((s) => (s.parentId ?? null) === (args.parentId ?? null))
        .reduce((max, s) => Math.max(max, s.order), 0);
      order = maxOrder + 1;
    }
    const now = Date.now();
    const id = await ctx.db.insert("workspaceShell_menuItems", {
      workspaceId: ms.workspaceId,
      menuSetId: args.menuSetId,
      parentId: args.parentId,
      label: args.label,
      icon: args.icon,
      route: args.route,
      featureSlug: args.featureSlug,
      order,
      isVisible: true,
      requiredPermission: args.requiredPermission,
      metadata: undefined,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const updateMenuItem = mutation({
  args: {
    id: v.id("workspaceShell_menuItems"),
    label: v.optional(v.string()),
    icon: v.optional(v.string()),
    route: v.optional(v.string()),
    order: v.optional(v.number()),
    parentId: v.optional(v.union(v.id("workspaceShell_menuItems"), v.null())),
    isVisible: v.optional(v.boolean()),
    requiredPermission: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("menuItem not found");
    if (item.menuSetId) {
      const ms = await ctx.db.get(item.menuSetId);
      if (!ms) throw new Error("menuSet not found");
      if (ms.ownerType === "user") {
        if (ms.ownerUserId !== userId) throw new Error("not your menuSet");
      } else if (ms.workspaceId) {
        await requirePermission(ctx, ms.workspaceId, PERMS.MANAGE_MENUS);
      }
    }
    const patch: any = { updatedAt: Date.now() };
    if (args.label !== undefined) patch.label = args.label;
    if (args.icon !== undefined) patch.icon = args.icon;
    if (args.route !== undefined) patch.route = args.route;
    if (args.order !== undefined) patch.order = args.order;
    if (args.parentId !== undefined) patch.parentId = args.parentId ?? undefined;
    if (args.isVisible !== undefined) patch.isVisible = args.isVisible;
    if (args.requiredPermission !== undefined) patch.requiredPermission = args.requiredPermission;
    await ctx.db.patch(args.id, patch);
  },
});

export const deleteMenuItem = mutation({
  args: { id: v.id("workspaceShell_menuItems") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("menuItem not found");
    if (item.menuSetId) {
      const ms = await ctx.db.get(item.menuSetId);
      if (ms?.ownerType === "user") {
        if (ms.ownerUserId !== userId) throw new Error("not your menuSet");
      } else if (ms?.workspaceId) {
        await requirePermission(ctx, ms.workspaceId, PERMS.MANAGE_MENUS);
      }
    }
    // Cascade: re-parent children to grandparent (preserve tree)
    const children = await ctx.db
      .query("workspaceShell_menuItems")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .take(2000);
    for (const c of children) {
      await ctx.db.patch(c._id, { parentId: item.parentId });
    }
    await ctx.db.delete(args.id);
  },
});

/**
 * Set workspace-default menuSet (admin tier).
 */
export const setWorkspaceDefaultMenuSet = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    menuSetId: v.id("workspaceShell_menuSets"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS);
    // Clear existing default
    const existing = await ctx.db
      .query("workspaceShell_wsAssignments")
      .withIndex("by_workspace_default", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("isDefault", true),
      )
      .take(50);
    for (const a of existing) {
      if (a.menuSetId !== args.menuSetId) {
        await ctx.db.patch(a._id, { isDefault: false });
      }
    }
    // Upsert target
    const targetAssign = await ctx.db
      .query("workspaceShell_wsAssignments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("menuSetId"), args.menuSetId))
      .first();
    if (targetAssign) {
      await ctx.db.patch(targetAssign._id, { isDefault: true });
    } else {
      await ctx.db.insert("workspaceShell_wsAssignments", {
        workspaceId: args.workspaceId,
        menuSetId: args.menuSetId,
        isDefault: true,
        label: undefined,
        createdBy: userId,
        createdAt: Date.now(),
      });
    }
    await safeAudit(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "workspaceShell.wsAssignment.defaultSet",
      resourceType: "wsAssignment",
      resourceId: args.menuSetId,
      metadata: { menuSetId: args.menuSetId },
    });
  },
});

/**
 * Fork a menuSet — user creates personal copy of a workspace/system menuSet.
 * Requires MENUS_FORK permission.
 */
export const forkMenuSet = mutation({
  args: {
    sourceMenuSetId: v.id("workspaceShell_menuSets"),
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMS.MENUS_FORK);

    const source = await ctx.db.get(args.sourceMenuSetId);
    if (!source) throw new Error("source menuSet not found");
    if (source.ownerType === "user" && source.ownerUserId !== userId) {
      throw new Error("cannot fork another user's personal menuSet");
    }

    const now = Date.now();
    const slug = `${source.slug}-fork-${userId.slice(-6)}-${now}`;

    const newId = await ctx.db.insert("workspaceShell_menuSets", {
      workspaceId: args.workspaceId,
      ownerType: "user",
      ownerUserId: userId,
      slug,
      name: args.name,
      description: `Forked from ${source.name}`,
      isDefault: false,
      forkedFromId: args.sourceMenuSetId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Copy menu items (1 level — children recursion deferred to P4)
    const sourceItems = await ctx.db
      .query("workspaceShell_menuItems")
      .withIndex("by_menuSet", (q) => q.eq("menuSetId", args.sourceMenuSetId))
      .take(500);

    for (const item of sourceItems) {
      await ctx.db.insert("workspaceShell_menuItems", {
        workspaceId: item.workspaceId,
        menuSetId: newId,
        parentId: undefined, // parent re-mapping deferred to P4 full tree clone
        featureSlug: item.featureSlug,
        label: item.label,
        icon: item.icon,
        route: item.route,
        order: item.order,
        isVisible: item.isVisible,
        requiredPermission: item.requiredPermission,
        metadata: item.metadata,
        createdAt: now,
        updatedAt: now,
      });
    }

    await safeAudit(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "workspaceShell.menuSet.forked",
      resourceType: "menuSet",
      resourceId: newId,
      metadata: { sourceMenuSetId: args.sourceMenuSetId, itemsCloned: sourceItems.length },
    });

    return newId;
  },
});
