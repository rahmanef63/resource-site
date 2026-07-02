import { defineTable } from "convex/server";
import { v } from "convex/values";
import { pagesTable } from "./pages/api/schema";

// Common fields for all CMS entities
const commonFields = {
  createdBy: v.optional(v.union(v.string(), v.null())),
  updatedBy: v.optional(v.union(v.string(), v.null())),
  workspaceId: v.string(),
  status: v.union(v.literal("active"), v.literal("inactive"), v.literal("draft")),
  metadata: v.optional(v.record(v.string(), v.any())),
};

// Export pages table
export { pagesTable };

// Posts table
export const postsTable = defineTable({
  ...commonFields,
  slug: v.string(),
  title: v.string(),
  locale: v.string(),
  body: v.string(),
  publishedAt: v.optional(v.union(v.number(), v.null())),
  metaTitle: v.optional(v.union(v.string(), v.null())),
  metaDescription: v.optional(v.union(v.string(), v.null())),
})
.index("by_workspace", ["workspaceId"])
.index("by_status", ["status"])
.index("by_slug", ["slug"]);

// Navigation items table
export const navigationItemsTable = defineTable({
  ...commonFields,
  createdAt: v.number(),
  updatedAt: v.number(),
  displayOrder: v.number(),
  path: v.optional(v.string()),
  metadata: v.optional(v.object({
    roles: v.optional(v.array(v.string())),
    devices: v.optional(v.array(v.string())),
    analyticsId: v.optional(v.string()),
    customClass: v.optional(v.string()),
  })),
  icon: v.optional(v.string()),
  isExternal: v.boolean(),
})
.index("by_workspace", ["workspaceId"])
.index("by_status", ["status"]);

// Navigation groups table
export const navigationGroupsTable = defineTable({
  ...commonFields,
  createdAt: v.number(),
  updatedAt: v.number(),
  displayOrder: v.number(),
  settings: v.optional(v.object({
    theme: v.optional(v.string()),
    layout: v.optional(v.string()),
    sticky: v.optional(v.boolean()),
    maxDepth: v.optional(v.number()),
    expandBehavior: v.optional(v.string()),
  })),
})
.index("by_workspace", ["workspaceId"])
.index("by_status", ["status"]);