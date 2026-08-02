// activity slice — schema extension.
//
// Spread `activityTables` into the consumer's root Convex schema:
//
//   import { activityTables } from "../features/activity/_schema";
//   export default defineSchema({
//     ...activityTables,
//     // ...your other tables
//   });
//
// Table name `activities` is the canonical SSOT — keep it stable across
// consumers so MCP tools + agent recipes round-trip.

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const categoryUnion = v.union(
  v.literal("code"),
  v.literal("ship"),
  v.literal("learn"),
  v.literal("design"),
  v.literal("ops"),
  v.literal("personal"),
);

export const sourceUnion = v.union(
  v.literal("manual"),
  v.literal("mcp"),
  v.literal("gpt"),
  v.literal("claude"),
);

export const visibilityUnion = v.union(
  v.literal("public"),
  v.literal("private"),
);

export const activityTables = {
  activities: defineTable({
    title: v.string(),
    summary: v.string(),
    category: categoryUnion,
    project: v.optional(v.string()),
    links: v.optional(
      v.array(v.object({ label: v.string(), url: v.string() })),
    ),
    tags: v.optional(v.array(v.string())),
    source: sourceUnion,
    occurredAt: v.number(),
    durationMin: v.optional(v.number()),
    visibility: visibilityUnion,
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_occurredAt", ["occurredAt"])
    .index("by_visibility_occurredAt", ["visibility", "occurredAt"]),
};
