import { query } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";

/**
 * List navigation items with their children
 */
export const listItems = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
    status: v.optional(v.string()),
    parentKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const allItems = await ctx.db
      .query("navigationItems")
      .withIndex("by_order", (q) => q.eq("workspaceId", args.workspaceId))
      .order("asc")
      .take(2000);

    const items = allItems.filter((item) => {
      if (args.status && item.status !== args.status) {
        return false;
      }
      if (args.parentKey !== undefined) {
        return item.parentKey === args.parentKey;
      }
      return true;
    });

    const needChildren = args.parentKey === undefined;
    const childrenByParent = new Map<string, any[]>();

    if (needChildren) {
      for (const child of allItems) {
        if (!child.parentKey) continue;
        if (args.status && child.status !== args.status) continue;
        if (!childrenByParent.has(child.parentKey)) {
          childrenByParent.set(child.parentKey, []);
        }
        childrenByParent
          .get(child.parentKey)!
          .push(formatNavItem(child, args.locale));
      }
    }

    return items.map((item) => ({
      ...formatNavItem(item, args.locale),
      children: childrenByParent.get(item.key) || [],
    }));
  },
});

/**
 * Get navigation items by group
 */
export const getGroup = query({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db
      .query("navigationGroups")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    if (!group) {
      return null;
    }

    const allItems = await ctx.db
      .query("navigationItems")
      .withIndex("by_order", (q) => q.eq("workspaceId", args.workspaceId))
      .order("asc")
      .take(2000);

    const items = allItems.filter(
      (item) => item.status === "active" && !item.parentKey,
    );

    const childrenByParent = new Map<string, any[]>();
    for (const child of allItems) {
      if (!child.parentKey) continue;
      if (child.status !== "active") continue;
      if (!childrenByParent.has(child.parentKey)) {
        childrenByParent.set(child.parentKey, []);
      }
      childrenByParent
        .get(child.parentKey)!
        .push(formatNavItem(child, args.locale));
    }

    return {
      name: group.name,
      title: group.translations[args.locale]?.title || 
             group.translations["en"]?.title || 
             group.name,
      description: group.translations[args.locale]?.description ||
                  group.translations["en"]?.description,
      settings: group.settings,
      metadata: group.metadata,
      items: items
        .filter(item => group.items.includes(item.key))
        .map(item => ({
          ...formatNavItem(item, args.locale),
          children: childrenByParent.get(item.key) || [],
        })),
    };
  },
});

/**
 * List all navigation groups
 */
export const listGroups = query({
  args: {
    workspaceId: v.string(),
    locale: v.string(),
  },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("navigationGroups")
      .withIndex("by_order", (q) => q.eq("workspaceId", args.workspaceId))
      .order("asc")
      .take(2000);

    return groups.map(group => ({
      name: group.name,
      title: group.translations[args.locale]?.title || 
             group.translations["en"]?.title || 
             group.name,
      description: group.translations[args.locale]?.description ||
                  group.translations["en"]?.description,
      status: group.status,
      itemCount: group.items.length,
      settings: group.settings,
      metadata: group.metadata,
      updatedAt: group.updatedAt,
    }));
  },
});

// Helper function to format navigation item with translations
function formatNavItem(item: Doc<"navigationItems">, locale: string) {
  return {
    key: item.key,
    type: item.type,
    label: item.translations[locale]?.label || 
           item.translations["en"]?.label || 
           item.key,
    description: item.translations[locale]?.description ||
                item.translations["en"]?.description,
    ariaLabel: item.translations[locale]?.ariaLabel ||
               item.translations["en"]?.ariaLabel,
    path: item.path,
    isExternal: item.isExternal,
    target: item.target,
    icon: item.icon,
    data: item.data,
    metadata: item.metadata,
  };
}

