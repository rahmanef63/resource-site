import { v } from "convex/values";
import { query, mutation } from "../../_generated/server";
import { ensureUser, requirePermission, requireActiveMembership } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions";

// Create a menu set
export const createMenuSet = mutation({
  args: {
    ownerType: v.union(v.literal("system"), v.literal("workspace"), v.literal("user"), v.literal("cms")),
    ownerWorkspaceId: v.optional(v.id("workspaces")),
    ownerUserId: v.optional(v.id("users")),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    if (args.ownerType === "workspace") {
      if (!args.ownerWorkspaceId) throw new Error("ownerWorkspaceId is required for workspace ownerType");
      await requirePermission(ctx, args.ownerWorkspaceId, PERMS.MANAGE_MENUS);
    }
    if (args.ownerType === "user") {
      if (!args.ownerUserId) throw new Error("ownerUserId is required for user ownerType");
      if (String(args.ownerUserId) !== String(userId)) throw new Error("Not authorized to create user-owned menu set");
    }

    return await ctx.db.insert("menuSets", {
      ownerType: args.ownerType,
      ownerWorkspaceId: args.ownerWorkspaceId,
      ownerUserId: args.ownerUserId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      isPublic: args.isPublic ?? true,
      createdBy: userId,
    });
  },
});

// Assign a menu set to a workspace (optionally set as default)
export const assignMenuSetToWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    menuSetId: v.id("menuSets"),
    isDefault: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS);

    const existing = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("menuSetId"), args.menuSetId))
      .first();

    let id;
    if (existing) {
      await ctx.db.patch(existing._id, {
        isDefault: args.isDefault ?? existing.isDefault,
        order: args.order ?? existing.order,
      });
      id = existing._id;
    } else {
      id = await ctx.db.insert("workspaceMenuAssignments", {
        workspaceId: args.workspaceId,
        menuSetId: args.menuSetId,
        isDefault: Boolean(args.isDefault),
        order: args.order ?? 0,
        createdAt: Date.now(),
      });
    }

    if (args.isDefault) {
      // Ensure only one default per workspace
      const others = await ctx.db
        .query("workspaceMenuAssignments")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000);
      for (const row of others) {
        if (row._id !== id && row.isDefault) {
          await ctx.db.patch(row._id, { isDefault: false });
        }
      }
    }

    return id;
  },
});

// Set default workspace menu set
export const setWorkspaceDefaultMenuSet = mutation({
  args: { workspaceId: v.id("workspaces"), menuSetId: v.id("menuSets") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS);
    // Upsert assignment and enforce default
    const existing = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("menuSetId"), args.menuSetId))
      .first();

    let id;
    if (existing) {
      await ctx.db.patch(existing._id, { isDefault: true });
      id = existing._id;
    } else {
      id = await ctx.db.insert("workspaceMenuAssignments", {
        workspaceId: args.workspaceId,
        menuSetId: args.menuSetId,
        isDefault: true,
        order: 0,
        createdAt: Date.now(),
      });
    }

    // Ensure only one default per workspace
    const others = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);
    for (const row of others) {
      if (row._id !== id && row.isDefault) {
        await ctx.db.patch(row._id, { isDefault: false });
      }
    }

    return true as const;
  },
});

// List workspace menu sets (with assignment info)
export const listWorkspaceMenuSets = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    const items = await Promise.all(assignments.map(async (a) => {
      const set = await ctx.db.get(a.menuSetId);
      return { ...a, menuSet: set };
    }));

    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

// Assign a menu set to a user (optionally scoped to a workspace)
export const assignMenuSetToUser = mutation({
  args: {
    userId: v.id("users"),
    menuSetId: v.id("menuSets"),
    scope: v.union(v.literal("global"), v.literal("workspace")),
    workspaceId: v.optional(v.id("workspaces")),
    isDefault: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const caller = await ensureUser(ctx);
    if (String(caller) !== String(args.userId)) throw new Error("Not authorized");

    const existing = await ctx.db
      .query("userMenuAssignments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("menuSetId"), args.menuSetId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        scope: args.scope,
        workspaceId: args.workspaceId,
        isDefault: args.isDefault ?? existing.isDefault,
        order: args.order ?? existing.order,
      });
      return existing._id;
    }

    return await ctx.db.insert("userMenuAssignments", {
      userId: args.userId,
      menuSetId: args.menuSetId,
      scope: args.scope,
      workspaceId: args.workspaceId,
      isDefault: Boolean(args.isDefault),
      order: args.order ?? 0,
      createdAt: Date.now(),
    });
  },
});

// Create a personal (per-user) menu set for a workspace by cloning the workspace's default menus,
// assign it to the caller for that workspace, and set it as their default.
export const forkDefaultWorkspaceMenuSetForUser = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requireActiveMembership(ctx, args.workspaceId);

    // Find workspace default menu set
    const wsAssignedDefault = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace_default", (q) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
      .first();

    let sourceItems: any[] = [];
    if (wsAssignedDefault) {
      sourceItems = await ctx.db
        .query("menuItems")
        .withIndex("by_menuSet", (q) => q.eq("menuSetId", wsAssignedDefault.menuSetId))
        .take(1000);
    } else {
      // Back-compat: fall back to workspace-scoped items
      sourceItems = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .take(1000);
    }

    // Create a user-owned menu set (scoped to this workspace via assignment)
    const newMenuSetId = await ctx.db.insert("menuSets", {
      ownerType: "user" as any,
      ownerWorkspaceId: args.workspaceId,
      ownerUserId: userId,
      name: "My Menu",
      slug: `user-${String(userId).slice(-6)}-${Date.now()}`,
      description: "Personalized workspace menu",
      isPublic: false,
      createdBy: userId,
    } as any);

    // Clone items into the new set
    for (const it of sourceItems) {
      await ctx.db.insert("menuItems", {
        workspaceId: args.workspaceId,
        menuSetId: newMenuSetId,
        parentId: it.parentId ?? undefined,
        name: it.name,
        slug: it.slug,
        type: it.type,
        icon: it.icon,
        path: it.path,
        component: it.component,
        order: it.order,
        isVisible: it.isVisible,
        visibleForRoleIds: it.visibleForRoleIds ?? [],
        metadata: it.metadata,
        createdBy: userId,
      } as any);
    }

    // Assign to user as default for this workspace
    // First, demote any existing defaults for user+workspace
    const existingAssignments = await ctx.db
      .query("userMenuAssignments")
      .withIndex("by_user_workspace", (q) => q.eq("userId", userId as any).eq("workspaceId", args.workspaceId))
      .take(1000);
    for (const a of existingAssignments) {
      if (a.isDefault) await ctx.db.patch(a._id, { isDefault: false });
    }

    await ctx.db.insert("userMenuAssignments", {
      userId,
      menuSetId: newMenuSetId,
      scope: "workspace" as any,
      workspaceId: args.workspaceId,
      isDefault: true,
      order: 0,
      createdAt: Date.now(),
    } as any);

    return newMenuSetId;
  },
});
