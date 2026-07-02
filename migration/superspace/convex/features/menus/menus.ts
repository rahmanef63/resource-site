import { v } from "convex/values";
import { query, mutation } from "../../_generated/server";
import { ensureUser, requireActiveMembership, requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

// Get menu siblings for breadcrumb navigation
export const getMenuSiblings = query({
  args: {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("menuItems")),
    currentItemId: v.optional(v.id("menuItems")),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireActiveMembership(ctx, args.workspaceId);

    // Get sibling menu items
    const siblings = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace_parent", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("parentId", args.parentId)
      )
      .filter((q) => q.eq(q.field("isVisible"), true))
      .take(1000);

    // Filter out current item and check role permissions
    const roleId = membership?.roleId as any | undefined;
    const visibleSiblings = siblings.filter(item => {
      if (args.currentItemId && item._id === args.currentItemId) return false;
      if (item.visibleForRoleIds.length === 0) return true;
      if (!roleId) return true; // creator fallback or no specific role
      return item.visibleForRoleIds.includes(roleId);
    });

    // Get children count for each sibling
    const siblingsWithChildren = await Promise.all(
      visibleSiblings.map(async (sibling) => {
        const childrenCount = await ctx.db
          .query("menuItems")
          .withIndex("by_workspace_parent", (q) => 
            q.eq("workspaceId", args.workspaceId).eq("parentId", sibling._id)
          )
          .filter((q) => q.eq(q.field("isVisible"), true))
          .take(1000)
          .then(children => children.length);

        return {
          ...sibling,
          childrenCount,
        };
      })
    );

    return siblingsWithChildren.sort((a, b) => a.order - b.order);
  },
});

// Get breadcrumb path for navigation
export const getBreadcrumbPath = query({
  args: {
    workspaceId: v.id("workspaces"),
    menuItemId: v.optional(v.id("menuItems")),
  },
  handler: async (ctx, args) => {
    // No auth required to build breadcrumbs beyond access validation handled in callers

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const breadcrumbs = [
      {
        id: args.workspaceId,
        name: workspace.name,
        type: "workspace",
        icon: "Building",
        parentId: null,
      }
    ];

    if (args.menuItemId) {
      // Build path from current item to root
      let currentItem = await ctx.db.get(args.menuItemId);
      const path = [];

      while (currentItem) {
        path.unshift({
          id: currentItem._id,
          name: currentItem.name,
          type: currentItem.type,
          icon: currentItem.icon,
          parentId: currentItem.parentId,
        });

        if (currentItem.parentId) {
          currentItem = await ctx.db.get(currentItem.parentId);
        } else {
          break;
        }
      }

      breadcrumbs.push(...path as any);
    }

    return breadcrumbs;
  },
});

// Create menu structure for workspace
export const createMenuStructure = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    structure: v.array(v.object({
      name: v.string(),
      slug: v.string(),
      type: v.union(v.literal("folder"), v.literal("route")),
      icon: v.optional(v.string()),
      path: v.optional(v.string()),
      component: v.optional(v.string()),
      order: v.number(),
      children: v.optional(v.array(v.object({
        name: v.string(),
        slug: v.string(),
        type: v.union(v.literal("folder"), v.literal("route")),
        icon: v.optional(v.string()),
        path: v.optional(v.string()),
        component: v.optional(v.string()),
        order: v.number(),
      }))),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS);

    const menuItemIds = [];

    for (const item of args.structure) {
      const parentId = await ctx.db.insert("menuItems", {
        workspaceId: args.workspaceId,
        name: item.name,
        slug: item.slug,
        type: item.type,
        icon: item.icon,
        path: item.path,
        component: item.component,
        order: item.order,
        isVisible: true,
        visibleForRoleIds: [],
      createdBy: userId,
      });

      menuItemIds.push(parentId);

      // Create children if they exist
      if (item.children) {
        for (const child of item.children) {
          const childId = await ctx.db.insert("menuItems", {
            workspaceId: args.workspaceId,
            parentId,
            name: child.name,
            slug: child.slug,
            type: child.type,
            icon: child.icon,
            path: child.path,
            component: child.component,
            order: child.order,
            isVisible: true,
            visibleForRoleIds: [],
            createdBy: userId,
      });
          menuItemIds.push(childId);
        }
      }
    }

    await logAuditEvent(ctx, {
      action: "menus.structure.created",
      workspaceId: args.workspaceId,
      actorUserId: userId,
      resourceType: "menu_item",
      resourceId: String(menuItemIds[0] ?? args.workspaceId),
      changes: { createdCount: menuItemIds.length },
    });

    return menuItemIds;
  },
});
