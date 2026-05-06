/**
 * Favorites Schema
 * Provides bookmarking/favoriting functionality across all ERP modules
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Favorites
  favorites: defineTable({
    workspaceId: v.id("workspaces"),

    // User reference
    userId: v.id("users"),

    // Entity reference
    entityType: v.string(), // e.g., "invoices", "tasks", "projects", "reports"
    entityId: v.id("_table"),

    // Favorite details
    title: v.string(),
    description: v.optional(v.string()),
    url: v.string(), // Deep link URL
    thumbnailUrl: v.optional(v.string()),

    // Organization
    folderId: v.optional(v.id("favoriteFolders")),
    tags: v.array(v.string()),
    color: v.optional(v.string()), // Color code for visual organization

    // Access control
    isPublic: v.boolean(),
    sharedWith: v.array(v.id("users")), // Users this favorite is shared with

    // Metadata
    metadata: v.optional(v.record(v.string(), v.any())), // Module-specific metadata
    icon: v.optional(v.string()), // Icon name or URL
    badge: v.optional(v.string()), // Badge text (e.g., count, status)

    // Quick access settings
    isPinned: v.boolean(),
    sortOrder: v.number(),
    showInSidebar: v.boolean(),
    showInDashboard: v.boolean(),

    // Notifications
    notifyOnUpdate: v.boolean(),
    notifyOnComment: v.boolean(),
    notifyOnStatusChange: v.boolean(),

    // Timestamps
    createdAt: v.number(),
    accessedAt: v.number(), // Last accessed time
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId", "userId"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_entity", ["entityType", "entityId"]),

  // Favorite folders/collections
  favoriteFolders: defineTable({
    workspaceId: v.id("workspaces"),

    // Folder info
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    emoji: v.optional(v.string()),

    // Hierarchy
    parentId: v.optional(v.id("favoriteFolders")),
    path: v.string(), // e.g., "/Work/Projects/Active"

    // Access control
    isPublic: v.boolean(),
    isSystem: v.boolean(), // System-created folder
    allowedUsers: v.array(v.id("users")),
    allowedRoles: v.array(v.string()),

    // Settings
    isPinned: v.boolean(),
    sortOrder: v.number(),
    autoOrganize: v.boolean(), // Auto-organize rules
    maxFavorites: v.optional(v.number()),

    // Statistics
    favoriteCount: v.number(),
    totalViews: v.number(),
    lastUsedAt: v.optional(v.number()),

    // Sharing
    shareToken: v.optional(v.string()), // For shared folders
    shareExpiresAt: v.optional(v.number()),

    // Metadata
    tags: v.array(v.string()),

    // Audit
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId", "name"])
    .index("by_parent", ["workspaceId", "parentId"]),

  // Favorite analytics
  favoriteAnalytics: defineTable({
    workspaceId: v.id("workspaces"),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    date: v.number(),

    // Usage metrics
    totalFavorites: v.number(),
    activeUsers: v.number(),
    newFavorites: v.number(),
    deletedFavorites: v.number(),

    // Engagement metrics
    totalAccesses: v.number(),
    avgAccessesPerUser: v.number(),
    avgAccessesPerFavorite: v.number(),

    // Top entities
    mostFavoritedEntities: v.array(v.object({
      entityType: v.string(),
      entityId: v.id("_table"),
      count: v.number(),
    })),

    // Top users
    topUsers: v.array(v.object({
      userId: v.id("users"),
      favoriteCount: v.number(),
      accessCount: v.number(),
    })),

    // Folder metrics
    foldersByUsage: v.array(v.object({
      folderId: v.id("favoriteFolders"),
      folderName: v.string(),
      favoriteCount: v.number(),
      accessCount: v.number(),
    })),

    createdAt: v.number(),
  }).index("by_workspace_period", ["workspaceId", "period"]),

  // Quick access shortcuts
  favoriteShortcuts: defineTable({
    workspaceId: v.id("workspaces"),

    // Shortcut details
    userId: v.id("users"),
    favoriteId: v.id("favorites"),
    shortcutType: v.union(
      v.literal("sidebar"),
      v.literal("dashboard"),
      v.literal("toolbar"),
      v.literal("quick_add"),
      v.literal("hotkey")
    ),

    // Position/Settings
    position: v.number(), // Sort order
    isVisible: v.boolean(),

    // Hotkey specific
    hotkey: v.optional(v.string()), // e.g., "Ctrl+Shift+I"

    // Dashboard specific
    widgetType: v.optional(v.string()),
    widgetSize: v.optional(v.union(
      v.literal("small"),
      v.literal("medium"),
      v.literal("large")
    )),
    widgetPosition: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    })),

    // Created/Updated
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_type", ["userId", "shortcutType"])
    .index("by_favorite", ["favoriteId"]),
});
