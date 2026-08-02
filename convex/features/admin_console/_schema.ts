// Schema fragment for the admin-console slice (net-new gap tables only).
//
// Everything else the console shows is read from peer-slice tables. Compose:
//
//   import { adminConsoleTables } from "./features/admin_console/_schema";
//   export default defineSchema({ ...adminConsoleTables, ...others });

import { defineTable } from "convex/server";
import { v } from "convex/values";

const leadStatus = v.union(
  v.literal("new"),
  v.literal("open"),
  v.literal("won"),
  v.literal("lost"),
);

export const adminConsoleTables = {
  ac_leads: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    source: v.string(),
    status: leadStatus,
    assignee: v.optional(v.string()),
    notes: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  ac_nav_items: defineTable({
    label: v.string(),
    href: v.string(),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("ac_nav_items")),
    order: v.number(),
    visible: v.boolean(),
    target: v.optional(v.string()),
  }).index("by_order", ["order"]),
};
