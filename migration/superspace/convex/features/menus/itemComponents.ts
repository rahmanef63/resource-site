import { v } from "convex/values";
import { query, mutation } from "../../_generated/server";
import { requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions";

// Add binding of a component version to a menu item
export const addBinding = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    componentVersionId: v.id("componentVersions"),
    slot: v.optional(v.string()),
    order: v.optional(v.number()),
    props: v.optional(v.object({})),
    bindings: v.optional(v.object({})),
    layout: v.optional(v.object({})),
    visibility: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId);
    if (!menuItem) throw new Error("Menu item not found");
    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS);

    return await ctx.db.insert("menuItemComponents", {
      menuItemId: args.menuItemId,
      componentVersionId: args.componentVersionId,
      slot: args.slot,
      order: args.order ?? 0,
      props: args.props,
      bindings: args.bindings,
      layout: args.layout,
      visibility: args.visibility,
      createdAt: Date.now(),
    });
  },
});

// List bindings for a menu item
export const listBindingsForMenuItem = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItemComponents")
      .withIndex("by_menuItem", (q) => q.eq("menuItemId", args.menuItemId))
      .take(1000);
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },
});

// Remove a binding
export const removeBinding = mutation({
  args: { bindingId: v.id("menuItemComponents") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.bindingId);
    if (!row) return args.bindingId;
    // Find workspace via menu item
    const menuItem = await ctx.db.get(row.menuItemId);
    if (!menuItem) throw new Error("Menu item not found");
    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS);
    await ctx.db.delete(args.bindingId);
    return args.bindingId;
  },
});
