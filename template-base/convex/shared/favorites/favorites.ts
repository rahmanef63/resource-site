import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserByExternalId } from "../auth";

async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await getUserByExternalId(ctx, identity.subject);
  if (!user) throw new Error("User not found");
  return user;
}

export const addToFavorites = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.id("_table"),
    title: v.string(),
    description: v.optional(v.string()),
    url: v.string(),
    thumbnailUrl: v.optional(v.string()),
    folderId: v.optional(v.id("favoriteFolders")),
    tags: v.optional(v.array(v.string())),
    color: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    icon: v.optional(v.string()),
    badge: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    showInSidebar: v.optional(v.boolean()),
    showInDashboard: v.optional(v.boolean()),
    notifyOnUpdate: v.optional(v.boolean()),
    notifyOnComment: v.optional(v.boolean()),
    notifyOnStatusChange: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await ctx.db
      .query("favorites")
      .filter((q) => q.eq(q.field("entityType"), args.entityType))
      .filter((q) => q.eq(q.field("entityId"), args.entityId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();
    if (existing) throw new Error("Already added to favorites");

    const last = await ctx.db
      .query("favorites")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .first();
    const sortOrder = last ? last.sortOrder + 1 : 0;

    const favoriteId = await ctx.db.insert("favorites", {
      workspaceId: args.workspaceId,
      userId: user._id,
      entityType: args.entityType,
      entityId: args.entityId,
      title: args.title,
      description: args.description,
      url: args.url,
      thumbnailUrl: args.thumbnailUrl,
      folderId: args.folderId,
      tags: args.tags ?? [],
      color: args.color,
      metadata: args.metadata,
      icon: args.icon,
      badge: args.badge,
      isPublic: args.isPublic ?? false,
      sharedWith: [],
      isPinned: false,
      sortOrder,
      showInSidebar: args.showInSidebar ?? false,
      showInDashboard: args.showInDashboard ?? false,
      notifyOnUpdate: args.notifyOnUpdate ?? false,
      notifyOnComment: args.notifyOnComment ?? false,
      notifyOnStatusChange: args.notifyOnStatusChange ?? false,
      isTaxable: false, // unused in schema but keep placeholder? (not part of schema) -> omit
      isFeatured: false,
      isActive: true,
      accessedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any); // schema allows many fields; keep required ones

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (folder && folder.workspaceId === args.workspaceId) {
        await ctx.db.patch(args.folderId, {
          favoriteCount: folder.favoriteCount + 1,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true, favoriteId };
  },
});

export const removeFromFavorites = mutation({
  args: { favoriteId: v.id("favorites"), workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const favorite = await ctx.db.get(args.favoriteId);
    if (!favorite || favorite.workspaceId !== args.workspaceId) throw new Error("Favorite not found");
    if (favorite.userId !== user._id) throw new Error("Unauthorized");

    if (favorite.folderId) {
      const folder = await ctx.db.get(favorite.folderId);
      if (folder) {
        await ctx.db.patch(folder._id, {
          favoriteCount: Math.max(0, folder.favoriteCount - 1),
          updatedAt: Date.now(),
        });
      }
    }
    await ctx.db.delete(args.favoriteId);
    return { success: true };
  },
});

export const getUserFavorites = query({
  args: {
    workspaceId: v.union(v.id("workspaces"), v.string()), // Accept both ID and string for compatibility
    folderId: v.optional(v.id("favoriteFolders")),
    entityType: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await getUserByExternalId(ctx, identity.subject);
    if (!user) throw new Error("User not found");

    let favorites = await ctx.db
      .query("favorites")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    // Convert string workspaceId to ID format for comparison, or compare as string
    const workspaceIdStr = typeof args.workspaceId === "string" ? args.workspaceId : String(args.workspaceId);
    favorites = favorites.filter((f) => String(f.workspaceId) === workspaceIdStr);
    if (args.folderId) favorites = favorites.filter((f) => f.folderId === args.folderId);
    if (args.entityType) favorites = favorites.filter((f) => f.entityType === args.entityType);
    if (args.tags && args.tags.length) {
      favorites = favorites.filter((f) => args.tags!.some((tag) => f.tags.includes(tag)));
    }
    favorites.sort((a, b) => a.sortOrder - b.sortOrder);
    return args.limit ? favorites.slice(0, args.limit) : favorites;
  },
});

export const recordFavoriteAccess = mutation({
  args: { favoriteId: v.id("favorites"), workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const favorite = await ctx.db.get(args.favoriteId);
    if (!favorite || favorite.workspaceId !== args.workspaceId) throw new Error("Favorite not found");
    await ctx.db.patch(args.favoriteId, { accessedAt: Date.now() });
    if (favorite.folderId) {
      await ctx.db.patch(favorite.folderId, { lastUsedAt: Date.now() });
    }
    return { success: true };
  },
});

export const createFavoriteFolder = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("favoriteFolders")),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    emoji: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    isSystem: v.optional(v.boolean()),
    allowedUsers: v.optional(v.array(v.id("users"))),
    allowedRoles: v.optional(v.array(v.string())),
    isPinned: v.optional(v.boolean()),
    autoOrganize: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    let path = "/";
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (parent && parent.workspaceId === args.workspaceId) {
        path = `${parent.path}${parent.name}/`;
      }
    }
    path += args.name;

    const lastFolder = await ctx.db
      .query("favoriteFolders")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) => q.eq(q.field("parentId"), args.parentId))
      .order("desc")
      .first();
    const sortOrder = lastFolder ? lastFolder.sortOrder + 1 : 0;

    const folderId = await ctx.db.insert("favoriteFolders", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      emoji: args.emoji,
      parentId: args.parentId,
      path,
      isPublic: args.isPublic ?? false,
      isSystem: args.isSystem ?? false,
      allowedUsers: args.allowedUsers ?? [],
      allowedRoles: args.allowedRoles ?? [],
      isPinned: args.isPinned ?? false,
      sortOrder,
      autoOrganize: args.autoOrganize ?? false,
      maxFavorites: undefined,
      favoriteCount: 0,
      totalViews: 0,
      lastUsedAt: undefined,
      tags: args.tags ?? [],
      shareToken: undefined,
      shareExpiresAt: undefined,
      createdAt: Date.now(),
      createdBy: user._id,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return { success: true, folderId };
  },
});

/**
 * Toggle sidebar pin status for a favorite
 */
export const toggleSidebarPin = mutation({
  args: {
    favoriteId: v.id("favorites"),
    showInSidebar: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const favorite = await ctx.db.get(args.favoriteId);
    
    if (!favorite) throw new Error("Favorite not found");
    if (favorite.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.favoriteId, {
      showInSidebar: args.showInSidebar,
      isPinned: args.showInSidebar, // Also update isPinned for consistency
      updatedAt: Date.now(),
    });

    return { success: true, showInSidebar: args.showInSidebar };
  },
});

/**
 * Get pinned sidebar items for a workspace
 */
export const getPinnedSidebarItems = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await getUserByExternalId(ctx, identity.subject);
    if (!user) throw new Error("User not found");

    const favorites = await ctx.db
      .query("favorites")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    // Filter for sidebar-pinned items in this workspace
    const pinnedItems = favorites
      .filter((f) => f.workspaceId === args.workspaceId && (f.showInSidebar || f.isPinned))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return args.limit ? pinnedItems.slice(0, args.limit) : pinnedItems;
  },
});

/**
 * Reorder pinned sidebar items
 */
export const reorderPinnedItems = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    itemIds: v.array(v.id("favorites")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    for (let i = 0; i < args.itemIds.length; i++) {
      const favorite = await ctx.db.get(args.itemIds[i]);
      if (favorite && favorite.userId === user._id && favorite.workspaceId === args.workspaceId) {
        await ctx.db.patch(args.itemIds[i], {
          sortOrder: i,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
