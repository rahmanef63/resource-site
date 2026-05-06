import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Tables exported separately so the root convex/schema.ts can compose them
// alongside other features (e.g. studio). Default export retained for any
// caller that still wants the standalone schema definition.
export const notionTables = {
  // Notion's minimal workspace shape extended with hierarchy / display
  // fields the workspace UI (EnhancedWorkspaceSwitcher, HierarchySettings)
  // expects from superspace. All hierarchy fields optional so notion's
  // own workspace inserts (just userId/name/emoji) keep working.
  workspaces: defineTable({
    userId: v.id("users"),
    name: v.string(),
    emoji: v.string(),
    // Hierarchy + display extensions
    type: v.optional(
      v.union(
        v.literal("organization"),
        v.literal("institution"),
        v.literal("group"),
        v.literal("family"),
        v.literal("personal"),
      ),
    ),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    parentWorkspaceId: v.optional(v.id("workspaces")),
    isMainWorkspace: v.optional(v.boolean()),
    depth: v.optional(v.number()),
    materializedPath: v.optional(v.string()),
    lastActiveAt: v.optional(v.number()),
    organizationId: v.optional(v.string()),
    logo: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    themePreset: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
    updatedBy: v.optional(v.id("users")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentWorkspaceId"])
    .index("by_main", ["userId", "isMainWorkspace"]),

  pages: defineTable({
    userId: v.id("users"),
    parentId: v.union(v.string(), v.null()),
    title: v.string(),
    icon: v.string(),
    cover: v.union(v.string(), v.null()),
    blocks: v.array(v.any()),
    favorite: v.boolean(),
    trashed: v.boolean(),
    isPublic: v.optional(v.boolean()),
    rowOfDatabaseId: v.optional(v.string()),
    rowProps: v.optional(v.any()),
    font: v.optional(v.string()),
    smallText: v.optional(v.boolean()),
    fullWidth: v.optional(v.boolean()),
    locked: v.optional(v.boolean()),
    /** Denormalized title + flattened block text. Updated on every page write
     *  so Convex searchIndex can match body content, not just title. */
    searchText: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .searchIndex("search_content", {
      searchField: "searchText",
      filterFields: ["userId", "trashed"],
    }),

  databases: defineTable({
    userId: v.id("users"),
    name: v.string(),
    icon: v.string(),
    properties: v.array(v.any()),
    rowIds: v.array(v.string()),
    views: v.array(v.any()),
    activeViewId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    uniqueIdCounter: v.optional(v.number()),
    templates: v.optional(v.array(v.any())),
    defaultTemplateId: v.optional(v.union(v.string(), v.null())),
    subItemsParentPropId: v.optional(v.union(v.string(), v.null())),
    trashed: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["userId"],
    }),

  preferences: defineTable({
    userId: v.id("users"),
    theme: v.string(),
    sidebarDensity: v.string(),
    defaultPageSort: v.string(),
    editorBehavior: v.string(),
    landingView: v.string(),
    lastOpenedPageId: v.union(v.string(), v.null()),
  }).index("by_user", ["userId"]),

  snapshots: defineTable({
    userId: v.id("users"),
    pageId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    takenAt: v.number(),
    title: v.string(),
    icon: v.string(),
    cover: v.union(v.string(), v.null()),
    blocks: v.array(v.any()),
    rowProps: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_user_page", ["userId", "pageId"]),

  recents: defineTable({
    userId: v.id("users"),
    pageIds: v.array(v.string()),
  }).index("by_user", ["userId"]),

  // === inbox ===
  // Unified inbox table. Notion uses {kind, body, read, createdAt, pageId,
  // blockId, actor*}; studio uses {workspaceId, type, message, isRead,
  // createdBy}. Required only what both share (userId, title); the rest is
  // optional so each producer can populate its own subset.
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    // notion shape
    kind: v.optional(v.string()),
    body: v.optional(v.string()),
    pageId: v.optional(v.string()),
    blockId: v.optional(v.string()),
    actorName: v.optional(v.string()),
    actorIcon: v.optional(v.string()),
    read: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    // studio shape
    workspaceId: v.optional(v.id("workspaces")),
    type: v.optional(v.string()),
    message: v.optional(v.string()),
    isRead: v.optional(v.boolean()),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"])
    .index("by_workspace", ["workspaceId"]),

  // === notion-specific comments (page-block scoped) ===
  // Renamed from `comments` to coexist with the generic
  // `convex/shared/comments` table (workspace + entityType scoped, used by
  // other features). Notion comments are tightly bound to a page + block.
  notionComments: defineTable({
    userId: v.id("users"),                  // author
    pageId: v.string(),
    blockId: v.optional(v.string()),        // null = page-level comment
    text: v.string(),
    authorName: v.string(),
    authorIcon: v.string(),
    resolved: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_page", ["pageId"])
    .index("by_block", ["blockId"]),
};

export default defineSchema({
  ...authTables,
  ...notionTables,
});
