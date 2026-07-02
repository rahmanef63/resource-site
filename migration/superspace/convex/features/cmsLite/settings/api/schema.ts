import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  settings: defineTable({
    // workspaceId is v.optional for backward-compat with the legacy singleton
    // row created before the multi-tenant migration. The backfill in
    // ../../_backfill/migrateWorkspaceId.ts stamps the orphan row; once all
    // environments are migrated this can be flipped to v.string().
    workspaceId: v.optional(v.string()),
    brandName: v.string(),
    defaultLocale: v.string(),
    heroImage: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    instagram: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
  })
    .index("by_default_locale", ["defaultLocale"])
    .index("by_workspace", ["workspaceId"]),
} as const;
