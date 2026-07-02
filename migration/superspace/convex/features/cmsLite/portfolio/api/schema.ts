import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  portfolioItems: defineTable({
    slug: v.string(),
    locale: v.string(),
    title: v.string(),
    description: v.optional(v.union(v.string(), v.null())),
    tags: v.array(v.string()),
    status: v.string(),
    metaTitle: v.optional(v.union(v.string(), v.null())),
    metaDescription: v.optional(v.union(v.string(), v.null())),
    metaKeywords: v.optional(v.union(v.array(v.string()), v.null())),
    category: v.optional(v.union(v.string(), v.null())),
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_slug_locale", ["slug", "locale"])
    .index("by_status_locale", ["status", "locale"])
    .index("by_status", ["status"]),
  portfolioImages: defineTable({
    portfolioId: v.id("portfolioItems"),
    imageUrl: v.string(),
    altText: v.optional(v.union(v.string(), v.null())),
    displayOrder: v.number(),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_portfolio_order", ["portfolioId", "displayOrder"]),
} as const;
