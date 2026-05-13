import { v } from "convex/values";

// SEO override fields shared across blog/projects/portfolio rows.
// All optional — rows without these still render via fallback compose.
export const seoFieldsShape = {
  seoTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
  keywords: v.optional(v.array(v.string())),
  focusKeyphrase: v.optional(v.string()),
  ogImage: v.optional(v.string()),
  canonicalUrl: v.optional(v.string()),
  noindex: v.optional(v.boolean()),
  locale: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  author: v.optional(v.string()),
  structuredType: v.optional(v.string()),
};

export const seoPatchShape = {
  seoTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
  keywords: v.optional(v.array(v.string())),
  focusKeyphrase: v.optional(v.string()),
  ogImage: v.optional(v.string()),
  canonicalUrl: v.optional(v.string()),
  noindex: v.optional(v.boolean()),
  locale: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
  author: v.optional(v.string()),
  structuredType: v.optional(v.string()),
};
