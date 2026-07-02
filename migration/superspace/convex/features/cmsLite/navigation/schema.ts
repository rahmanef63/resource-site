import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const translations = v.array(
  v.object({
    locale: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
  })
);

const data = v.record(v.string(), v.any());
const metadata = v.record(v.string(), v.any());

export default defineSchema({
  navigationItems: defineTable({
    workspaceId: v.string(),
    key: v.string(),
    type: v.string(),
    status: v.union(v.literal("active"), v.literal("draft"), v.literal("inactive")),
    parentKey: v.optional(v.string()),
    translations,
    path: v.string(),
    isExternal: v.boolean(),
    target: v.optional(v.string()),
    icon: v.optional(v.string()),
    data: v.optional(data),
    metadata: v.optional(metadata),
  }).index("by_workspace", ["workspaceId"]),

  navigationGroups: defineTable({
    workspaceId: v.string(),
    name: v.string(),
    status: v.union(v.literal("active"), v.literal("draft"), v.literal("inactive")),
    translations,
    items: v.array(v.string()),
    settings: v.optional(v.record(v.string(), v.any())),
    metadata: v.optional(metadata),
  }).index("by_workspace", ["workspaceId"]),
});