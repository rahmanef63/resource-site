import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { commentsTables } from "./features/comments/_schema";
import { notionTables } from "./features/notion/_schema";

// Agency Studio OS — full schema (Convex target).
// authTables = @convex-dev/auth. Content tables mirror the localStorage shape
// the frontend store used, so the Convex-backed store adapter maps 1:1.
export default defineSchema({
  ...authTables,
  ...commentsTables,
  ...notionTables,

  agencyProjects: defineTable({
    slug: v.string(),
    title: v.string(),
    client: v.string(),
    category: v.string(),
    cover: v.string(),
    icon: v.optional(v.string()),
    blurb: v.string(),
    brief: v.string(),
    outcome: v.string(),
    status: v.union(
      v.literal("discovery"),
      v.literal("design"),
      v.literal("build"),
      v.literal("delivered"),
      v.literal("archived"),
    ),
    publishedAt: v.number(),
    featured: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_featured", ["featured"]),

  agencyClients: defineTable({
    name: v.string(),
    industry: v.string(),
    contact: v.string(),
    email: v.string(),
    status: v.union(v.literal("active"), v.literal("prospect"), v.literal("alumni")),
    startedAt: v.number(),
    notes: v.string(),
  }).index("by_status", ["status"]),

  agencyServices: defineTable({
    slug: v.string(),
    name: v.string(),
    blurb: v.string(),
    priceLabel: v.string(),
    duration: v.string(),
    bullets: v.array(v.string()),
    featured: v.boolean(),
  }).index("by_slug", ["slug"]),

  agencyLeads: defineTable({
    name: v.string(),
    company: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    topic: v.string(),
    source: v.string(),
    budget: v.optional(v.string()),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("won"),
      v.literal("lost"),
    ),
    ts: v.number(),
  }).index("by_status", ["status"]),

  agencyArticles: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    category: v.union(
      v.literal("case-study"),
      v.literal("essay"),
      v.literal("field-notes"),
    ),
    author: v.string(),
    readMinutes: v.number(),
    publishedAt: v.number(),
    cover: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    heroEmoji: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  })
    .index("by_slug", ["slug"])
    .index("by_publishedAt", ["publishedAt"]),

  // postId is the FRONTEND article id (plain string) — comments match articles
  // client-side by id/title, no Convex FK. Keeps seed + restore trivial.
  agencyComments: defineTable({
    postId: v.string(),
    postTitle: v.string(),
    author: v.string(),
    email: v.string(),
    body: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("spam")),
    aiFlag: v.optional(v.union(v.literal("spam"), v.literal("toxic"), v.null())),
    ts: v.number(),
  }).index("by_status", ["status"]),

  agencySubscribers: defineTable({
    email: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("unsubscribed"),
    ),
    source: v.string(),
    ts: v.number(),
  }).index("by_email", ["email"]),

  agencyNewsletters: defineTable({
    subject: v.string(),
    preheader: v.string(),
    body: v.string(),
    status: v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent")),
    sentAt: v.number(),
    recipients: v.number(),
    ts: v.number(),
  }),

  // Singleton AI assistant config. One row.
  agencyAiConfig: defineTable({
    model: v.string(),
    tone: v.string(),
    temperature: v.number(),
    systemPrompt: v.string(),
    playgroundDraft: v.string(),
    playgroundResponse: v.string(),
  }),

  // Page-builder + landing: complex nested structures stored as blobs keyed by
  // the frontend's string id (PageEntry.id / LandingSection.id).
  pages: defineTable({
    entryId: v.string(),
    slug: v.string(),
    data: v.any(),
  })
    .index("by_entryId", ["entryId"])
    .index("by_slug", ["slug"]),

  landingSections: defineTable({
    sectionId: v.string(),
    data: v.any(),
  }).index("by_sectionId", ["sectionId"]),

  // Singleton site config — onboarding wizard + admin Settings write this.
  siteSettings: defineTable({
    siteName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    themeDefault: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    socials: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    analyticsId: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
  }),
});
