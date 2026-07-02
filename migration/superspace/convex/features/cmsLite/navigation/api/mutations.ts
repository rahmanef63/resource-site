import { api, mutation } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";
import { requireAdminForWorkspace } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

/**
 * Create or update a navigation item
 */
export const upsertItem = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    type: v.string(),
    status: v.string(),
    displayOrder: v.optional(v.number()),
    parentKey: v.optional(v.string()),
    translations: v.record(v.string(), v.object({
      label: v.string(),
      description: v.optional(v.string()),
      ariaLabel: v.optional(v.string()),
    })),
    path: v.optional(v.string()),
    isExternal: v.optional(v.boolean()),
    target: v.optional(v.string()),
    icon: v.optional(v.string()),
    data: v.optional(v.object({
      badge: v.optional(v.object({
        text: v.string(),
        variant: v.optional(v.string()),
      })),
      megaMenu: v.optional(v.object({
        columns: v.number(),
        layout: v.string(),
        sections: v.array(v.object({
          title: v.optional(v.string()),
          links: v.array(v.object({
            label: v.string(),
            path: v.string(),
            description: v.optional(v.string()),
            icon: v.optional(v.string()),
          })),
        })),
      })),
      featuredItems: v.optional(v.array(v.object({
        type: v.string(),
        id: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        image: v.optional(v.string()),
      }))),
    })),
    metadata: v.optional(v.object({
      roles: v.optional(v.array(v.string())),
      devices: v.optional(v.array(v.string())),
      analyticsId: v.optional(v.string()),
      customClass: v.optional(v.string()),
    })),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("navigationItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    const now = Date.now();
    let id: Id<"navigationItems">;
    let action = "navigation.update_item";

    if (existing) {
      await ctx.db.patch(existing._id, {
        type: args.type,
        status: args.status,
        displayOrder: args.displayOrder ?? existing.displayOrder,
        parentKey: args.parentKey,
        translations: args.translations,
        path: args.path,
        isExternal: args.isExternal ?? existing.isExternal,
        target: args.target,
        icon: args.icon,
        data: args.data,
        metadata: args.metadata,
        updatedAt: now,
        updatedBy: args.updatedBy || actor.clerkUserId,
      });
      id = existing._id;
    } else {
      // Find highest display order if not provided
      let displayOrder = args.displayOrder;
      if (displayOrder === undefined) {
        const siblings = await ctx.db
          .query("navigationItems")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .take(1000);

        const relevantSiblings = siblings.filter((item) =>
          args.parentKey ? item.parentKey === args.parentKey : !item.parentKey,
        );
        const maxOrder = relevantSiblings.reduce(
          (currentMax, item) => Math.max(currentMax, item.displayOrder ?? 0),
          0,
        );
        displayOrder = maxOrder + 1;
      }

      id = await ctx.db.insert("navigationItems", {
        workspaceId: args.workspaceId,
        key: args.key,
        type: args.type,
        status: args.status,
        displayOrder,
        parentKey: args.parentKey,
        translations: args.translations,
        path: args.path,
        isExternal: args.isExternal ?? false,
        target: args.target,
        icon: args.icon,
        data: args.data,
        metadata: args.metadata,
        createdAt: now,
        createdBy: args.updatedBy || actor.clerkUserId,
        updatedAt: now,
        updatedBy: args.updatedBy || actor.clerkUserId,
      });
      action = "navigation.create_item";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "navigationItem",
      resourceId: id,
      action,
      changes: { key: args.key, type: args.type },
    });

    return id;
  },
});

/**
 * Create or update a navigation group
 */
export const upsertGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    status: v.string(),
    displayOrder: v.optional(v.number()),
    translations: v.record(v.string(), v.object({
      title: v.string(),
      description: v.optional(v.string()),
    })),
    items: v.array(v.string()),
    settings: v.optional(v.object({
      layout: v.optional(v.string()),
      theme: v.optional(v.string()),
      sticky: v.optional(v.boolean()),
      maxDepth: v.optional(v.number()),
      expandBehavior: v.optional(v.string()),
    })),
    metadata: v.optional(v.object({
      roles: v.optional(v.array(v.string())),
      devices: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("navigationGroups")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    const now = Date.now();
    let id: Id<"navigationGroups">;
    let action = "navigation.update_group";

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        displayOrder: args.displayOrder ?? existing.displayOrder,
        translations: args.translations,
        items: args.items,
        settings: args.settings,
        metadata: args.metadata,
        updatedAt: now,
      });
      id = existing._id;
    } else {
      // Find highest display order if not provided
      let displayOrder = args.displayOrder;
      if (displayOrder === undefined) {
        const lastGroup = await ctx.db
          .query("navigationGroups")
          .withIndex("by_order", (q) => q.eq("workspaceId", args.workspaceId))
          .order("desc")
          .first();
        displayOrder = (lastGroup?.displayOrder || 0) + 1;
      }

      id = await ctx.db.insert("navigationGroups", {
        workspaceId: args.workspaceId,
        name: args.name,
        status: args.status,
        displayOrder,
        translations: args.translations,
        items: args.items,
        settings: args.settings,
        metadata: args.metadata,
        createdAt: now,
        updatedAt: now,
      });
      action = "navigation.create_group";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "navigationGroup",
      resourceId: id,
      action,
      changes: { name: args.name, status: args.status },
    });

    return id;
  },
});

/**
 * Flat-shape wrapper around `upsertItem` for admin UIs that expose a
 * per-locale `label` (rather than the full `translations` record).
 * Merges the incoming locale into the existing translations record and
 * writes the remaining fields directly.
 */
export const upsertNavItemFlat = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    locale: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
    path: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
    parentKey: v.optional(v.string()),
    isExternal: v.optional(v.boolean()),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("navigationItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    const translations = { ...(existing?.translations ?? {}) };
    translations[args.locale] = {
      label: args.label,
      description: args.description,
    };

    const now = Date.now();
    let id: Id<"navigationItems">;
    let action = "navigation.update_item";

    if (existing) {
      await ctx.db.patch(existing._id, {
        type: args.type ?? existing.type,
        status: args.status ?? existing.status,
        displayOrder: args.order ?? existing.displayOrder,
        parentKey: args.parentKey ?? existing.parentKey,
        translations,
        path: args.path ?? existing.path,
        isExternal: args.isExternal ?? existing.isExternal,
        icon: args.icon ?? existing.icon,
        updatedAt: now,
        updatedBy: actor.clerkUserId,
      });
      id = existing._id;
    } else {
      let displayOrder = args.order;
      if (displayOrder === undefined) {
        const siblings = await ctx.db
          .query("navigationItems")
          .withIndex("by_workspace", (q) =>
            q.eq("workspaceId", args.workspaceId),
          )
          .take(1000);

        const relevantSiblings = siblings.filter((item) =>
          args.parentKey
            ? item.parentKey === args.parentKey
            : !item.parentKey,
        );
        const maxOrder = relevantSiblings.reduce(
          (cur, item) => Math.max(cur, item.displayOrder ?? 0),
          0,
        );
        displayOrder = maxOrder + 1;
      }

      id = await ctx.db.insert("navigationItems", {
        workspaceId: args.workspaceId,
        key: args.key,
        type: args.type ?? "link",
        status: args.status ?? "active",
        displayOrder,
        parentKey: args.parentKey,
        translations,
        path: args.path,
        isExternal: args.isExternal ?? false,
        icon: args.icon,
        createdAt: now,
        createdBy: actor.clerkUserId,
        updatedAt: now,
        updatedBy: actor.clerkUserId,
      });
      action = "navigation.create_item";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "navigationItem",
      resourceId: id,
      action,
      changes: { key: args.key, locale: args.locale },
    });

    return id;
  },
});

/**
 * Delete a navigation item and its children
 */
export const deleteItem = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    // Delete the item
    const item = await ctx.db
      .query("navigationItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    if (!item) {
      throw new Error("Navigation item not found");
    }

    // Delete children recursively
    const children = await ctx.db
      .query("navigationItems")
      .withIndex("by_parent", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .filter((q) => q.eq("parentKey", args.key))
      .take(1000);

    for (const child of children) {
      await ctx.runMutation(api.navigation.mutations.deleteItem, {
        workspaceId: args.workspaceId,
        key: child.key,
      });
    }

    // Remove from any groups
    const groups = await ctx.db
      .query("navigationGroups")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    for (const group of groups) {
      if (group.items.includes(args.key)) {
        await ctx.db.patch(group._id, {
          items: group.items.filter(k => k !== args.key),
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.delete(item._id);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "navigationItem",
      resourceId: item._id,
      action: "navigation.delete_item",
      changes: { key: args.key, deletedChildren: children.length },
    });

    return true;
  },
});

/**
 * Delete a navigation group
 */
export const deleteGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const group = await ctx.db
      .query("navigationGroups")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    if (!group) {
      throw new Error("Navigation group not found");
    }

    await ctx.db.delete(group._id);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "navigationGroup",
      resourceId: group._id,
      action: "navigation.delete_group",
      changes: { name: args.name },
    });

    return true;
  },
});

