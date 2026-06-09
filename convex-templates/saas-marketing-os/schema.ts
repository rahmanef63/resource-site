import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { commentsTables } from "./features/comments/_schema";
import { notionTables } from "./features/notion/_schema";

// SaaS Marketing OS — full schema (Convex target).
// authTables = @convex-dev/auth. Content tables mirror the localStorage shape
// the frontend store used, so the Convex-backed store adapter maps 1:1.
export default defineSchema({
  ...authTables,
  ...commentsTables,
  ...notionTables,

  saasPricing: defineTable({
    name: v.string(),
    price: v.string(),
    period: v.string(),
    blurb: v.string(),
    bullets: v.array(v.string()),
    cta: v.object({ label: v.string(), href: v.string() }),
    featured: v.boolean(),
    icon: v.optional(v.string()),
  }),

  saasFeatures: defineTable({
    title: v.string(),
    blurb: v.string(),
    icon: v.string(),
  }),

  saasPosts: defineTable({
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    body: v.string(),
    author: v.string(),
    publishedAt: v.number(),
    tags: v.array(v.string()),
    cover: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("scheduled"), v.literal("published")),
    ),
  }).index("by_slug", ["slug"]),

  saasChangelog: defineTable({
    version: v.string(),
    date: v.number(),
    kind: v.union(v.literal("feature"), v.literal("fix"), v.literal("chore")),
    title: v.string(),
    body: v.string(),
  }),

  saasCustomers: defineTable({
    email: v.string(),
    name: v.string(),
    plan: v.union(v.literal("free"), v.literal("team"), v.literal("scale")),
    status: v.union(v.literal("trial"), v.literal("active"), v.literal("churned")),
    startedAt: v.number(),
  }).index("by_email", ["email"]),

  saasSubscriptions: defineTable({
    customerId: v.string(),
    customerEmail: v.string(),
    plan: v.union(v.literal("team"), v.literal("scale")),
    mrrCents: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("trialing"),
      v.literal("past_due"),
      v.literal("canceled"),
    ),
    renewsAt: v.number(),
  }),

  saasLeads: defineTable({
    email: v.string(),
    name: v.string(),
    source: v.union(
      v.literal("website"),
      v.literal("referral"),
      v.literal("ad"),
      v.literal("event"),
    ),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("won"),
      v.literal("lost"),
    ),
    ts: v.number(),
  }).index("by_status", ["status"]),

  saasIntegrations: defineTable({
    provider: v.union(
      v.literal("slack"),
      v.literal("linear"),
      v.literal("hubspot"),
      v.literal("resend"),
      v.literal("stripe"),
      v.literal("github"),
      v.literal("intercom"),
      v.literal("segment"),
    ),
    label: v.string(),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("error"),
    ),
    webhookUrl: v.string(),
    scopes: v.array(v.string()),
    lastSyncAt: v.number(),
    secretHint: v.string(),
    logo: v.optional(v.string()),
    notes: v.optional(v.string()),
  }),

  // Analytics KPI snapshots — tiny fixed seed (4 weekly samples).
  saasAnalytics: defineTable({
    week: v.string(),
    mrrCents: v.number(),
    newCustomers: v.number(),
    churnedCustomers: v.number(),
    trials: v.number(),
    trialsConverted: v.number(),
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
