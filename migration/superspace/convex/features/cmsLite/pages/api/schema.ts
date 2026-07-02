import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * CMS Lite Pages Table
 * 
 * Stores dynamic pages with multi-language support.
 * Each page has a slug that can be in any language (English, Arabic, Russian, etc.)
 * and maps to a specific page component.
 */
export const pagesTable = defineTable({
  // Core identification
  slug: v.string(), // Can be any language: "hello", "مرحبا", "привет", "about", "tentang-kami"
  locale: v.string(), // Language code: "en", "id", "ar", "ru"
  
  // Page configuration
  pageType: v.union(
    v.literal("home"),
    v.literal("about"),
    v.literal("products"),
    v.literal("product-detail"),
    v.literal("blog"),
    v.literal("blog-post"),
    v.literal("portfolio"),
    v.literal("hello"),
    v.literal("custom")
  ),
  
  // Content
  title: v.string(),
  description: v.optional(v.string()),
  
  // SEO
  metaTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
  metaKeywords: v.optional(v.array(v.string())),
  
  // Display
  isPublished: v.boolean(),
  displayOrder: v.optional(v.number()),
  
  // Workspace & tracking
  workspaceId: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.optional(v.string()),
  updatedBy: v.optional(v.string()),
  
  // Additional metadata
  metadata: v.optional(v.record(v.string(), v.any())),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_slug", ["slug"])
  .index("by_locale", ["locale"])
  .index("by_workspace_slug", ["workspaceId", "slug"])
  .index("by_workspace_locale", ["workspaceId", "locale"])
  .index("by_published", ["isPublished"]);
