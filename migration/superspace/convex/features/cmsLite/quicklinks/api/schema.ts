import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  quicklinks: defineTable({
    title: v.string(),
    url: v.string(),
    icon: v.optional(v.union(v.string(), v.null())),
    displayOrder: v.number(),
    active: v.boolean(),
  }).index("by_active_order", ["active", "displayOrder"]),
} as const;
