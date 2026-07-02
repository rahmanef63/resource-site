import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  products: defineTable({
    workspaceId: v.optional(v.string()),
    slug: v.string(),
    titleId: v.string(),
    titleEn: v.string(),
    titleAr: v.string(),
    descId: v.optional(v.union(v.string(), v.null())),
    descEn: v.optional(v.union(v.string(), v.null())),
    descAr: v.optional(v.union(v.string(), v.null())),
    price: v.number(),
    currency: v.string(),
    paymentLink: v.optional(v.union(v.string(), v.null())),
    coverImage: v.optional(v.union(v.string(), v.null())),
    status: v.string(),
    metaTitle: v.optional(v.union(v.string(), v.null())),
    metaDescription: v.optional(v.union(v.string(), v.null())),
    metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
    scheduledActivateAt: v.optional(v.union(v.number(), v.null())),
    autoActivated: v.optional(v.boolean()),
    available: v.optional(v.boolean()),
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_slug", ["workspaceId", "slug"]),
  productRevisions: defineTable({
    workspaceId: v.optional(v.string()),
    productId: v.id("products"),
    slug: v.string(),
    titleId: v.string(),
    titleEn: v.string(),
    titleAr: v.string(),
    descId: v.optional(v.union(v.string(), v.null())),
    descEn: v.optional(v.union(v.string(), v.null())),
    descAr: v.optional(v.union(v.string(), v.null())),
    price: v.number(),
    currency: v.string(),
    paymentLink: v.optional(v.union(v.string(), v.null())),
    coverImage: v.optional(v.union(v.string(), v.null())),
    status: v.string(),
    metaTitle: v.optional(v.union(v.string(), v.null())),
    metaDescription: v.optional(v.union(v.string(), v.null())),
    metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
    available: v.optional(v.boolean()),
    createdBy: v.optional(v.union(v.string(), v.null())),
    revisionNote: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_product", ["productId"])
    .index("by_workspace", ["workspaceId"]),
} as const;
