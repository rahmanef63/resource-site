import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  posts: defineTable({
    workspaceId: v.optional(v.string()),
    slug: v.string(),
    locale: v.string(),
    title: v.string(),
    excerpt: v.optional(v.union(v.string(), v.null())),
    body: v.string(),
    coverImage: v.optional(v.union(v.string(), v.null())),
    status: v.string(),
    publishedAt: v.optional(v.union(v.number(), v.null())),
    metaTitle: v.optional(v.union(v.string(), v.null())),
    metaDescription: v.optional(v.union(v.string(), v.null())),
    metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
    scheduledPublishAt: v.optional(v.union(v.number(), v.null())),
    autoPublished: v.optional(v.boolean()),
  })
    .index("by_slug_locale", ["slug", "locale"])
    .index("by_status_locale_publishedAt", ["status", "locale", "publishedAt"])
    .index("by_status", ["status"])
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_slug_locale", ["workspaceId", "slug", "locale"]),
  postRevisions: defineTable({
    workspaceId: v.optional(v.string()),
    postId: v.id("posts"),
    slug: v.string(),
    locale: v.string(),
    title: v.string(),
    excerpt: v.optional(v.union(v.string(), v.null())),
    body: v.string(),
    coverImage: v.optional(v.union(v.string(), v.null())),
    status: v.string(),
    publishedAt: v.optional(v.union(v.number(), v.null())),
    metaTitle: v.optional(v.union(v.string(), v.null())),
    metaDescription: v.optional(v.union(v.string(), v.null())),
    metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
    createdBy: v.optional(v.union(v.string(), v.null())),
    revisionNote: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_post", ["postId"])
    .index("by_workspace", ["workspaceId"]),
} as const;
