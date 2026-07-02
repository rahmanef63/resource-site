import { defineTable } from "convex/server"
import { v } from "convex/values"

const cms_collections = defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  label: v.string(),
  fields: v.any(),
  access: v.optional(v.any()),
  draftsEnabled: v.optional(v.boolean()),
  versionsMaxPerDoc: v.optional(v.number()),
  localization: v.optional(v.object({
    enabled: v.boolean(),
    locales: v.array(v.string()),
  })),
  hooks: v.optional(v.any()),
  isActive: v.boolean(),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_slug", ["workspaceId", "slug"]);

const cms_globals = defineTable({
  workspaceId: v.id("workspaces"),
  slug: v.string(),
  label: v.string(),
  fields: v.any(),
  access: v.optional(v.any()),
  draftsEnabled: v.optional(v.boolean()),
  localization: v.optional(v.object({
    enabled: v.boolean(),
    locales: v.array(v.string()),
  })),
  isActive: v.boolean(),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_slug", ["workspaceId", "slug"]);

const cms_entries = defineTable({
  workspaceId: v.id("workspaces"),
  collectionId: v.id("cms_collections"),
  slug: v.optional(v.string()),
  data: v.any(),
  status: v.union(v.literal("draft"), v.literal("published")),
  publishedAt: v.optional(v.number()),
  locale: v.optional(v.string()),
  createdBy: v.id("users"),
  updatedBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_collection", ["collectionId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_slug", ["collectionId", "slug"])
  .index("bystatus", ["collectionId", "status"]);

const cms_global_data = defineTable({
  workspaceId: v.id("workspaces"),
  globalId: v.id("cms_globals"),
  data: v.any(),
  status: v.union(v.literal("draft"), v.literal("published")),
  publishedAt: v.optional(v.number()),
  locale: v.optional(v.string()),
  updatedBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_global", ["globalId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_globalstatus", ["globalId", "status"]);

const cms_versions = defineTable({
  workspaceId: v.id("workspaces"),
  targetType: v.union(v.literal("entry"), v.literal("global")),
  targetId: v.string(),
  versionNumber: v.number(),
  snapshot: v.any(),
  isDraft: v.boolean(),
  changeSummary: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_target", ["targetType", "targetId"])
  .index("by_workspace", ["workspaceId"]);

const cms_schedules = defineTable({
  workspaceId: v.id("workspaces"),
  targetType: v.union(v.literal("entry"), v.literal("global")),
  targetId: v.string(),
  action: v.union(v.literal("publish"), v.literal("unpublish")),
  scheduledAt: v.number(),
  payload: v.optional(v.any()),
  status: v.union(
    v.literal("pending"),
    v.literal("completed"),
    v.literal("failed")
  ),
  executedAt: v.optional(v.number()),
  error: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_target", ["targetType", "targetId"])
  .index("by_scheduled_at", ["status", "scheduledAt"]);

const cms_media_assets = defineTable({
  workspaceId: v.id("workspaces"),
  filename: v.string(),
  originalFilename: v.string(),
  mimeType: v.string(),
  size: v.number(),
  storage: v.string(),
  url: v.string(),
  metadata: v.optional(v.any()),
  alt: v.optional(v.string()),
  focalPoint: v.optional(v.object({
    x: v.number(),
    y: v.number(),
  })),
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_filename", ["workspaceId", "filename"]);

export const cmsTables = {
  cms_collections,
  cms_globals,
  cms_entries,
  cms_global_data,
  cms_versions,
  cms_schedules,
  cms_media_assets,
};
