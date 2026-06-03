import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Singleton site config — owner identity + branding, written by the admin
  // Settings UI / onboarding, read by the public site. One row. Part of the
  // headless-core engine (type: lib/headless-core/settings.ts).
  siteSettings: defineTable({
    siteName: v.optional(v.string()),
    tagline: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    themeDefault: v.optional(v.string()), // "light" | "dark" | "system"
    logoUrl: v.optional(v.string()),
    faviconUrl: v.optional(v.string()),
    socials: v.optional(v.string()), // JSON string
    seoDescription: v.optional(v.string()),
    analyticsId: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
  }),

  // Add app tables here. Example:
  // notes: defineTable({
  //   userId: v.id("users"),
  //   title: v.string(),
  //   body: v.string(),
  //   createdAt: v.number(),
  // }).index("by_user", ["userId"]),
});
