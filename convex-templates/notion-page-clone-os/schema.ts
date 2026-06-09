import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { notionTables } from "./features/notion/_schema";
import { commentsTables } from "./features/comments/_schema";

export default defineSchema({
  ...authTables,
  // Threaded comments on public docs (fleet-standard comments slice).
  ...commentsTables,
  // Whole-document workspace persistence (signed-in owner mode). The demo and
  // anonymous visitors run on localStorage; once the owner signs in, the
  // workspace state hydrates from + debounce-saves to `notion_docs`.
  ...notionTables,

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
    // Admin-menu signup policy: "open" (anyone may register) | "invite"
    // (signup requires inviteKey). Unset → legacy ADMIN_SIGNUP_KEY env / closed.
    signupPolicy: v.optional(v.string()),
    inviteKey: v.optional(v.string()),
  }),
});
