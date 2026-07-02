import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  services: defineTable({
    workspaceId: v.optional(v.string()),
    slug: v.string(),
    displayOrder: v.number(),
    labelId: v.string(),
    labelEn: v.string(),
    labelAr: v.string(),
    active: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_order", ["active", "displayOrder"])
    .index("by_display_order", ["displayOrder"])
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_slug", ["workspaceId", "slug"]),
} as const;
