import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agencyProjects: defineTable({
    slug: v.string(),
    title: v.string(),
    client: v.string(),
    category: v.string(),
    cover: v.string(),
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
});
