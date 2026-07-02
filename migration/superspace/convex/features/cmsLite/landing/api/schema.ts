import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  landingContent: defineTable({
    workspaceId: v.string(),
    section: v.string(), // hero, features, testimonials, etc.
    locale: v.string(), // en, ar, etc.
    content: v.object({
      type: v.string(), // text, image, carousel, etc.
      title: v.optional(v.string()),
      subtitle: v.optional(v.string()),
      description: v.optional(v.string()),
      primaryCta: v.optional(v.object({
        text: v.string(),
        url: v.string(),
        variant: v.optional(v.string()),
      })),
      secondaryCta: v.optional(v.object({
        text: v.string(),
        url: v.string(),
        variant: v.optional(v.string()),
      })),
      media: v.optional(v.array(v.object({
        type: v.string(), // image, video
        url: v.string(),
        alt: v.optional(v.string()),
        caption: v.optional(v.string()),
      }))),
      items: v.optional(v.array(v.object({
        id: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        image: v.optional(v.string()),
        link: v.optional(v.string()),
      }))),
      layout: v.optional(v.object({
        style: v.optional(v.string()),
        columns: v.optional(v.number()),
        align: v.optional(v.string()),
      })),
      settings: v.optional(v.record(v.string(), v.any())),
    }),
    status: v.string(), // draft, published, archived
    publishedAt: v.optional(v.number()),
    publishedBy: v.optional(v.string()),
    metadata: v.optional(v.object({
      seo: v.optional(v.object({
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        keywords: v.optional(v.array(v.string())),
        image: v.optional(v.string()),
      })),
      schedule: v.optional(v.object({
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
      })),
      analytics: v.optional(v.object({
        views: v.optional(v.number()),
        clicks: v.optional(v.number()),
        lastViewedAt: v.optional(v.number()),
      })),
    })),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
  .index("by_workspace", ["workspaceId"])
  .index("by_section_locale", ["workspaceId", "section", "locale"])
  .index("by_status", ["workspaceId", "status"])
  .index("by_publish_date", ["workspaceId", "publishedAt"]),
});
