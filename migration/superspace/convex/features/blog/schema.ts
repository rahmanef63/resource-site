import { defineTable } from "convex/server"
import { v } from "convex/values"

const postStatus = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("archived"),
)

export const blogTables = {
  blogPosts: defineTable({
    workspaceId: v.id("workspaces"),
    slug: v.string(),
    title: v.string(),
    excerpt: v.optional(v.string()),
    body: v.string(),
    locale: v.string(), // "id" | "en" | "id-ID" | "en-US"
    status: postStatus,
    category: v.optional(v.string()),
    tags: v.array(v.string()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    publishedAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
    authorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_workspace_slug", ["workspaceId", "slug"])
    .index("by_workspace_locale", ["workspaceId", "locale"])
    .index("by_workspace_published", ["workspaceId", "publishedAt"])
    .searchIndex("search_blog_posts", {
      searchField: "title",
      filterFields: ["workspaceId", "status", "locale"],
    }),

  blogCategories: defineTable({
    workspaceId: v.id("workspaces"),
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_slug", ["workspaceId", "slug"]),
}
